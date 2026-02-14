import { Component, OnInit } from '@angular/core';
import { Data } from '../../models/data-performance.model';
import { Router } from '@angular/router';
import { ResearchService } from '../../services/research.service';

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

  innovations: Data[] = [];
  filteredInnovations: Data[] = [];
  paginatedInnovations: Data[] = [];

  constructor(
    private router: Router,
    private researchService: ResearchService
  ) {}

  ngOnInit(): void {
    this.getDataInnovation();
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

  getDataInnovation() {
    this.researchService.getDataInnovationPublic().subscribe({
      next: (res) => {
        const innovation = res.data.innovations;

        this.innovations = innovation.map((i: any) => ({
          id: i.innovation_id,
          title: i.title_th,
          date: this.formatThaiDate(i.published_date),
          researchers: this.mapInnovation(i.own),
          imgUrl: i.img_url,
        }));
console.log(res);

        this.filteredInnovations = [...this.innovations];
        this.updatePagination();
      },
      error: (err) => {
        console.error('โหลดข้อมูลล้มเหลว', err);
      },
    });
  }

  mapInnovation(owners: any[]): string {
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
