import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

interface ExternalPerson {
  name: string;
  role: string;
  organization: string;
}
interface InternalPerson {
  name: string;
  organization: string;
}

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

  rows: ExternalPerson[] = [];
  rows2: InternalPerson[] = [];

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

  constructor(private route: ActivatedRoute, private router: Router) {}

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

    this.addRow();
    this.addRow2();
  }
  loadResearchData(id: number) {
    console.log('แก้ไขงานวิจัย ID:', id);

    // mock data (แทน API)
    this.rows = [
      { name: 'นาย A', role: 'ผู้เชี่ยวชาญ', organization: 'บริษัท ABC' },
    ];

    this.rows2 = [{ name: 'ดร. B', organization: 'มหาวิทยาลัย X' }];

    this.reportFileName = 'report.pdf';
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

  toggleDropdown(name: string, event: MouseEvent) {
    event.stopPropagation();
    this.openDropdown = this.openDropdown === name ? null : name;
  }

  isOpen(name: string): boolean {
    return this.openDropdown === name;
  }

  @HostListener('document:click')
  closeAll() {
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

  goToResearchDetail(type: string, id: number | string) {
    const role = localStorage.getItem('role');

    const base = role === 'admin' ? '/admin/performance' : '/user/performance';

    this.router.navigate([base, type, id]);
  }

  saveResearch() {
    // ✅ รวมข้อมูลทั้งหมด
    const payload = {};

    // ✅ เตรียม FormData (รองรับไฟล์)
    const formData = new FormData();
    formData.append('data', JSON.stringify(payload));
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
}
