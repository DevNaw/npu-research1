import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NewsService } from '../../services/news.service';
import { News } from '../../models/news-detail.model';

@Component({
  selector: 'app-news-detail',
  standalone: false,
  templateUrl: './news-detail.component.html',
  styleUrl: './news-detail.component.css'
})
export class NewsDetailComponent implements OnInit {
  newsId!: number;

  newsDetail?: News;

  constructor(
    private route: ActivatedRoute,
    private service: NewsService,
  ) {}

  ngOnInit(): void {
    this.newsId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadNewsDetail(this.newsId);
  }

  loadNewsDetail(id: number) {
    this.service.getNewsDetail(id).subscribe({
      next: (res) => {
        this.newsDetail = res.data.news;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}
