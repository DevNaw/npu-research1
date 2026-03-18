import { Component, HostListener, ViewChild } from '@angular/core';
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
import { CanvasJSChart } from '@canvasjs/angular-charts';

@Component({
  selector: 'app-admin-search-paper',
  standalone: false,
  templateUrl: './admin-search-paper.component.html',
  styleUrl: './admin-search-paper.component.css',
})
export class AdminSearchPaperComponent {
  chart: any;
  activeDropdown: string | null = null;
  searchSubSub: string = '';
  selectedMajor: OecdMajor | null = null;
  selectedSub: OecdSub | null = null;
  selectedSubSub: OecdChild | null = null;
  searchOrg: string = '';
  selectedYear = '';
  researchTitle = '';
  searchSubType = '';
  searchText = '';
  researchItems = '';
  searchFaculitie = '';
  searchType = '';
  facultySearch: string = '';
  date_from?: Date;
  date_to?: Date;
  searchMajor: string = '';
  searchSub: string = '';
  major: OecdMajor[] = [];
  sub: OecdSub[] = [];
  subSub: OecdChild[] = [];
  organizations: Organization[] = [];
  selectedOrg: Organization | null = null;
  chartOptions: any;
  filteredResearchers: ResearchItem[] = [];
  searchResults: ResearchItem[] = [];
  allTableData: ResearchItem[] = [];

  subTypeMap: any = {
    โครงการวิจัย: [],
    บทความ: ['ประชุมวิชาการระดับชาติ', 'ประชุมวิชาการระดับนานาชาติ'],
    วารสาร: ['วารสารในประเทศ', 'วารสารต่างประเทศ'],
    นวัตกรรมสิ่งประดิษฐ์: [],
  };

  typeList = ['โครงการวิจัย', 'บทความ', 'วารสาร', 'นวัตกรรมสิ่งประดิษฐ์'];
  selectedFunding: 'แหล่งทุนภายใน' | 'แหล่งทุนภายนอก' | null = null;

  dateRange: {
    start: Date | null;
    end: Date | null;
  } = {
    start: null,
    end: null,
  };

  selectedType: string | null = null;
  selectedSubType: string | null = null;
  donutLabels: string[] = [];
  donutSeries: number[] = [];
  totalResearchers = 0;
  loading = false;
  isSearched = false;
  currentPage = 1;
  pageSize = 10;
  paginationData: ResearchItem[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private service: SearchService
  ) {
    this.chartOptions = {
      colorSet: 'customColorSet',
      animationEnabled: true,
      data: [
        {
          type: 'doughnut',
          yValueFormatString: '#,##0',
          indexLabel: '{name} ({y})',
          dataPoints: [],
        },
      ],
    };
  }

