import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import {
  Responsibility,
  ResponsibilityRole,
  InternalPerson,
  ExternalPerson,
  ResearchData,
} from '../../models/add.research.model';

@Component({
  selector: 'app-user-add-innovation',
  standalone: false,
  templateUrl: './user-add-innovation.component.html',
  styleUrl: './user-add-innovation.component.css',
})
export class UserAddInnovationComponent {
  openDropdown: string | null = null;
  isEdit = false;
  researchId?: number;
  selectedMajor = '';
  searchMajor = '';

  fundType: string = '';
  fundName: string = '';

  isResponsibility = false;
  isResponsibilityOfInternal = false;
  isResponsibilityOfExternal = false;

  internalPeople: InternalPerson[] = [];
  externalPeople: ExternalPerson[] = [];

  activeDropdown:
    | 'type'
    | 'major'
    | 'responsibility'
    | 'quality'
    | 'internal'
    | 'external'
    | 'status'
    | 'fundName'
    | 'funding'
    | null = null;

  responsibilityRoles: ResponsibilityRole[] = [
    'ที่ปรึกษา',
    'ผู้เชี่ยวชาญ',
    'กรรมการ',
  ];

  openInternalIndex: number | null = null;
  openExternalIndex: number | null = null;
  openStatus: number | null = null;

  rows: ExternalPerson[] = [{ name: '', role: '', organization: '' }];
  rows2: InternalPerson[] = [
    {
      name: '',
      organization: '',
    },
  ];

  internalMembers = [
    {
      name: '',
      organization: '',
    },
  ];

  externalMembers = [
    {
      name: '',
      organization: '',
      role: '',
    },
  ];

  major = [
    'วิทยาการคอมพิวเตอร์',
    'เทคโนโลยีสารสนเทศ',
    'วิศวกรรมซอฟต์แวร์',
    'ระบบสารสนเทศเพื่อการจัดการ',
    'ปัญญาประดิษฐ์และวิทยาการข้อมูล',
  ];

  internalFunds: string[] = [
    'งบประมาณมหาวิทยาลัย',
    'กองทุนวิจัยมหาวิทยาลัย',
    'คณะ/วิทยาลัย',
  ];

  externalFunds: string[] = [
    'สำนักงานการวิจัยแห่งชาติ (วช.)',
    'สกสว.',
    'กระทรวงการอุดมศึกษา',
    'หน่วยงานเอกชน',
  ];

  innovation = {
    responsibility: '',
    type: '',
    quality: '',
    status: '',
    funding: '',
  }

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (id) {
        this.isEdit = true;
        this.researchId = +id;
        this.loadInnovationData(this.researchId);
      } else {
        this.isEdit = false;
      }
    });

    // this.addRow();
    // this.addRow2();
    this.addInternal();
    this.addExternal();
  }

  addInternal() {
    this.internalMembers.push({
      name: '',
      organization: '',
    })
  }

  addExternal() {
    this.externalMembers.push({
      name: '',
      organization: '',
      role: ''
    })
  }

  removeInternal(index: number) {
    if (this.internalPeople.length > 1) {
      this.internalPeople.splice(index, 1);
    }
  }

  loadInnovationData(id: number) {
    this.rows = [
      { name: 'นาย A', role: 'ผู้เชี่ยวชาญ', organization: 'บริษัท ABC' },
    ];

    // this.rows2 = [{ name: 'ดร. B', organization: 'มหาวิทยาลัย X' }];

    // this.reportFileName = 'report.pdf';
  }

  addRow() {
    this.rows = [
      ...this.rows,
      {
        name: '',
        role: '',
        organization: '',
      },
    ];
  }
  removeRow(index: number) {
    // กันไม่ให้ลบแถวสุดท้าย
    if (this.rows.length > 1) {
      this.rows.splice(index, 1);
    }
  }

  addRow2() {
    this.rows2 = [
      ...this.rows2,
      {
        name: '',
        organization: '',
      },
    ];
  }
  removeRow2(index: number) {
    // กันไม่ให้ลบแถวสุดท้าย
    if (this.rows2.length > 1) {
      this.rows2.splice(index, 1);
    }
  }

  trackByIndex(index: number) {
    return index;
  }

  selectedFile: File | null = null;
  selectedFileName = '';

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
    }
  }
  reportFile: File | null = null;
  reportFileName = '';

  onReportFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.reportFile = input.files[0];
      this.reportFileName = this.reportFile.name;
    }
  }

  toggleDropdown(name: string, event: MouseEvent) {
    event.stopPropagation();
    this.openDropdown = this.openDropdown === name ? null : name;
  }

  isOpen(n: string): boolean {
    return this.openDropdown === n;
  }

  @HostListener('document:click')
  closeAll() {
    this.activeDropdown = null;
    this.openDropdown = null;
  }

  selectMajor(m: string) {
    this.selectedMajor = m;
    this.openDropdown = null;
    this.searchMajor = '';
  }

  filteredMajor(): string[] {
    if (!this.searchMajor) return this.major;

    return this.major.filter((m) =>
      m.toLowerCase().includes(this.searchMajor.toLowerCase())
    );
  }

  saveData() {
    Swal.fire({
      icon: 'success',
      title: 'บันทึกข้อมูลสำเร็จ',
      text: 'ระบบได้บันทึกข้อมูลเรียบร้อยแล้ว',
      showConfirmButton: false,
      timer: 1500,
      customClass: {
        title: 'swal-title-lg',
        htmlContainer: 'swal-text-2xl',
      },
    });
  }

  toggleInternal(index: number, event: Event) {
    event.stopPropagation();
    this.activeDropdown = 'internal';
    this.openInternalIndex = this.openInternalIndex === index ? null : index;
  }

  toggleExternal(index:number, event: Event) {
    event.stopPropagation();
    this.activeDropdown = 'external';
    this.openExternalIndex = this.openExternalIndex === index ? null : index;
  }

  toggleType(event: Event) {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === 'type' ? null : 'type'
  }

  toggleResponsibility(event: Event) {
    event.stopPropagation();
    this.activeDropdown =
      this.activeDropdown === 'responsibility' ? null : 'responsibility';
  }
  toggleStatus(event: Event) {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === 'status' ? null : 'status';
  }

  selectStatus(status: string) {
    this.innovation.status = status;
    this.activeDropdown = null;
  }

  selectInternalRole(role: string, member: any) {
    member.organization = role;
    this.openInternalIndex = null;
  }

  selectExternalRole(role: string, member: any) {
    member.organization = role;
    this.openExternalIndex = null;
  }
  selectResponsibility(value: string) {
    this.innovation.responsibility = value;
    this.activeDropdown = null;
  }

  toggleFunding(event: MouseEvent) {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === 'funding' ? null : 'funding';
  }

  toggleNameFunding(event: MouseEvent) {
    event.stopPropagation();
    this.activeDropdown =
      this.activeDropdown === 'fundName' ? null : 'fundName';
  }

  // ===== select funding =====
  selectFunding(type: string) {
    this.innovation.funding = type;
    this.fundName = ''; // reset ชื่อแหล่งทุน
    this.activeDropdown = null;
  }

  // ===== select fund name =====
  selectFundName(name: string) {
    this.fundName = name;
    this.activeDropdown = null;
  }
}
