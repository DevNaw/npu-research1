import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SearchService } from '../../services/search.service';
import {
  OecdChild,
  OecdMajor,
  OecdSub,
  Organization,
} from '../../models/search-get.model';
import { ResearchItem, SearchResearchRequest } from '../../models/search.model';
import { MainComponent } from '../../shared/layouts/main/main.component';
import { Funding } from '../../models/funding.model';
import { FundingService } from '../../services/funding.service';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Color, LegendPosition, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-admin-search-paper',
  standalone: false,
  templateUrl: './admin-search-paper.component.html',
  styleUrl: './admin-search-paper.component.css',
})
export class AdminSearchPaperComponent {
  activeDropdown: string | null = null;

  // ── Search inputs ──────────────────────────────────────────
  researchItems = '';
  searchText = '';

  // ── Type / SubType ─────────────────────────────────────────
  selectedType: string | null = null;
  selectedSubType: string | null = null;
  searchType = '';
  searchSubType = '';

  typeList = [
    'ทั้งหมด',
    'โครงการวิจัย',
    'บทความ',
    'วารสาร',
    'นวัตกรรมสิ่งประดิษฐ์',
  ];

  subTypeMap: Record<string, string[]> = {
    โครงการวิจัย: [],
    บทความ: [
      'ประเภทย่อยทั้งหมด',
      'ประชุมวิชาการระดับชาติ',
      'ประชุมวิชาการระดับนานาชาติ',
    ],
    วารสาร: ['ประเภทย่อยทั้งหมด', 'TCI', 'Scopus'],
    นวัตกรรมสิ่งประดิษฐ์: [],
  };

  // ── OECD ───────────────────────────────────────────────────
  major: OecdMajor[] = [];
  selectedMajor: OecdMajor | null = null;
  selectedSub: OecdSub | null = null;
  selectedSubSub: OecdChild | null = null;
  searchMajor = '';
  searchSub = '';
  searchSubSub = '';

  // ── Agency ─────────────────────────────────────────────────
  organizations: Organization[] = [];
  selectedAgency: Organization | null = null;
  searchAgency = '';

  // ── Funding ────────────────────────────────────────────────
  fundings: Funding[] = [];
  selectedFunding: 'แหล่งทุนทั้งหมด' | 'แหล่งทุนภายใน' | 'แหล่งทุนภายนอก' | null = null;
  selectedFundingSource: Funding | null = null;

  // ── Date / Year ────────────────────────────────────────────
  dateRange: { start: Date | null; end: Date | null } = { start: null, end: null };
  selectedYear: number | null = null;
  thaiYears: number[] = [];

  // ── Table / Pagination ─────────────────────────────────────
  allTableData: ResearchItem[] = [];
  filteredResearchers: ResearchItem[] = [];
  paginationData: ResearchItem[] = [];
  currentPage = 1;
  pageSize = 10;
  isSearched = false;
  loading = false;

  // ── Chart ──────────────────────────────────────────────────
  single: { name: string; value: number }[] = [];
  donutLabels: string[] = [];
  donutSeries: number[] = [];
  totalResearchers = 0;
  hasData = false;
  legendPosition: LegendPosition = LegendPosition.Below;

  colorScheme: Color = {
    name: 'horizon',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: [
      '#FF6B6B', '#4ECDC4', '#FFD93D', '#1A73E8', '#6C5CE7',
      '#00B894', '#FDCB6E', '#E17055', '#0984E3', '#A29BFE',
      '#00CEC9', '#FAB1A0', '#2D3436', '#E84393', '#636E72',
      '#55EFC4', '#FD79A8', '#74B9FF', '#81ECEC', '#FFEAA7',
      '#D63031', '#00A8FF', '#9C88FF', '#44BD32', '#FBC531',
    ],
  };

  labelFormat = (name: string): string => {
    const item = this.single.find((d) => d.name === name);
    if (!item) return name;
    const total = this.single.reduce((sum, d) => sum + d.value, 0);
    const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
    return `${name}\n${percent}%`;
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private service: SearchService,
    private fundingService: FundingService
  ) {}

  // ============================================================
  // Lifecycle
  // ============================================================

