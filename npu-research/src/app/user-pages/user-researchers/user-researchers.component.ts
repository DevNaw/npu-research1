import { Component, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SearchService } from '../../services/search.service';
import { Researcher } from '../../models/search-researchers.model';
import { Expertise, Organization } from '../../models/get-researcher.model';
import { MainComponent } from '../../shared/layouts/main/main.component';
import { CanvasJS } from '@canvasjs/angular-charts';

CanvasJS.addColorSet('customColorSet', [
  '#038FFB',
  '#06E396',
  '#FEB119',
  '#FF4560',
  '#775DD0',
  '#00E396',
  '#0090FF',
  '#FF66C4',
  '#00B8D9',
  '#FFB800',
  '#4CAF50',
  '#2196F3',
  '#9C27B0',
  '#FF5722',
  '#3F51B5',
  '#8BC34A',
  '#FFC107',
  '#E91E63',
  '#673AB7',
  '#03A9F4',
  '#CDDC39',
]);

@Component({
  selector: 'app-user-researchers',
  standalone: false,
  templateUrl: './user-researchers.component.html',
  styleUrl: './user-researchers.component.css',
})
export class UserResearchersComponent {
  chartOptions: any;
  isSearched = false;
  researcherName: string = '';

  searchMajor = '';
  selectedMajor = '';
  searchText = '';

  filteredData: Researcher[] = [];
  paginationData: Researcher[] = [];

  pageSize = 10;
  currentPage = 1;

  loading = false;
  error: string | null = null;

  /** ===== DONUT CHART ===== */
  donutLabels: string[] = [];
  donutSeries: number[] = [];
  totalResearchers = 0;

  filteredResearchers: Researcher[] = [];
  researchers: Researcher[] = [];
  organizations: Organization[] = [];
  expertises: Expertise[] = [];
  searchFaculitie: string = '';
  selectedFaculty: string | null = null;
  selectedFacultyId: number | null = null;
  selectedMajorId: number | null = null;
  activeDropdown: string | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    private searchService: SearchService
  ) {
    this.chartOptions = {
      backgroundColor: '#394250',
      colorSet: 'customColorSet',
      animationEnabled: true,
      data: [
        {
          type: 'doughnut',
          yValueFormatString: '#,##0',
          indexLabel: '{name} ({y})',
          indexLabelFontColor: '#ffffff',
          dataPoints: [],
        },
      ],
    };
  }

  ngOnInit() {
    MainComponent.showLoading();
    Promise.all([
      this.loadResearch(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => MainComponent.hideLoading());
  }

  loadResearch() {
    this.loading = true;
    this.error = null;

    this.searchService.getResearchers().subscribe({
      next: (res) => {
        this.organizations = res.data.organizations;
        this.expertises = res.data.expertises;

        this.loading = false;
      },
      error: (err) => {
        console.error('โหลดข้อมูลล้มเหลว', err);
        this.loading = false;
      },
    });
  }

  /** ===== SEARCH ===== */
  search() {
    this.isSearched = true;
    this.loading = true;

    const payload: any = {};

    if (this.selectedFacultyId) {
      payload.org_id = this.selectedFacultyId;
    }

    if (this.selectedMajorId) {
      payload.expertise_id = this.selectedMajorId;
    }

    if (this.researcherName?.trim()) {
      payload.q = this.researcherName.trim();
    }

    this.searchService.searchResearchers(payload).subscribe({
      next: (res) => {
        const data = res.data;
        console.log(data);
      
        this.filteredData = data.result;
        this.filteredResearchers = data.result;

        const colors = [
          '#038FFB', '#06E396', '#FEB119', '#FF4560', '#775DD0',
          '#00E396', '#0090FF', '#FF66C4', '#00B8D9', '#FFB800',
          '#4CAF50', '#2196F3', '#9C27B0', '#FF5722', '#3F51B5',
        ];

        const graphData = data.graph.map((g: any, index: number) => ({
          name: g.faculty,
          y: g.count,
          color: colors[index % colors.length],
        }));
      
        this.chartOptions = {
          ...this.chartOptions,
          data: [
            {
              ...this.chartOptions.data[0],
              dataPoints: graphData,
            },
          ],
        };
      
        this.donutLabels = data.graph.map((g) => g.faculty);
        this.donutSeries = data.graph.map((g) => g.count);
        this.totalResearchers = data.total;
      
        this.currentPage = 1;
        this.updatePagination();
      
        this.loading = false;
      },
      error: (err) => {
        console.error('ค้นหาล้มเหลว', err);
        console.log('error body:', err.error);
        this.loading = false;
      },
    });
  }

  toggleDropdown(name: string, event: MouseEvent) {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === name ? null : name;
  }
  @HostListener('document:click')
  closeAll() {
    this.activeDropdown = null;
  }

  selectFaculities(org: Organization) {
    this.selectedFaculty = org.faculty;
    this.selectedFacultyId = org.id;
    this.searchFaculitie = '';

    this.activeDropdown = null;
  }

  filteredFaculties(): Organization[] {
    if (!this.searchFaculitie) return this.organizations;

    return this.organizations.filter((org) =>
      org.faculty.toLowerCase().includes(this.searchFaculitie.toLowerCase())
    );
  }

  selectMajor(exper: Expertise) {
    this.selectedMajor = exper.name_th;
    this.selectedMajorId = exper.expertise_id;
    this.activeDropdown = null;
    this.searchMajor = '';
  }

  filteredMajor(): Expertise[] {
    if (!this.searchMajor) return this.expertises;

    return this.expertises.filter((exper) =>
      exper.name_th.toLowerCase().includes(this.searchMajor.toLowerCase())
    );
  }

  onSearch(): void {
    const keyword = this.searchText.toLowerCase().trim();

    if (this.selectedFacultyId || this.selectedMajorId || this.researcherName) {
      this.search();
      return;
    }

    if (!keyword) {
      this.filteredData = [...this.filteredResearchers];
    } else {
      this.filteredData = this.filteredResearchers.filter(
        (item) =>
          (item.organization ?? '').toLowerCase().includes(keyword) ||
          (item.expertises ?? '').toLowerCase().includes(keyword) ||
          (item.name ?? '').toLowerCase().includes(keyword) ||
          (item.position ?? '').toLowerCase().includes(keyword)
      );
    }

    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.paginationData = this.filteredData.slice(start, end);
  }

  goToUserProfile(userId: number) {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const base = this.authService.isAdmin() ? 'admin' : 'user';
    this.router.navigate(['/', base, 'profile-public', userId]);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    if (page === this.currentPage) return;

    this.currentPage = page;
    this.updatePagination();
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  get totalItems(): number {
    return this.filteredData.length;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get visiblePages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: (number | string)[] = [];
  
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
  
    pages.push(1);
  
    if (current > 3) pages.push('...');
  
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
  
    if (current < total - 2) pages.push('...');
  
    pages.push(total);
  
    return pages;
  }
}
