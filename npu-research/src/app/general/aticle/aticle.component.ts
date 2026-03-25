import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ResearchService } from '../../services/research.service';
import { Article } from '../../models/article-public.model';
import { MainComponent } from '../../shared/layouts/main/main.component';

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

  articles: Article[] = [];
  filteredArticles: Article[] = [];
  paginatedArticles: Article[] = [];

  constructor(
    private router: Router,
    private researchService: ResearchService
  ) {}

  ngOnInit(): void {
    MainComponent.showLoading();
    Promise.all([
      this.getDatArticle(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => MainComponent.hideLoading());
  }

  getDatArticle() {
    this.researchService.getDataArticlePublic().subscribe({
      next: (res) => {
        this.articles = res.data.articles;
        console.log(this.articles);

        this.filteredArticles = [...this.articles];
        this.updatePagination();
      },
    });
  }

  onSearch(): void {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredArticles = this.articles.filter((a) => {
      const fields = [
        a.title_th,
        a.title_en,
        a.research_code,
        a.funding?.source_funds,
        a.oecd?.[0]?.name_th,
        this.mapOwners(a.own),
    ];

      return fields.some((field) =>
        field?.toLowerCase().includes(keyword)
      );
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.paginatedArticles = this.filteredArticles.slice(start, end);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    if (page === this.currentPage) return;

    this.currentPage = page;
    this.updatePagination();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get totalPages(): number {
    return Math.ceil(this.filteredArticles.length / this.pageSize);
  }

  viewAticleDetails(id?: number): void {
    if (!id) {
      console.error('Article ID undefined');
      return;
    }

    this.router.navigate(['/performance-public/article', id]);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  mapOwners(owners: any[]): string {
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

  get visiblePages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: (number | string)[] = [];

    if (total <= 5) {
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
}
