import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ResearchService } from '../../services/research.service';
import { Research, ResearchType } from '../../models/research.model';
import { DataPerformance } from '../../models/dashboard.model';
import { SearchService } from '../../services/search.service';
import {
  MajorSubjectArea,
  Organization,
  SubSubjectArea,
} from '../../models/search-get.model';
import { ResearchItem, SearchResearchRequest } from '../../models/search.model';

@Component({
  selector: 'app-user-research',
  standalone: false,
  templateUrl: './user-research.component.html',
  styleUrl: './user-research.component.css',
})
export class UserResearchComponent {
  openDropdown: string | null = null;
  isSearched = false;

  selectedType: string | null = null;
  selectedSubType: string | null = null;

  selectedFunding = '';
  selectedYear = '';
  researchTitle = '';
  searchSubType = '';
  searchText = '';
  researchItems = '';

  searchFaculitie = '';
  searchType = '';
  facultySearch: string = '';

  searchAgency: string = '';
  selectedAgency: Organization | null = null;
  subjectAre: MajorSubjectArea | null = null;

  startDate?: Date;
  endDate?: Date;

  fundingExternal = false;
  fundingInternal = false;

  researches: Research[] = [];

  loading = false;
  error: string | null = null;

  publications: DataPerformance = {
    research: [],
    article: [],
    innovation: [],
  };

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

  typeList = ['โครงการวิจัย', 'บทความ', 'วารสาร', 'นวัตกรรมสิ่งประดิษฐ์'];

  subTypeMap: any = {
    โครงการวิจัย: [],
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
  filteredResearchers: ResearchItem[] = [];
paginationData: ResearchItem[] = [];

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
    โครงการวิจัย: 'project',
    บทความ: 'article',
    วารสาร: 'research',
    นวัตกรรมสิ่งประดิษฐ์: 'innovation',
  };

  fundingMap: any = {
    internal: 'internal',
    external: 'external',
  };

  searchMajor: string = '';
  activeMajor: MajorSubjectArea | null = null;
  selectedSub: SubSubjectArea | null = null;
  selectedFaculty: string = '';
  activeDropdown: string | null = null;
  filteredMajors: MajorSubjectArea[] = [];

  subOrgan: MajorSubjectArea[] = [];
  organizations: Organization[] = [];

  searchResults: ResearchItem[] = [];
  allTableData: ResearchItem[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private researchService: ResearchService,
    private service: SearchService
  ) {}

  ngOnInit() {
    this.loadSubOrgan();
  }

