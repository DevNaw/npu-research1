import { Component, OnInit } from '@angular/core';
import { MainComponent } from '../../shared/layouts/main/main.component';
import { ResearchItem, ResearchSection, ResearchType } from '../../models/dashboard-main.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-manage-project',
  standalone: false,
  templateUrl: './manage-project.component.html',
  styleUrl: './manage-project.component.css'
})
export class ManageProjectComponent implements OnInit {
  searchText: string = '';
  filteredDocuments: any[] = [];
  totalAcademic: number = 0;
  totalSupport: number = 0;
  selectedTab: ResearchType = 'PROJECT';
  paginatedPublications: ResearchItem[] = [];
  filteredResearch: ResearchItem[] = [];
  today = new Date();
  documents: any[] = [
    {
      title: 'ผู้ผู้...',
      academic: 5,
      support: 3,
    },
    {
      title: 'ผู้ผู้...',
      academic: 5,
      support: 3,
    },
  ];
  pageSize = 10;
  currentPage = 1;

  publications: ResearchSection = {
    projects: [],
    articles: [],
    innovations: [],
  };

  constructor(private router: Router) {}

  ngOnInit() {
    MainComponent.showLoading();
    Promise.all([
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => MainComponent.hideLoading());
  }

  onSearch() {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredDocuments = this.documents.filter((p) =>
      p.title.toLowerCase().includes(keyword)
    );
  }

  get totalPages(): number {
    return Math.ceil(this.documents.length / this.pageSize);
  }

  get paginatedReseacrchs() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.documents.slice(startIndex, startIndex + this.pageSize);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    if (page === this.currentPage) return;

    this.currentPage = page;
  }
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changeTab(tab: ResearchType): void {
      this.selectedTab = tab;
      this.searchText = '';
      this.currentPage = 1;
  
      const key = this.mapResearchTypeToKey(tab);
      this.filteredResearch = [...this.publications[key]];
  
      this.updatePagination();
    }

    private mapResearchTypeToKey(type: ResearchType): keyof ResearchSection {
        switch (type) {
          case 'PROJECT':
            return 'projects';
          case 'ARTICLE':
            return 'articles';
          case 'INNOVATION':
            return 'innovations';
        }
      }

      updatePagination(): void {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        this.paginatedPublications = this.filteredResearch.slice(start, end);
      }

      viewItem(id: number) {
        this.router.navigate([
          '/performance-public',
          this.selectedTab.toLowerCase(),
          id,
        ]);
      }
}
