import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import {
  Responsibility,
  ResponsibilityRole,
  InternalPerson,
  ExternalPerson,
} from '../../models/add.research.model';

import { ResearchData } from '../../models/research.model';
import { ResearchService } from '../../services/research.service';

@Component({
  selector: 'app-user-add-research',
  standalone: false,
  templateUrl: './user-add-research.component.html',
  styleUrl: './user-add-research.component.css',
})
export class UserAddResearchComponent {
  openDropdown: string | null = null;
  isEdit = false;
  researchId?: number;

  reportFileName = '';
  selectedFileName = '';
  selectedMajor = '';
  searchMajor = '';

  activeDropdown:
    | 'major'
    | 'responsibility'
    | 'internal'
    | 'external'
    | 'funding'
    | 'fundName'
    | 'status'
    | null = null;

  isResponsibilityOpen = false;
  openInternalIndex: number | null = null;
  openExternalIndex: number | null = null;
  openStatus: number | null = null;

  researchData: ResearchData = {
    id: 0,
    title_th: '',
    title_en: '',
    abstract: '',
    year: '',
    published_date: '',
    call_other: '',
    image: null,
    source_funds: '',
    name_funding: '',
    budget_amount: '',
    budget: '',
    year_received_budget: '',
    research_area: '',
    usable_area: '',
    start_date: '',
    end_date: '',
    internal_members: [],
    external_members: [],
    full_report: null,
    contract_file: null,
  };

  rows: ExternalPerson[] = [
    {
      name: '',
      role: '',
      organization: '',
    },
  ];

  rows2: InternalPerson[] = [
    {
      name: '',
      organization: '',
    },
  ];

  internalPeople: InternalPerson[] = [];
  externalPeople: ExternalPerson[] = [];

  responsibilityRoles: ResponsibilityRole[] = [
    'ที่ปรึกษา',
    'ผู้เชี่ยวชาญ',
    'กรรมการ',
  ];

  isResponsibility = false;
  isResponsibilityOfInternal = false;
  isResponsibilityOfExternal = false;

  major = [
    'วิทยาการคอมพิวเตอร์',
    'เทคโนโลยีสารสนเทศ',
    'วิศวกรรมซอฟต์แวร์',
    'ระบบสารสนเทศเพื่อการจัดการ',
    'ปัญญาประดิษฐ์และวิทยาการข้อมูล',
  ];

  fundType: string = '';
  fundName: string = '';

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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reseachService: ResearchService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (id) {
        this.isEdit = true;
        this.researchId = +id;
        this.loadResearchData(this.researchId);
      } else {
        this.isEdit = false;
      }
    });

    this.addInternal();
    this.addExternal();
  }

  submit() {
    Swal.fire({
      title: 'กรุณารอสักครู่',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.reseachService.createResearch(this.researchData).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Successfully',
          showConfirmButton: false,
          timer: 1000,
        });
      },
      error(err) {
        Swal.fire({
          icon: 'error',
          title: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
          text: err.error.message || 'กรุณาลองใหม่อีกครั้ง',
          showCancelButton: false,
        });
      },
    });
  }

  loadResearchData(id: number) {
    console.log('แก้ไขงานวิจัย ID:', id);

    // mock data (แทน API)
    // this.rows = [
    //   { name: 'นาย A', role: 'ผู้เชี่ยวชาญ', organization: 'บริษัท ABC' },
    // ];

    // this.rows2 = [{ name: 'ดร. B', organization: 'มหาวิทยาลัย X' }];

    // this.reportFileName = 'report.pdf';
  }

  addInternal() {
    this.internalMembers.push({
      name: '',
      organization: '',
    });
  }

  addExternal() {
    this.externalMembers.push({
      name: '',
      organization: '',
      role: '',
    });
  }

  removeInternal(index: number) {
    if (this.internalPeople.length > 1) {
      this.internalPeople.splice(index, 1);
    }
  }

  // toggleInternal(index: number, event: Event) {
  //   event.stopPropagation();
  //   this.openInternalIndex =
  //     this.openInternalIndex === index ? null : index;
  // }

  selectInternalRole(role: string, member: any) {
    member.organization = role;
    this.openInternalIndex = null;
  }

  selectExternalRole(role: string, member: any) {
    member.organization = role;
    this.openExternalIndex = null;
  }

  toggleInternal(index: number, event: Event) {
    event.stopPropagation();
    this.activeDropdown = 'internal';
    this.openInternalIndex = this.openInternalIndex === index ? null : index;
  }

  toggleExternal(index: number, event: Event) {
    event.stopPropagation();
    this.activeDropdown = 'external';
    this.openExternalIndex = this.openExternalIndex === index ? null : index;
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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
    }
  }

  reportFile: File | null = null;

  onReportFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.reportFile = input.files[0];
      this.reportFileName = this.reportFile.name;
    }
  }

  toggleDropdown(type: string, event: MouseEvent) {
    event.stopPropagation();
    this.openDropdown = this.openDropdown === type ? null : type;
  }

  toggleMajor(event: Event) {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === 'major' ? null : 'major';
  }

  toggleStatus(event: Event) {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === 'status' ? null : 'status';
  }

  selectStatus(status: string) {
    // this.researchData.status = status;
    this.activeDropdown = null;
  }

  toggleResponsibility(event: Event) {
    event.stopPropagation();
    this.activeDropdown =
      this.activeDropdown === 'responsibility' ? null : 'responsibility';
  }

  selectResponsibility(value: string) {
    // this.researchData.responsibility = value;
    this.activeDropdown = null;
  }

  isOpen(type: string): boolean {
    return this.openDropdown === type;
  }

  @HostListener('document:click')
  closeAllDropdowns() {
    this.activeDropdown = null;
    this.openInternalIndex = null;
  }

  onDocumentClick() {
    this.isResponsibility = false;
  }

  selectMajor(m: string) {
    this.selectedMajor = m;
    this.openDropdown = null;
    this.searchMajor = '';
  }

  // selectResponsibilityOfInternal(
  //   value: ResponsibilityOfInternal,
  //   person: InternalPerson
  // ) {
  //   person.organization = value;
  //   this.isResponsibilityOfInternal = false;
  // }

  filteredMajor(): string[] {
    if (!this.searchMajor) return this.major;

    return this.major.filter((m) =>
      m.toLowerCase().includes(this.searchMajor.toLowerCase())
    );
  }

  goToResearchDetail(type: string, id: number | string) {
    const role = localStorage.getItem('role');

    const base = role === 'admin' ? '/admin/performance' : '/user/performance';

    this.router.navigate([base, type, id]);
  }

  // ===== dropdown control =====
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
    // this.researchData.funding = type;
    this.fundName = ''; // reset ชื่อแหล่งทุน
    this.activeDropdown = null;
  }

  // ===== select fund name =====
  selectFundName(name: string) {
    this.fundName = name;
    this.activeDropdown = null;
  }

  // ดึงข้อมูล
  getDataResearch() {
    this.reseachService.getPublicData().subscribe({
      next: (res) => {
      }
    });
  }  
}