  ngOnInit() {
    MainComponent.showLoading();
    Promise.all([
      this.loadSubOrgan(),
      this.loadFundings(),
      this.generateThaiYears(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => MainComponent.hideLoading());
  }

  // ============================================================
  // Data loading
  // ============================================================

  loadSubOrgan(): void {
    this.service.getData().subscribe({
      next: (res) => {
        this.major = res.data.oecd;
        this.organizations = res.data.organizations;
      },
    });
  }

  loadFundings(): void {
    this.fundingService.getFundings().subscribe({
      next: (res) => {
        this.fundings = res.data.fundings;
      },
      error: (err) => {
        console.error('Failed to load fundings:', err);
      },
    });
  }

  // ============================================================
  // Dropdown helpers
  // ============================================================

  toggleDropdown(name: string, event: MouseEvent) {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === name ? null : name;
  }

  isOpen(name: string): boolean {
    return this.activeDropdown === name;
  }

  displaySelectedType(): string {
    if (!this.selectedType) return 'เลือกประเภทผลงาน';
    return this.selectedSubType
      ? `${this.selectedType} / ${this.selectedSubType}`
      : this.selectedType;
  }

  // ============================================================
  // Select
  // ============================================================

  selectType(t: string) {
    this.selectedType = t;
    this.selectedSubType = null;
    this.searchType = '';
    this.searchSubType = '';
    this.activeDropdown = null;
  }

  selectSubType(st: string) {
    this.selectedSubType = st;
    this.searchSubType = '';
    this.activeDropdown = null;
  }

  selectMajor(major: OecdMajor | { major_id: null; name_th: string }) {
    this.selectedMajor = major.major_id === null ? null : (major as OecdMajor);
    this.searchMajor = '';
    this.selectedSub = null;
    this.selectedSubSub = null;
    this.activeDropdown = null;
  }

  selectSub(sub: OecdSub) {
    this.selectedSub = sub;
    this.searchSub = '';
    this.selectedSubSub = null;
    this.activeDropdown = null;
  }

  selectSubSub(subSub: OecdChild) {
    this.selectedSubSub = subSub;
    this.searchSubSub = '';
    this.activeDropdown = null;
  }

  selectFundingSource(funding: Funding) {
    this.selectedFundingSource = funding;
    this.activeDropdown = null;
  }

  selectAgency(org: Organization | { id: null; faculty: string }) {
    this.selectedAgency = org.id === null ? null : (org as Organization);
    this.searchAgency = '';
    this.activeDropdown = null;
  }

  selectYear(year: number) {
    this.selectedYear = year;
    this.activeDropdown = null;
  }

  // ============================================================
  // Filter lists
  // ============================================================

  filteredType(): string[] {
    return this.typeList.filter((t) =>
      t.toLowerCase().includes(this.searchType.toLowerCase())
    );
  }

  filteredSubType(): string[] {
    if (!this.selectedType) return [];
    return (
      this.subTypeMap[this.selectedType]?.filter((st) =>
        st.toLowerCase().includes(this.searchSubType.toLowerCase())
      ) ?? []
    );
  }

  filteredMajor(): ({ major_id: null; name_th: string } | OecdMajor)[] {
    const all = { major_id: null, name_th: 'ทั้งหมด' };
    if (!this.searchMajor) return [all, ...this.major];
    const keyword = this.searchMajor.toLowerCase();
    return this.major.filter((m) => m.name_th.toLowerCase().includes(keyword));
  }

  filteredSub(): OecdSub[] {
    const children = this.selectedMajor?.children ?? [];
    if (!this.searchSub) return children;
    const keyword = this.searchSub.toLowerCase();
    return children.filter((s) => s.name_th.toLowerCase().includes(keyword));
  }

  filteredSubSub(): OecdChild[] {
    const children = this.selectedSub?.children ?? [];
    if (!this.searchSubSub) return children;
    const keyword = this.searchSubSub.toLowerCase();
    return children.filter((ss) => ss.name_th.toLowerCase().includes(keyword));
  }

  filteredAgency(): (Organization | { id: null; faculty: string })[] {
    const all = { id: null, faculty: 'หน่วยงานทั้งหมด' };
    if (!this.searchAgency) return [all, ...this.organizations];
    return this.organizations.filter((o) =>
      o.faculty.toLowerCase().includes(this.searchAgency.toLowerCase())
    );
  }

  // ============================================================
  // Search
  // ============================================================

  search() {
    const payload: SearchResearchRequest = {};
    let oecdId: number | null = null;

    if (this.researchItems?.trim()) payload.q = this.researchItems.trim();

    if (this.selectedType) {
      payload.type = this.mapTypeToApi(this.selectedType);
      if (this.selectedType === 'บทความ') {
        payload.article_type = 'ประชุมวิชาการ';
      } else if (this.selectedType === 'วารสาร') {
        payload.article_type = 'วารสาร';
      }
    }

    if (this.selectedSubType) {
      if (this.selectedType === 'บทความ') {
        payload.article_type = 'ประชุมวิชาการ';
        payload.con_type = this.selectedSubType;
      } else if (this.selectedType === 'วารสาร') {
        payload.article_type = 'วารสาร';
        payload.db_type = this.selectedSubType;
      }
    }

    if (this.selectedAgency) payload.org_id = this.selectedAgency.id;
    if (this.selectedFundingSource) payload.funding_id = this.selectedFundingSource.id;
    if (this.dateRange.start) payload.date_from = this.dateRange.start;
    if (this.dateRange.end) payload.date_to = this.dateRange.end;

    if (this.selectedSubSub?.child_id) {
      oecdId = this.selectedSubSub.child_id;
    } else if (this.selectedSub?.sub_id) {
      oecdId = this.selectedSub.sub_id;
    } else if (this.selectedMajor?.major_id) {
      oecdId = this.selectedMajor.major_id;
    }

    if (oecdId) payload.oecd_id = oecdId;

    if (this.selectedFunding && this.selectedFunding !== 'แหล่งทุนทั้งหมด') {
      payload.funding = this.selectedFunding;
    }

    if (this.selectedYear) payload.year = this.selectedYear;

    this.loading = true;

    this.service.searchData(payload).subscribe({
      next: (res) => {
        const data = res.data;
        this.isSearched = true;
        this.allTableData = [...data.result];
        this.filteredResearchers = data.result;
        this.totalResearchers = data.total;
        this.donutSeries = data.graph.map((g: any) => g.count);
        this.donutLabels = data.graph.map((g: any) => g.oecd_name);
        this.single = data.graph.map((g: any) => ({
          name: g.oecd_name,
          value: g.count,
        }));
        this.hasData = data.graph.length > 0;
        this.currentPage = 1;
        this.updatePagination();
        this.loading = false;
      },
    });
  }

  onSearch(): void {
    const keyword = this.searchText?.trim().toLowerCase();

    if (!keyword) {
      this.filteredResearchers = [...this.allTableData];
    } else {
      this.filteredResearchers = this.allTableData.filter((item: any) => {
        const fields = [
          item.title_th,
          item.title_en,
          item.code,
          item.funding?.source_funds,
          item.oecd?.[0]?.name_th,
          item.own?.name,
        ];
        return fields.some((field) => field?.toLowerCase().includes(keyword));
      });
    }

    this.currentPage = 1;
    this.updatePagination();
  }

  // ============================================================
  // Pagination
  // ============================================================

  get totalItems(): number {
    return this.filteredResearchers.length;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredResearchers.length / this.pageSize);
  }

  get visiblePages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: (number | string)[] = [1];
    if (current > 3) pages.push('...');

    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }

