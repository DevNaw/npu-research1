import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

export interface Research {
  id: number;
  type: 'article' | 'research' | 'innovation';
  subType?: string;
  faculty: string;
  agency: string;
  funding: 'internal' | 'external';
  year: number;
  date: Date;
  name: string;
  title: string;
}

@Component({
  selector: 'app-user-research',
  standalone: false,
  templateUrl: './user-research.component.html',
  styleUrl: './user-research.component.css',
})
export class UserResearchComponent {
  openDropdown: string | null = null;
  isSearched = false;

  selectedFaculty = '';
  selectedFunding = '';
  selectedYear = '';
  researchTitle = '';
  searchSubType = '';
  searchText = '';

  searchFaculitie = '';
  searchType = '';
  facultySearch: string = '';
  selectedType: string | null = null;
  selectedSubType: string | null = null;

  searchAgency = '';
  selectedAgency: string | null = null;

  researchItems = '';

  startDate?: Date;
  endDate?: Date;

  constructor(private router: Router, private authService: AuthService) {}

  /** ===== DATA (ตัวอย่าง) ===== */
  researches: Research[] = [
    {
      id: 1,
      type: 'article',
      subType: 'ประชุมวิชาการระดับนานาชาติ',
      faculty: 'คณะวิทยาศาสตร์',
      agency: 'คณะวิทยาศาสตร์',
      funding: 'internal',
      year: 2025,
      date: new Date('2025-01-10'), // ⭐
      name: 'นาย ก',
      title: 'ระบบ AI',
    },
    {
      id: 2,
      type: 'article',
      subType: 'ประชุมวิชาการระดับชาติ',
      faculty: 'คณะวิทยาศาสตร์',
      agency: 'คณะวิทยาศาสตร์',
      funding: 'internal',
      year: 2024,
      date: new Date('2024-11-05'),
      name: 'นาง ข',
      title: 'ชีววิทยาโมเลกุล',
    },
  ];

  faculties = [
    'คณะวิศวกรรมศาสตร์',
    'คณะวิทยาศาสตร์',
    'คณะครุศาสตร์',
    'คณะบริหารธุรกิจ',
    'คณะเทคโนโลยีสารสนเทศ',
    'คณะเทคโนโลยีสารสนเทศ',
    'คณะเทคโนโลยีสารสนเทศ',
    'คณะเทคโนโลยีสารสนเทศ',
  ];

  agency = [
    'คณะวิทยาศาสตร์',
    'คณะวิศวกรรมศาสตร์',
    'คณะเทคโนโลยีสารสนเทศ',
    'คณะบริหารธุรกิจ',
    'คณะมนุษยศาสตร์และสังคมศาสตร์',
    'คณะศึกษาศาสตร์',
    'คณะสาธารณสุขศาสตร์',
    'คณะพยาบาลศาสตร์',
    'คณะเกษตรศาสตร์',
    'คณะนิติศาสตร์',
    'บัณฑิตวิทยาลัย',
    'สำนักวิจัยและพัฒนา',
    'สถาบันวิจัยและนวัตกรรม',
  ];

  typeList = ['บทความ', 'วารสาร', 'นวัตกรรมสิ่งประดิษฐ์'];

  subTypeMap: any = {
    บทความ: ['ประชุมวิชาการระดับชาติ', 'ประชุมวิชาการระดับนานาชาติ'],
    วารสาร: ['วารสารในประเทศ', 'วารสารต่างประเทศ'],
    นวัตกรรมสิ่งประดิษฐ์: [], // ไม่มีตัวเลือกย่อย
  };

  dateRange: {
    start: Date | null;
    end: Date | null;
  } = {
    start: null,
    end: null,
  };

  /** ===== FILTERED (ตาราง + กราฟใช้ชุดนี้) ===== */
  filteredResearchers: Research[] = [];
  paginationData: Research[] = [];

  pageSize = 10;
  currentPage = 1;

  /** ===== DONUT CHART ===== */
  donutLabels: string[] = [];
  donutSeries: number[] = [];
  totalResearchers = 0;

  donutChart = {
    type: 'donut' as const,
    height: 300,
  };

  donutLegend = {
    position: 'bottom' as const,
  };

  typeMap: any = {
    บทความ: 'article',
    วารสาร: 'research',
    นวัตกรรมสิ่งประดิษฐ์: 'innovation',
  };

  fundingMap: any = {
    internal: 'internal',
    external: 'external',
  };

