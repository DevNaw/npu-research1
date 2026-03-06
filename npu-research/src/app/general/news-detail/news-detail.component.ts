import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NewsService } from '../../services/news.service';
import { News } from '../../models/news-detail.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MainComponent } from '../../shared/layouts/main/main.component';

@Component({
  selector: 'app-news-detail',
  standalone: false,
  templateUrl: './news-detail.component.html',
  styleUrl: './news-detail.component.css',
})
export class NewsDetailComponent implements OnInit {
  newsId!: number;
  newsDetail?: News;
  safeDescription!: SafeHtml;

  constructor(
    private route: ActivatedRoute,
    private service: NewsService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    MainComponent.showLoading();
    this.newsId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadNewsDetail(this.newsId);
    MainComponent.hideLoading();
  }

  loadNewsDetail(id: number) {
    this.service.getNewsDetail(id).subscribe({
      next: (res) => {
        this.newsDetail = res.data.news;

        const html = this.cleanHtml(this.newsDetail?.description || '');

        this.safeDescription = this.sanitizer.bypassSecurityTrustHtml(html);
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  // ====== clean html ========
  cleanHtml(html: string): string {
    if (!html) return '';

    html = html
      .replace(/background-color:[^;"]+;?/gi, '')
      .replace(/font-family:[^;"]+;?/gi, '');
    html = html.replace(
      /<img([^>]*)>/gi,
      '<img$1 class="max-w-full h-auto rounded-lg my-2 inline-block">'
    );

    html = html.replace(
      /<a /gi,
      '<a target="_blank" rel="noopener noreferrer" class="text-blue-600 underline break-all" '
    );

    html = html.replace(
      /(^|[\s>])(https?:\/\/[^\s<]+)/gi,
      '$1<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline break-all">$2</a>'
    );

    return html;
  }
}