    if (current < total - 2) pages.push('...');
    pages.push(total);

    return pages;
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginationData = this.filteredResearchers.slice(start, start + this.pageSize);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.updatePagination();
  }

  // ============================================================
  // Utilities
  // ============================================================

  get displayRange(): string {
    if (!this.dateRange.start || !this.dateRange.end) return '';
    const format = (d: Date) =>
      `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
    return `${format(this.dateRange.start)} - ${format(this.dateRange.end)}`;
  }

  mapTypeToApi(type: string): 'ARTICLE' | 'PROJECT' | 'INNOVATION' {
    const map: Record<string, 'ARTICLE' | 'PROJECT' | 'INNOVATION'> = {
      บทความ: 'ARTICLE',
      วารสาร: 'ARTICLE',
      โครงการวิจัย: 'PROJECT',
      นวัตกรรมสิ่งประดิษฐ์: 'INNOVATION',
    };
    return map[type];
  }

  getTypeLabel(
    type: 'ARTICLE' | 'PROJECT' | 'INNOVATION',
    article_type?: string
  ): string {
    if (type === 'ARTICLE') {
      return article_type === 'วารสาร' ? 'วารสาร' : 'บทความ';
    }
    const map: Record<string, string> = {
      PROJECT: 'โครงการวิจัย',
      INNOVATION: 'นวัตกรรม',
    };
    return map[type] ?? '-';
  }

  generateThaiYears(): void {
    const currentYear = new Date().getFullYear() + 543;
    this.thaiYears = Array.from({ length: 70 }, (_, i) => currentYear - i);
  }

  onFundingChange(
    value: 'แหล่งทุนทั้งหมด' | 'แหล่งทุนภายใน' | 'แหล่งทุนภายนอก' | null
  ) {
    this.selectedFunding = value;
    this.selectedFundingSource = null;
  }

  clearFilter() {
    this.selectedType = null;
    this.selectedSubType = null;
    this.selectedMajor = null;
    this.selectedSub = null;
    this.selectedSubSub = null;
    this.selectedAgency = null;
    this.selectedFunding = null;
    this.selectedFundingSource = null;
    this.selectedYear = null;
    this.dateRange = { start: null, end: null };
    this.searchText = '';
    this.searchMajor = '';
    this.searchSub = '';
    this.searchSubSub = '';
    this.searchAgency = '';
    this.searchType = '';
    this.searchSubType = '';
    this.researchItems = '';
    this.isSearched = false;
    this.filteredResearchers = [];
    this.allTableData = [];
    this.currentPage = 1;
    this.updatePagination();
  }

  // ============================================================
  // Export
  // ============================================================

  exportExcel() {
    if (!this.filteredResearchers || this.filteredResearchers.length === 0) {
      Swal.fire('ไม่มีข้อมูลให้ Export', '', 'warning');
      return;
    }

    const data = this.filteredResearchers.map((e, index) => ({
      '#': index + 1,
      รหัส: e.code || '-',
      ชื่องานวิจัย: e.title_th || e.title_en || '-',
      ประเภทแหล่งทุน: e.funding?.source_funds || '-',
      ชื่อแหล่งทุน: e.funding?.funding_name || '-',
      ชื่อเจ้าของผลงาน: e.own?.name || '-',
      ประเภท:
        this.getTypeLabel(e.type) === 'บทความ'
          ? e.article_type
          : this.getTypeLabel(e.type),
    }));

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    worksheet['!cols'] = Object.keys(data[0]).map((key) => ({
      wch:
        Math.max(
          key.length,
          ...data.map((row) =>
            (row as any)[key] ? (row as any)[key].toString().length : 0
          )
        ) + 5,
    }));

    const workbook: XLSX.WorkBook = {
      Sheets: { Research: worksheet },
      SheetNames: ['Research'],
    };

    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });

    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'research.xlsx');
  }

  // ============================================================
  // Navigation
  // ============================================================

  goToResearch(id: number, type: 'ARTICLE' | 'PROJECT' | 'INNOVATION') {
    const routeMap: Record<string, string> = {
      PROJECT: 'project',
      ARTICLE: 'article',
      INNOVATION: 'innovation',
    };
    const mappedType = routeMap[type];
    let basePath = '/performance';

    if (this.authService.isLoggedIn()) {
      basePath = this.authService.isAdmin()
        ? '/admin/performance-by-departmaent'
        : '/user/performance-by-departmaent';
    }

    this.router.navigate([basePath, mappedType, id]);
  }

  trackById(_: number, item: any): number {
    return item.id;
  }

  @HostListener('document:click')
  closeAll() {
    this.activeDropdown = null;
  }
}