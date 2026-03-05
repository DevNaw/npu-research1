import { Component } from '@angular/core';
import { DocumentItem } from '../../models/admin-document.model';
import { AdminDocService } from '../../services/admin-doc.service';

@Component({
  selector: 'app-download',
  standalone: false,
  templateUrl: './download.component.html',
  styleUrl: './download.component.css'
})
export class DownloadComponent {
  pageSize = 10;
  currentPage = 1;
  searchText: string = '';
  documents: DocumentItem[] = [];
  filteredDocument: DocumentItem[] = [];

  constructor(private service: AdminDocService) {}

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.service.getDocumentsPublic().subscribe({
      next: (res) => {
        this.documents = res.data.documents;
        this.filteredDocument = [...this.documents];
      },
      error: (err) => console.error(err),
    });
  }

  downloadFile(id: number, url: string) {
    this.service.downloadDocument(id).subscribe({
      next: () => {
        window.open(url, '_blank'); // เปิดไฟล์ดาวน์โหลด
        this.loadDocuments();
      },
      error: (err) => {
        console.error(err);
      }
    });
  
  }

  onSearch() {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredDocument = this.documents.filter((d) =>
      d.doc_name.toLowerCase().includes(keyword)
    );
    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredDocument.length / this.pageSize);
  }

  get paginatedDocument() {
    const startIndex = (this.currentPage - 1) * this.pageSize;

    return this.filteredDocument.slice(startIndex, startIndex + this.pageSize);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }
}
