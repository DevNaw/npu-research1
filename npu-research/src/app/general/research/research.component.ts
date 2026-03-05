import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ResearchService } from '../../services/research.service';
import { Project } from '../../models/project-public.model';

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

  research: Project[] = [];
  filteredReseacrchs: Project[] = [];
  paginatedReseacrchs: Project[] = [];

  constructor(
    private router: Router,
    private researchService: ResearchService
  ) {}

  

  ngOnInit(): void {
    this.getDataResearch();
  }

  getDataResearch() {
    this.researchService.getDataResearchPublic().subscribe({
      next: (res) => {
        this.research = res.data.projects;
        this.filteredReseacrchs = [...this.research];
        this.updatePagination();
      },
      error: (err) => {
        console.error('โหลดข้อมูลล้มเหลว', err);
      },
    });
  }

  // ===== SEARCH =====
  onSearch(): void {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredReseacrchs = this.research.filter((r) => {
      const title = r.title_th?.toLowerCase() || '';
      const researchers = this.mapResearchers(r.own).toLowerCase();

      return title.includes(keyword) || researchers.includes(keyword);
    });

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
    console.log('id', id);
    
    if (!id) {
      console.error('Project ID undefined');
      return;
    }
    this.router.navigate(['/performance-public/project', id]);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
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