  ngOnInit() {
    MainComponent.showLoading();
    Promise.all([
      this.loadSubOrgan(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => MainComponent.hideLoading());
  }

  loadSubOrgan(): void {
    this.service.getData().subscribe({
      next: (res) => {
        this.major = res.data.oecd;
        this.organizations = res.data.organizations;
      },
    });
  }

  prepareDonut() {
    type ResearchType = 'project' | 'article' | 'innovation';

    const map: Record<ResearchType, number> = {
      project: 0,
      article: 0,
      innovation: 0,
    };

    this.filteredResearchers.forEach((r) => {
      const type = r.type as ResearchType;

      if (map[type] !== undefined) {
        map[type]++;
      }
    });

    this.chartOptions = {
      colorSet: 'customColorSet',
      animationEnabled: true,
      data: [
        {
          type: 'doughnut',
          yValueFormatString: '#,##0',
          indexLabel: '{name} ({y})',
          dataPoints: [
            { name: 'โครงการวิจัย', y: map.project },
            { name: 'บทความ', y: map.article },
            { name: 'นวัตกรรม', y: map.innovation },
          ],
        },
      ],
    };

    if (this.chart) {
      this.chart.render();
    }
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

  toggleDropdown(name: string, event: MouseEvent) {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === name ? null : name;
  }

  isOpen(name: string): boolean {
    return this.activeDropdown === name;
  }

  // ====== Selected =======
  selectType(t: string) {
    this.selectedType = t;
    this.selectedSubType = null;
    this.searchType = '';
    this.searchSubType = '';

    this.activeDropdown = null;

    if (this.subTypeMap[t] && this.subTypeMap[t].length > 0) {
      setTimeout(() => {
        this.activeDropdown = 'subType';
      }, 0);
    }
  }

  selectSubType(st: string) {
    this.selectedSubType = st;
    this.searchSubType = '';
    this.activeDropdown = null;
  }

  selectOrg(org: Organization) {
    this.selectedOrg = org;
    this.searchOrg = '';
    this.activeDropdown = null;
  }

  selectMajor(major: OecdMajor) {
    this.selectedMajor = major;
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

  // ====== Filter ========
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

  filteredOrg(): Organization[] {
    if (!this.searchOrg) return this.organizations;

    return this.organizations.filter((o) =>
      o.faculty.toLowerCase().includes(this.searchOrg.toLowerCase())
    );
  }

  filteredMajor() {
    if (!this.searchMajor) return this.major;

    const keyword = this.searchMajor.toLowerCase();
    return this.major.filter((m) => m.name_th.toLowerCase().includes(keyword));
  }

  filteredSub() {
    if (!this.searchSub) return this.selectedMajor?.children || [];

    const keyword = this.searchSub.toLowerCase();
    return (this.selectedMajor?.children || []).filter((s) =>
      s.name_th.toLowerCase().includes(keyword)
    );
  }

  filteredSubSub() {
    if (!this.searchSubSub) return this.selectedSub?.children || [];

    const keyword = this.searchSubSub.toLowerCase();
    return (this.selectedSub?.children || []).filter((ss) =>
      ss.name_th.toLowerCase().includes(keyword)
    );
  }

  // ===== Search =====
  search() {
    const payload: SearchResearchRequest = {};
    let oecdId = null;

    if (this.researchItems?.trim()) {
      payload.q = this.researchItems.trim();
    }

    if (this.selectedType) {
      payload.type = this.mapTypeToApi(this.selectedType);
    }

    if (this.selectedOrg?.id) {
      payload.org_id = this.selectedOrg.id;
    }

    if (this.selectedSubSub?.child_id) {
      oecdId = this.selectedSubSub.child_id;
    } else if (this.selectedSub?.sub_id) {
      oecdId = this.selectedSub.sub_id;
    } else if (this.selectedMajor?.major_id) {
      oecdId = this.selectedMajor.major_id;
    }
    
    if (oecdId) {
      payload.oecd_id = oecdId;
    }

    if (this.selectedFunding) {
      payload.funding = this.selectedFunding;
    }

    if (this.date_from) {
      payload.date_from = this.formatDateForApi(this.date_from);
    }

    if (this.date_to) {
      payload.date_to = this.formatDateForApi(this.date_to);
    }

    this.loading = true;

    this.service.searchData(payload).subscribe({
      next: (res) => {
        this.isSearched = true;

        const data = res.data;

        this.searchResults = data.result;
        this.allTableData = [...data.result];
        this.filteredResearchers = data.result;

        if (this.chartOptions?.data?.length) {
          this.chartOptions.data[0].dataPoints = data.graph.map((g: any) => ({
            name: g.oecd_name,
            y: g.count,
          }));
        }
      
        if (this.chart && this.chart.container) {
          this.chart.render();
        }

        this.donutSeries = data.graph.map((g) => g.count);
        this.donutLabels = data.graph.map((g) => g.oecd_name);
        this.totalResearchers = data.total;

        this.currentPage = 1;
        this.updatePagination();
      },
    });
  }

  onSearch(): void {
    const keyword = this.searchText?.trim().toLowerCase();
  
    if (!keyword) {
      this.filteredResearchers = [...this.allTableData];
    } else {
      this.filteredResearchers = this.allTableData.filter((item: any) => {
        return (
          item.title_th?.toLowerCase().includes(keyword) ||
          item.title_en?.toLowerCase().includes(keyword) ||
          item.own?.name?.toLowerCase().includes(keyword) ||
          item.type?.toLowerCase().includes(keyword)
        );
      });
    }
  
    this.currentPage = 1;
    this.updatePagination();
  }

  // ====== Other ====
  get displayRange(): string {
    if (!this.date_from || !this.date_to) return '';

    const format = (d: Date) =>
      `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

    return `${format(this.date_from)} - ${format(this.date_to)}`;
  }

  get totalItems(): number {
    return this.filteredResearchers.length;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredResearchers.length / this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  formatDateForApi(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
  }

  formatThaiDate(date: Date): string {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.toLocaleDateString('th-TH', { month: 'long' });
    const year = d.getFullYear() + 543;

    return `${day} ${month} ${year}`;
  }

  updatePagination(): void {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
  
      this.paginationData = this.filteredResearchers.slice(start, end);
    }

  mapTypeToApi(type: string): 'ARTICLE' | 'PROJECT' | 'INNOVATION' {
    const map: any = {
      บทความ: 'ARTICLE',
      วารสาร: 'ARTICLE',
      โครงการวิจัย: 'PROJECT',
      นวัตกรรมสิ่งประดิษฐ์: 'INNOVATION',
    };

    return map[type];
  }

  getTypeLabel(type: 'ARTICLE' | 'PROJECT' | 'INNOVATION'): string {
    const map = {
      PROJECT: 'โครงการวิจัย',
      ARTICLE: 'บทความ / วารสาร',
      INNOVATION: 'นวัตกรรม',
    };

    return map[type] ?? '-';
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    if (page === this.currentPage) return;

    this.currentPage = page;
    this.updatePagination();
  }

  getChartInstance(chart: any) {
    this.chart = chart;
  }

  @HostListener('document:click')
      closeAll() {
        this.activeDropdown = null;
      }

      trackById(item: any): number {
        return item.id;
      }

  // === Route ===
  goToResearch(id: number, type: 'ARTICLE' | 'PROJECT' | 'INNOVATION') {
    const routeMap: any = {
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
}
