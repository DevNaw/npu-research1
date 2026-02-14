import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Data } from '../../models/data-performance.model';
import { ResearchService } from '../../services/research.service';

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

  articles: Data[] = [];

  filteredArticles: Data[] = [];
  paginatedArticles: Data[] = [];

  constructor(
    private router: Router,
    private researchService: ResearchService,
  ) {}

  

  ngOnInit(): void {
    this.getDatArticle();
      this.filteredArticles = [...this.articles];
      this.updatePagination();
  }

  onSearch(): void {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredArticles = this.articles.filter(
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
    return Math.ceil(this.articles.length / this.pageSize);
  }

  viewAticleDetails(id: number): void {
    this.router.navigate(['/performance/article', id]);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  getDatArticle() {
    this.researchService.getDataArticlePublic().subscribe({
      next: (res) => {
        const article = res.data.articles;

        this.articles = article.map((a: any) => ({
          id: a.article_id,
          title: a.title_th,
          date: this.formatThaiDate(a.published_date),
          researchers: this.mapArticle(a.own),
          imgUrl: a.img_url
        }));

        this.filteredArticles = [...this.articles];
        this.updatePagination();
      },
      error: (err) => {
        console.error('โหลดข้อมูลล้มเหลว', err);
      }
    });
  }

  mapArticle(owners: any[]): string {
    if (!owners || owners.length === 0) return '-';

    return owners
    .map(o => o.full_name)
    .join(', ');
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
