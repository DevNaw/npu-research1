import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { environment } from '../../environments/environment';
import { ResearchArticle } from '../models/article-show.model';
import { Owner } from '../models/search.model';
import { ResearchService } from '../services/research.service';

@Component({
  selector: 'app-test',
  standalone: false,
  templateUrl: './test.component.html',
  styleUrl: './test.component.css',
})
export class TestComponent {
id: number = 25;
  article: ResearchArticle | null = null;
  owner: Owner | null = null;

  constructor(private service: ResearchService) {}

  ngOnInit(): void {
    this.loadArticle();
  }

  loadArticle(): void {
    this.service.getArticles(this.id).subscribe({
      next: (res) => {
        this.article = res.data.researchArticle;
        this.owner = res.data.owner;

        console.log(this.owner);
        
      },
      error: (err) => console.error(err),
    });
  }
}
