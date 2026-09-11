import { Component, OnInit } from '@angular/core';
import { NewsService } from '../../services/news.service';
import { RdiNewsItem } from '../../models/news.model';
import { Router } from '@angular/router';
import { MainComponent } from '../../shared/layouts/main/main.component';

@Component({
  selector: 'app-news',
  standalone: false,
  templateUrl: './news.component.html',
  styleUrl: './news.component.css',
})
export class NewsComponent implements OnInit {
  currentPage = 1;
  pageSize = 8;

  newsList: RdiNewsItem[] = [];

  constructor(private service: NewsService, private router: Router) {}

  ngOnInit() {
    MainComponent.showLoading();
    Promise.all([
      this.loadNewsList(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => MainComponent.hideLoading());
  }

  // =========== Load News List =================
  loadNewsList(): void {
    this.service.getNewsFromRDI().subscribe({
      next: (res) => {
        this.newsList = res.data;
      },
      error: (err) => {
        console.error('Failed to load RDI news:', err);
      },
    });
  }

  // เปิดข่าวจาก RDI (เป็น url ภายนอก)
  goToNewsDetail(url: string): void {
    if (url) window.open(url, '_blank');
  }

  get totalPages() {
    const pageCount = Math.ceil(this.newsList.length / this.pageSize);
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  get paginatedNews() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.newsList.slice(start, start + this.pageSize);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages.length) return;
    if (page === this.currentPage) return;
    this.currentPage = page;
  }
}