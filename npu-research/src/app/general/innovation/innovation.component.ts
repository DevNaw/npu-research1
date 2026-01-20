import { Component, OnInit } from '@angular/core';
import { Data } from '../../models/data-performance.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-innovation',
  standalone: false,
  templateUrl: './innovation.component.html',
  styleUrl: './innovation.component.css',
})
export class InnovationComponent implements OnInit {
  pageSize = 10;
  currentPage = 1;
  searchText = '';

  innovations: Data[] = [
    {
      id: 1,
      title: 'การพัฒนาระบบฐานข้อมูลวิจัย',
      researchers: 'ดร.เศริยา มั่งมี',
    },
    {
      id: 2,
      title: 'ผลกระทบของการเปลี่ยนแปลงสภาพภูมิอากาศต่อการเกษตร',
      researchers: 'ผศ.สมชาย ใจดีผศ.สมชาย ใจดีผศ.สมชาย ใจดีผศ.สมชาย ใจดี',
    },
    
  ];

  constructor(private router: Router) {}

  filteredInnovations: Data[] = [];
  paginatedInnovations: Data[] = [];

  ngOnInit(): void {
    this.filteredInnovations = [...this.innovations];
    this.updatePagination();
  }

  onSearch(): void {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredInnovations = this.innovations.filter(
    (i) =>
      i.title.toLowerCase().includes(keyword) ||
      i.researchers.toLowerCase().includes(keyword)
    );

    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.paginatedInnovations = this.filteredInnovations.slice(start, end);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    if (page === this.currentPage) return;

    this.currentPage = page;
    this.updatePagination();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get totalPages(): number {
    return Math.ceil(this.innovations.length / this.pageSize);
  }

  viewDetails(id: number): void {
    this.router.navigate(['/performance/innovation', id]);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