  search() {
    this.isSearched = true;

    this.filteredResearchers = this.researches.filter((r) => {
      const researchDate = new Date(r.date);

      const inDateRange =
        (!this.startDate || researchDate >= this.startDate) &&
        (!this.endDate || researchDate <= this.endDate);

      return (
        // ประเภท
        (!this.selectedType || r.type === this.selectedType) &&
        // ประเภทย่อย
        (!this.selectedSubType || r.subType === this.selectedSubType) &&
        // หน่วยงาน
        (!this.selectedAgency || r.agency === this.selectedAgency) &&
        // แหล่งทุน
        (!this.selectedFunding || r.funding === this.selectedFunding) &&
        // ปี
        (!this.selectedYear || r.year === +this.selectedYear) &&
        // คำค้น
        (!this.researchTitle ||
          r.title.toLowerCase().includes(this.researchTitle.toLowerCase())) &&
        // ⭐ ช่วงเวลา
        inDateRange
      );
    });

    this.prepareDonut();
  }

  /** ===== DONUT CALCULATION (อิงข้อมูลตารางจริง) ===== */
  prepareDonut() {
    const map: Record<string, number> = {};
    const typeLabelMap: Record<string, string> = {
      project: 'โครงการวิจัย',
      article: 'บทความ / วารสาร',
      innovation: 'นวัตกรรม',
    };

    this.filteredResearchers.forEach((r) => {
      map[r.type] = (map[r.type] || 0) + 1;
    });

    this.donutLabels = Object.keys(map).map(
      (type) => typeLabelMap[type] || type
    );

    this.donutSeries = Object.values(map);
    this.totalResearchers = this.filteredResearchers.length;
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

  selectFaculities(f: string) {
    this.selectedFaculty = f;
    this.openDropdown = null;
    this.searchFaculitie = '';
  }

  selectType(t: string) {
    this.selectedType = t;
    this.selectedSubType = null;
    this.searchType = '';
    this.searchSubType = '';

    // ปิด type
    this.openDropdown = null;

    // ถ้ามีประเภทย่อย → เปิด subType
    if (this.subTypeMap[t] && this.subTypeMap[t].length > 0) {
      setTimeout(() => {
        this.openDropdown = 'subType';
      }, 0);
    }
  }

  selectSubType(st: string) {
    this.selectedSubType = st;
    this.searchSubType = '';
    this.openDropdown = null;
  }

  selectAgency(a: string) {
    this.selectedAgency = a;
    this.searchAgency = '';
    this.openDropdown = null;
  }

  filteredAgency(): string[] {
    if (!this.searchAgency) return this.agency;

    return this.agency.filter((a) =>
      a.toLowerCase().includes(this.searchAgency.toLowerCase())
    );
  }

  filteredFaculties(): string[] {
    if (!this.searchFaculitie) return this.faculties;

    return this.faculties.filter((f) =>
      f.toLowerCase().includes(this.searchFaculitie.toLowerCase())
    );
  }

  filteredType() {
    return this.typeList.filter((t) =>
      t.toLowerCase().includes(this.searchType.toLowerCase())
    );
  }

  filteredSubType() {
    if (!this.selectedType) return [];
    return this.subTypeMap[this.selectedType].filter((st: string) =>
      st.toLowerCase().includes(this.searchSubType.toLowerCase())
    );
  }

  displaySelectedType(): string {
    if (!this.selectedType) {
      return 'เลือกประเภทผลงาน';
    }

    if (this.selectedSubType) {
      return `${this.selectedType} / ${this.selectedSubType}`;
    }

    return this.selectedType;
  }

  goToResearch(id: number, type: 'research' | 'article' | 'innovation') {
    let basePath = '/performance';

    if (this.authService.isLoggedIn()) {
      basePath = this.authService.isAdmin()
        ? '/admin/performance'
        : 'user/performance';
    }

    this.router.navigate([basePath, type, id]);
  }

  get displayRange(): string {
    if (!this.startDate || !this.endDate) return '';

    const format = (d: Date) =>
      `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

    return `${format(this.startDate)} - ${format(this.endDate)}`;
  }

  format(date: Date): string {
    return date.toLocaleDateString('en-GB'); // dd/mm/yyyy
  }

  onPickerClose() {
    // ถ้าเลือกวันเดียว ให้ endDate = startDate
    if (this.startDate && !this.endDate) {
      this.endDate = this.startDate;
    }
  }

  onSearch(): void {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredResearchers = this.researches.filter(
      (items) =>
        items.type.toLowerCase().includes(keyword) ||
        items.faculty.toLowerCase().includes(keyword) ||
        items.funding.toLowerCase().includes(keyword) ||
        items.title.toLowerCase().includes(keyword)
      // items.year.toLowerCase().includes(keyword)
    );

    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.paginationData = this.filteredResearchers.slice(start, end);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    if (page === this.currentPage) return;
  
    this.currentPage = page;
    this.updatePagination();
  }

  get totalPages(): number {
    return Math.ceil(this.filteredResearchers.length / this.pageSize);
  }
  get totalItems(): number {
    return this.filteredResearchers.length;
  }
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
