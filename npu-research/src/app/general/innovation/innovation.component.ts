import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ResearchService } from '../../services/research.service';
import { Innovation } from '../../models/innovation-public.model';
import { MainComponent } from '../../shared/layouts/main/main.component';

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

  innovations: Innovation[] = [];
  filteredInnovations: Innovation[] = [];
  paginatedInnovations: Innovation[] = [];

  constructor(
    private router: Router,
    private researchService: ResearchService
  ) {}

  ngOnInit(): void {
    MainComponent.showLoading();
    Promise.all([
      this.getDataInnovation(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => MainComponent.hideLoading());
  }

  getDataInnovation() {
    this.researchService.getDataInnovationPublic().subscribe({
      next: (res) => {
        this.innovations = res.data.innovations;
        this.filteredInnovations = [...this.innovations];
        this.updatePagination();
      },
      error: (err) => {
        console.error('โหลดข้อมูลล้มเหลว', err);
      },
    });
  }

  onSearch(): void {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredInnovations = this.innovations.filter((i) => {
      const title = i.title_th?.toLowerCase() || '';
      const researchers = this.mapInnovation(i.own).toLowerCase();

      return title.includes(keyword) || researchers.includes(keyword);
    });

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
    return Math.ceil(this.filteredInnovations.length / this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  viewDetails(id: number): void {
    this.router.navigate(['/performance-public/innovation', id]);
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
