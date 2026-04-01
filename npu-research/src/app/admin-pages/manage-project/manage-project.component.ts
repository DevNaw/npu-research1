import { Component, OnInit } from '@angular/core';
import { MainComponent } from '../../shared/layouts/main/main.component';
import { Router } from '@angular/router';
import { AdminMProjectService } from '../../services/admin-m-project.service';
import { Research, ResearchData } from '../../models/admin-m-project.model';

type ResearchType = 'PROJECT' | 'ARTICLE' | 'INNOVATION';

@Component({
  selector: 'app-manage-project',
  standalone: false,
  templateUrl: './manage-project.component.html',
  styleUrl: './manage-project.component.css',
})
export class ManageProjectComponent implements OnInit {
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

  loadData() {
    this.service.getProject().subscribe({
      next: (res) => {
        this.researchs = res.data.researchs;

        // ✅ สำคัญมาก
        this.filteredResearch = this.researchs.filter(
          (r) => r.research_type === this.selectedTab
        );

        this.updatePagination();
      },
      error: (err) => console.error(err),
    });
  }

  onSearch() {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredResearch = this.researchs
      .filter((r) => r.research_type === this.selectedTab) // filter tab ก่อน
      .filter(
        (r) =>
          r.title_th?.toLowerCase().includes(keyword) ||
          r.title_en?.toLowerCase().includes(keyword)
      );

    this.currentPage = 1;
  }

  // ===== Pagination =====
  get paginatedReseacrchs(): Research[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.filteredResearch.slice(startIndex, startIndex + this.pageSize);
  }

  get totalPages(): number {
    return Math.ceil(this.filteredResearch.length / this.pageSize);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    if (page === this.currentPage) return;

    this.currentPage = page;
    scrollTo({ top: 0, behavior: 'smooth' });
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changeTab(tab: ResearchType): void {
    this.selectedTab = tab;
    this.searchText = '';
    this.currentPage = 1;

    this.filteredResearch = this.researchs.filter(
      (r) => r.research_type === tab
    );
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

  get visiblePages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: (number | string)[] = [];

    if (total <= 3) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    pages.push(1);

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

  editItem(id: number) {
    this.router.navigate([
      '/admin',
      `edit-${this.selectedTab.toLowerCase()}s`,
      id,
    ]);
  }

  deleteItem(id: number) {
    if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) return;

    this.service.deleteProject(id).subscribe({
      next: () => {
        alert('ลบรายการสำเร็จ');
        this.loadData();
      },
      error: (err) => {
        console.error(err);
        alert('เกิดข้อผิดพลาดในการลบรายการ');
      },
    });
  }
}
