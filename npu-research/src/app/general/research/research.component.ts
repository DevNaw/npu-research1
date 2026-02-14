import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Data } from '../../models/data-performance.model';
import { ResearchService } from '../../services/research.service';

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

  research: Data[] = [];

  constructor(
    private router: Router,
    private researchService: ResearchService
  ) {}

  filteredReseacrchs: Data[] = [];
  paginatedReseacrchs: Data[] = [];

  ngOnInit(): void {
    this.getDataResearch();
    this.filteredReseacrchs = [...this.research];
    this.updatePagination();
  }

  // ===== SEARCH =====
  onSearch(): void {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredReseacrchs = this.research.filter(
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

  getDataResearch() {
    this.researchService.getDataResearchPublic().subscribe({
      next: (res) => {
        const projects = res.data.projects;

        this.research = projects.map((p: any) => ({
          id: p.research_id,
          title: p.title_th || p.title_en,
          date: this.formatThaiDate(p.published_date),
          researchers: this.mapResearchers(p.own),
          imgUrl: p.img_url,
        }));
        
        this.filteredReseacrchs = [...this.research];
        this.updatePagination();
      },
      error: (err) => {
        console.error('โหลดข้อมูลล้มเหลว', err);
      },
    });
  }
  mapResearchers(owners: any[]): string {
    if (!owners || owners.length === 0) return '-';

    return owners.map((o) => o.full_name).join(', ');
  }

  formatThaiDate(dateString: string): string {
    if (!dateString) return '-';
  
    const d = new Date(dateString);
  
    const day = d.getDate();
    const month = d.toLocaleDateString('th-TH', { month: 'long' });
    const year = d.getFullYear() + 543;
  
    return `${day} ${month} ${year}`;
  }
  
}
