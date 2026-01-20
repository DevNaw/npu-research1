import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Data } from '../../models/data-performance.model';

@Component({
  selector: 'app-aticle',
  standalone: false,
  templateUrl: './aticle.component.html',
  styleUrl: './aticle.component.css',
})
export class AticleComponent implements OnInit {
  pageSize = 10;
  currentPage = 1;
  searchText = '';

  aticles: Data[] = [
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

  filteredAticles: Data[] = [];
  paginatedAticles: Data[] = [];

  ngOnInit(): void {
      this.filteredAticles = [...this.aticles];
      this.updatePagination();
  }

  onSearch(): void {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredAticles = this.aticles.filter(
      (a) =>
        a.title.toLowerCase().includes(keyword) ||
      a.researchers.toLowerCase().includes(keyword)
    );

    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.paginatedAticles = this.filteredAticles.slice(start, end);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    if (page === this.currentPage) return;

    this.currentPage = page;
    this.updatePagination();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get totalPages(): number {
    return Math.ceil(this.aticles.length / this.pageSize);
  }

  viewAticleDetails(id: number): void {
    this.router.navigate(['/performance/article', id]);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
