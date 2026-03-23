import { Component } from '@angular/core';
import { Manual } from '../../models/manual.model';
import { ManualService } from '../../services/manual.service';
import { MainComponent } from '../../shared/layouts/main/main.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manual',
  standalone: false,
  templateUrl: './manual.component.html',
  styleUrl: './manual.component.css',
})
export class ManualComponent {
  documents: Manual[] = [];
  pageSize = 10;
  currentPage = 1;
  searchText: string = '';

  constructor(private service: ManualService) {}

  ngOnInit() {
    MainComponent.showLoading();
    Promise.all([
      this.loadDocuments(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => MainComponent.hideLoading());
  }

  loadDocuments() {
    this.service.getDocumentsPublic().subscribe({
      next: (res) => {
        this.documents = res.data.manuals;
      },
      error: (err) => console.error(err),
    });
  }

  downloadFile(id: number, url: string) {
    this.service.downloadDocument(id).subscribe({
      next: () => {
        window.open(url, '_blank');
        this.loadDocuments();
      },
      error: (err) => console.error(err),
    });
  }

  get totalPages(): number {
    return Math.ceil(this.documents.length / this.pageSize);
  }

  get paginatedDocuments() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.documents.slice(start, start + this.pageSize);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
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
