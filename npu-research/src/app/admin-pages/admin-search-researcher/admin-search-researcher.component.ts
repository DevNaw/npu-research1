import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ApexChart, ApexLegend } from 'ng-apexcharts';
import { AuthService } from '../../services/auth.service';
import { SearchService } from '../../services/search.service';
import { Researcher } from '../../models/search-researchers.model';
import { Expertise, Organization } from '../../models/get-researcher.model';


@Component({
  selector: 'app-admin-search-researcher',
  standalone: false,
  templateUrl: './admin-search-researcher.component.html',
  styleUrl: './admin-search-researcher.component.css',
})
export class AdminSearchResearcherComponent {
  isSearched = false;
    selectedCareer: string = '';
    researcherName: string = '';
    facultySearch: string = '';
  
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
  
    donutChart: ApexChart = {
      type: 'donut',
      height: 320,
    };
  
    donutLegend: ApexLegend = {
      position: 'bottom',
      labels: {
        colors: '#fffff',
      },
    };
  
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
    ) {}
  
    ngOnInit() {
      this.loadResearch();
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
          this.filteredData = res.data.result;
          this.filteredResearchers = res.data.result;
  
          this.currentPage = 1;
          this.updatePagination();
          this.prepareDonutChart();
  
          this.loading = false;
        },
        error: (err) => {
          console.error('ค้นหาล้มเหลว', err);
          console.log('error body:', err.error);
          this.loading = false;
        },
      });
    }
  
    /** ===== DONUT CALCULATION (อิงข้อมูลตารางจริง) ===== */
    hasDonutData = false;
  
    prepareDonutChart() {
      const map: Record<string, number> = {};
  
      this.filteredData.forEach((r) => {
        const list = r.expertises ? r.expertises.split(',') : ['ไม่ระบุ'];
  
        list.forEach((exp) => {
          const key = exp.trim();
          map[key] = (map[key] || 0) + 1;
        });
      });
  
      this.donutLabels = Object.keys(map);
      this.donutSeries = Object.values(map);
      this.totalResearchers = this.filteredData.length;
      this.hasDonutData = true;
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
      this.prepareDonutChart();
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
}
