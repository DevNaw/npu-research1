import { Component, HostListener, OnInit } from '@angular/core';
import { MainComponent } from '../../shared/layouts/main/main.component';
import { Router } from '@angular/router';
import { AdminMProjectService } from '../../services/admin-m-project.service';
import { Research } from '../../models/admin-m-project.model';
import Swal from 'sweetalert2';

type ResearchType = 'PROJECT' | 'ARTICLE' | 'INNOVATION';

@Component({
  selector: 'app-manage-project',
  standalone: false,
  templateUrl: './manage-project.component.html',
  styleUrl: './manage-project.component.css',
})
export class ManageProjectComponent implements OnInit {
  showAddMenu: boolean = false;
  searchText: string = '';
  totalAcademic: number = 0;
  totalSupport: number = 0;
  selectedTab: ResearchType = 'PROJECT';
  today = new Date();

  pageSize = 10;
  currentPage = 1;

  researchs: Research[] = [];
  filteredResearch: Research[] = [];
  paginatedPublications: Research[] = [];

  constructor(private router: Router, private service: AdminMProjectService) {}

  ngOnInit() {
    MainComponent.showLoading();
    Promise.all([
      this.loadData(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => MainComponent.hideLoading());
  }

  loadData(): void {
    this.service.getProject().subscribe({
      next: (res) => {
        this.researchs = res.data.researchs;
        this.applyFilter();
        MainComponent.hideLoading();
      },
      error: (err) => {
        console.error(err);
        MainComponent.hideLoading();
      },
    });
  }

  applyFilter(): void {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredResearch = this.researchs
      .filter((r) => r.research_type === this.selectedTab)
      .filter(
        (r) =>
          !keyword ||
          r.title_th?.toLowerCase().includes(keyword) ||
          r.title_en?.toLowerCase().includes(keyword) ||
          r.research_code?.toLowerCase().includes(keyword) ||
          r.own[0]?.full_name.toLowerCase().includes(keyword) ||
          r.funding.funding_name?.toLowerCase().includes(keyword) ||
          r.funding.source_funds?.toLowerCase().includes(keyword)
      );

    this.currentPage = 1;
  }

  onSearch(): void {
    this.applyFilter();
  }

  // ===== Pagination =====
  get paginatedResearchs(): Research[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredResearch.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredResearch.length / this.pageSize);
  }

  get visiblePages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 3) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: (number | string)[] = [1];

    if (current > 3) pages.push('...');

    for (
      let i = Math.max(2, current - 1);
      i <= Math.min(total - 1, current + 1);
      i++
    ) {
      pages.push(i);
    }

    if (current < total - 2) pages.push('...');

    pages.push(total);

    return pages;
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changeTab(tab: ResearchType): void {
    this.selectedTab = tab;
    this.searchText = '';
    this.applyFilter();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedPublications = this.filteredResearch.slice(start, end);
  }

  viewItem(id: number) {
    this.router.navigate([
      '/performance-public',
      this.selectedTab.toLowerCase(),
      id,
    ]);
  }

  editItem(id: number) {
    this.router.navigate([
      '/admin',
      `edit-${this.selectedTab.toLowerCase()}s`,
      id,
    ]);
  }

  deleteItem(id: number): void {
    Swal.fire({
      title: 'คุณแน่ใจหรือไม่?',
      text: 'การลบรายการนี้จะไม่สามารถกู้คืนได้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (!result.isConfirmed) return;

      Swal.fire({
        title: 'กำลังลบ...',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      this.service.adminDelete(id).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'ลบสำเร็จ',
            showConfirmButton: false,
            timer: 1000,
          });
          this.loadData();
        },
        error: (err) => {
          console.error(err);
          Swal.fire({ icon: 'error', title: 'ลบไม่สำเร็จ' });
        },
      });
    });
  }

  goToResearchDetail(id: number) {
    this.router.navigate([
      '/admin/performance-by-departmaent',
      this.researchs
        .find((r) => r.research_id === id)
        ?.research_type.toLowerCase(),
      id,
    ]);
  }

  toggleAddMenu(event: MouseEvent) {
    event.stopPropagation();
    this.showAddMenu = !this.showAddMenu;
  }

  navigateTo(path: string): void {
    this.showAddMenu = false;
    this.router.navigate([path]);
  }

  @HostListener('document:click')
  closeAddMenu(): void {
    this.showAddMenu = false;
  }
}
