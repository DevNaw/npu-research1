import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NewsService } from '../../services/news.service';
import { News } from '../../models/news-detail.model';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
    this.newsId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadNewsDetail(this.newsId);
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

  cleanHtml(html: string): string {
    if (!html) return '';

    // ลบ background-color จาก Facebook
    html = html.replace(/background-color:[^;"]+/g, '');

    // ทำให้รูป responsive
    html = html.replace(/<img/g, '<img style="max-width:100%;height:auto;"');

    // ให้ link เปิด tab ใหม่
    html = html.replace(/<a /g, '<a target="_blank" rel="noopener" ');

    // ลบ <p> ที่มีแค่อิโมจิ
    html = html.replace(/<p>\s*([\u{1F300}-\u{1FAFF}])\s*<\/p>/gu, '$1');

    return html;
  }
}
