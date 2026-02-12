import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Data } from '../../models/data-performance.model';

@Component({
  selector: 'app-research',
  standalone: false,
  templateUrl: './research.component.html',
  styleUrl: './research.component.css',
})
export class ResearchComponent implements OnInit {
  pageSize = 10;
  currentPage = 1;
  searchText = '';

  // 🔹 ข้อมูลทั้งหมด
  reseacrchs: Data[] = [
    {
      id: 1,
      title: 'การพัฒนาระบบฐานข้อมูลวิจัย',
      researchers: 'ดร.เศริยา มั่งมี',
    },
    {
      id: 2,
      title: 'ผลกระทบของการเปลี่ยนแปลงสภาพภูมิอากาศต่อการเกษตร',
      researchers: 'ผศ.สมชาย ใจดี',
    },
  ];

  constructor(private router: Router) {}

  // 🔹 หลังค้นหา
  filteredReseacrchs: Data[] = [];

  // 🔹 แสดงในตาราง
  paginatedReseacrchs: Data[] = [];

  ngOnInit(): void {
    this.filteredReseacrchs = [...this.reseacrchs];
    this.updatePagination();
  }

  // ===== SEARCH =====
  onSearch(): void {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredReseacrchs = this.reseacrchs.filter(
      (r) =>
        r.title.toLowerCase().includes(keyword) ||
        r.researchers.toLowerCase().includes(keyword)
    );

    this.currentPage = 1;
    this.updatePagination();
  }

  // ===== PAGINATION =====
  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.paginatedReseacrchs = this.filteredReseacrchs.slice(start, end);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    if (page === this.currentPage) return;
  
    this.currentPage = page;
    this.updatePagination();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  

  get totalPages(): number {
    return Math.ceil(this.filteredReseacrchs.length / this.pageSize);
  }

  viewDetails(id: number): void {
    this.router.navigate(['/performance/research', id]);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  
}
