import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { SearchService } from '../../services/search.service';
import { Researcher } from '../../models/search-researchers.model';
import { Expertise, Organization } from '../../models/get-researcher.model';
import { MainComponent } from '../../shared/layouts/main/main.component';
import { Color, LegendPosition, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-user-researchers',
  standalone: false,
  templateUrl: './user-researchers.component.html',
  styleUrl: './user-researchers.component.css',
})
export class UserResearchersComponent implements OnInit {
  isSearched = false;
  researcherName = '';
  searchMajor = '';
  selectedMajor = '';
  searchText = '';

  // ── Table / Pagination ─────────────────────────────────────
  filteredData: Researcher[] = [];
  filteredResearchers: Researcher[] = [];
  paginationData: Researcher[] = [];
  pageSize = 10;
  currentPage = 1;

  loading = false;
  error: string | null = null;

  // ── Agency / Expertise ─────────────────────────────────────
  organizations: Organization[] = [];
  expertises: Expertise[] = [];
  searchFaculitie = '';
  selectedFaculty: string | null = null;
  selectedFacultyId: number | null = null;
  selectedMajorId: number | null = null;
  activeDropdown: string | null = null;

  // ── Chart ──────────────────────────────────────────────────
  donutLabels: string[] = [];
  donutSeries: number[] = [];
  totalResearchers = 0;
  single: { name: string; value: number }[] = [];
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
    private searchService: SearchService
  ) {}

  // ============================================================
  // Lifecycle
  // ============================================================

  ngOnInit() {
    MainComponent.showLoading();
    Promise.all([
      this.loadResearch(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => MainComponent.hideLoading());
  }

  // ============================================================
  // Data loading
  // ============================================================

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

  // ============================================================
  // Search
  // ============================================================

  search() {
    this.isSearched = true;
    this.loading = true;

    const payload: any = {};

    if (this.selectedFacultyId) payload.org_id = this.selectedFacultyId;
    if (this.selectedMajorId) payload.expertise_id = this.selectedMajorId;
    if (this.researcherName?.trim()) payload.q = this.researcherName.trim();

    this.searchService.searchResearchers(payload).subscribe({
      next: (res) => {
        const data = res.data;
        this.filteredData = data.result;
        this.filteredResearchers = data.result;
        this.donutLabels = data.graph.map((g: any) => g.faculty);
        this.donutSeries = data.graph.map((g: any) => g.count);
        this.totalResearchers = data.total;
        this.single = data.graph.map((g: any) => ({ name: g.faculty, value: g.count }));
        this.hasData = data.graph.length > 0;
        this.currentPage = 1;
        this.updatePagination();
        this.loading = false;
      },
      error: (err) => {
        console.error('ค้นหาล้มเหลว', err);
        this.loading = false;
      },
    });
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

  // ============================================================
  // Dropdown helpers
  // ============================================================

  toggleDropdown(name: string, event: MouseEvent) {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === name ? null : name;
  }

  @HostListener('document:click')
  closeAll() {
    this.activeDropdown = null;
  }

  // ============================================================
  // Select
  // ============================================================

  selectFaculities(org: Organization | { id: null; faculty: string }) {
    if (org.id === null) {
      this.selectedFaculty = null;
      this.selectedFacultyId = null;
    } else {
      this.selectedFaculty = org.faculty;
      this.selectedFacultyId = org.id;
    }
    this.searchFaculitie = '';
    this.activeDropdown = null;
  }

  selectMajor(exper: Expertise) {
    this.selectedMajor = exper.name_th;
    this.selectedMajorId = exper.expertise_id;
    this.activeDropdown = null;
    this.searchMajor = '';
  }

  // ============================================================
  // Filter lists
  // ============================================================

  filteredFaculties(): (Organization | { id: null; faculty: string })[] {
    const all = { id: null, faculty: 'หน่วยงานทั้งหมด' };
    if (!this.searchFaculitie) return [all, ...this.organizations];
    return this.organizations.filter((org) =>
      org.faculty.toLowerCase().includes(this.searchFaculitie.toLowerCase())
    );
  }

  filteredMajor(): Expertise[] {
    if (!this.searchMajor) return this.expertises;
    return this.expertises.filter((exper) =>
      exper.name_th.toLowerCase().includes(this.searchMajor.toLowerCase())
    );
  }

  // ============================================================
  // Pagination
  // ============================================================

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  get totalItems(): number {
    return this.filteredData.length;
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
    this.paginationData = this.filteredData.slice(start, start + this.pageSize);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.updatePagination();
  }

  // ============================================================
  // Navigation
  // ============================================================

  goToUserProfile(userId: number) {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    const base = this.authService.isAdmin() ? 'admin' : 'user';
    this.router.navigate(['/', base, 'profile-public', userId]);
  }
}