  // ======= Load SubArea Organization && Load Researchs =======
  loadSubOrgan(): void {
    this.service.getData().subscribe({
      next: (res) => {
        this.subOrgan = res.data.subject_areas;
        this.organizations = res.data.organizations;
        console.log(res);
      },
    });
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
    this.activeDropdown = this.activeDropdown === name ? null : name;
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

    this.openDropdown = null;

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

  selectAgency(agency: Organization) {
    this.selectedAgency = agency;
    this.searchAgency = '';
    this.activeDropdown = null;
  }

  filteredAgency(): Organization[] {
    if (!this.searchAgency) return this.organizations;

    return this.organizations.filter((o) =>
      o.faculty.toLowerCase().includes(this.searchAgency.toLowerCase())
    );
  }

  filteredMajor(): MajorSubjectArea[] {
    if (!this.searchMajor) return this.subOrgan;

    const keyword = this.searchMajor.toLowerCase();
    return this.subOrgan.filter((m) => m.name_en.toLowerCase().includes(keyword));
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

  goToResearch(id: number, type: 'ARTICLE' | 'PROJECT' | 'INNOVATION') {

    const routeMap: any = {
      PROJECT: 'project',
      ARTICLE: 'article',
      INNOVATION: 'innovation'
    };
  
    const mappedType = routeMap[type];
  
    let basePath = '/performance';
  
    if (this.authService.isLoggedIn()) {
      basePath = this.authService.isAdmin()
        ? '/admin/performance'
        : '/user/performance';
    }
  
    this.router.navigate([basePath, mappedType, id]);
  }

  get displayRange(): string {
    if (!this.startDate || !this.endDate) return '';

    const format = (d: Date) =>
      `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

    return `${format(this.startDate)} - ${format(this.endDate)}`;
  }

  format(date: Date): string {
    return date.toLocaleDateString('en-GB');
  }

  onPickerClose() {
    if (this.startDate && !this.endDate) {
      this.endDate = this.startDate;
    }
  }

  onSearch(): void {
    const keyword = this.searchText.trim();
  
    // ✅ ถ้าลบหมดแล้ว → reload จาก backend
    if (!keyword) {
      this.search();
      return;
    }
  
    const lowerKeyword = keyword.toLowerCase();
  
    this.filteredResearchers = this.allTableData.filter((item) =>
      item.title_th?.toLowerCase().includes(lowerKeyword) ||
      item.title_en?.toLowerCase().includes(lowerKeyword) ||
      item.own?.name?.toLowerCase().includes(lowerKeyword) ||
      item.type.toLowerCase().includes(lowerKeyword)
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

  // loadAllResearchPublic() {
  //   this.loading = true;
  //   this.error = null;

  //   this.researchService.getPublicData().subscribe({
  //     next: (res) => {
  //       this.researches = [
  //         ...res.research.map((r) => ({ ...r, type: 'project' as const })),
  //         ...res.article.map((r) => ({ ...r, type: 'article' as const })),
  //         ...res.innovation.map((r) => ({ ...r, type: 'innovation' as const })),
  //       ];

  //       this.filteredResearchers = [...this.researches];

  //       this.updatePagination();
  //       this.prepareDonut();

  //       this.loading = false;
  //     },
  //     error: (err) => {
  //       this.error = 'ไม่สามารถโหลดข้อมูลได้';
  //       this.loading = false;
  //       console.error(err);
  //     },
  //   });
  // }

  formatThaiDate(date: Date): string {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.toLocaleDateString('th-TH', { month: 'long' });
    const year = d.getFullYear() + 543;

    return `${day} ${month} ${year}`;
  }

  search() {
    const payload: SearchResearchRequest = {};
  
    if (this.researchItems?.trim()) {
      payload.keyword = this.researchItems.trim();
    }
  
    if (this.selectedType) {
      payload.type = this.mapTypeToApi(this.selectedType);
    }
  
    if (this.selectedAgency?.id) {
      payload.organization_id = this.selectedAgency.id;
    }
  
    if (this.selectedSub?.sub_id) {
      payload.subject_area_id = this.selectedSub.sub_id;
    }
  
    if (this.startDate) {
      payload.year = this.startDate.getFullYear();
    }

    if (this.startDate) {
      payload.start_date = this.formatDateForApi(this.startDate);
    }
  
    if (this.endDate) {
      payload.end_date = this.formatDateForApi(this.endDate);
    }
  
    this.loading = true;
  
    this.service.searchData(payload).subscribe({
      next: (res) => {
        this.isSearched = true;
    
        const data = res.data;   // 👈 สำคัญมาก
    
        this.searchResults = data.result;
    
        this.filteredResearchers = data.result;
    
        // ✅ donut
        this.donutSeries = data.graph.map(g => g.count);
        this.donutLabels = data.graph.map(g => g.subject_area_name);
    
        this.totalResearchers = data.total;
    
        this.currentPage = 1;
        this.updatePagination();
      }
    });
  }

  formatDateForApi(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
  
    return `${yyyy}-${mm}-${dd}`;  // 2025-02-01
  }

  mapTypeToApi(type: string): 'ARTICLE' | 'PROJECT' | 'INNOVATION' {
    const map: any = {
      'บทความ': 'ARTICLE',
      'โครงการวิจัย': 'PROJECT',
      'นวัตกรรมสิ่งประดิษฐ์': 'INNOVATION'
    };
  
    return map[type];
  }

  trackById(index: number, item: any): number {
    return item.id;
  }

  // SUB
  selectSub(sub: SubSubjectArea): void {
    this.selectedSub = sub;
    this.selectedFaculty = sub.name_en;
    this.activeDropdown = null;
    this.activeMajor = null;
  }

  toggleMajor(major: MajorSubjectArea, event: Event): void {
    event.stopPropagation();
  
    this.activeMajor =
      this.activeMajor?.major_id === major.major_id ? null : major;
  }

  onSearchMajor(): void {
    const keyword = this.searchMajor.toLowerCase();
  
    this.filteredMajors = this.subOrgan.filter((m) =>
      m.name_en.toLowerCase().includes(keyword)
    );
  }

  getTypeLabel(type: 'ARTICLE' | 'PROJECT' | 'INNOVATION'): string {
    const map = {
      PROJECT: 'โครงการวิจัย',
      ARTICLE: 'บทความ / วารสาร',
      INNOVATION: 'นวัตกรรม'
    };
  
    return map[type] ?? '-';
  }
}
