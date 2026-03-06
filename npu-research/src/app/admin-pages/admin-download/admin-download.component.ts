import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { DocumentItem } from '../../models/admin-document.model';
import { AdminDocService } from '../../services/admin-doc.service';
import { MainComponent } from '../../shared/layouts/main/main.component';

@Component({
  selector: 'app-admin-download',
  standalone: false,
  templateUrl: './admin-download.component.html',
  styleUrl: './admin-download.component.css',
})
export class AdminDownloadComponent {
  pageSize = 10;
  currentPage = 1;
  searchText: string = '';
  showModal = false;
  modalMode: 'add' | 'edit' = 'add';

  documents: DocumentItem[] = [];
  filteredDocument: DocumentItem[] = [];
  selectedFile: File | null = null;
  newDocument: DocumentItem = {
    docId: 0,
    doc_name: '',
    file_url: '',
    download_count: 0,
  };

  constructor(private service: AdminDocService) {}

  ngOnInit() {
    MainComponent.showLoading();
    Promise.all([
      this.loadDocuments(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => MainComponent.hideLoading());
  }

  loadDocuments() {
    this.service.getDocuments().subscribe({
      next: (res) => {
        this.documents = res.data.documents;
        this.filteredDocument = [...this.documents];
      },
      error: (err) => console.error(err),
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

  openAddModal() {
    this.modalMode = 'add';
    this.selectedFile = null;
    this.newDocument = {
      docId: 0,
      doc_name: '',
      file_url: '',
      download_count: 0,
    };
    this.showModal = true;
  }

  get currentFileName(): string {
    if (!this.newDocument.file_url) return '';
    return this.newDocument.file_url.split('/').pop() || '';
  }

  openEditModal(items: DocumentItem) {
    this.modalMode = 'edit';
    this.selectedFile = null;
    this.newDocument = { ...items };
    this.showModal = true;
  }

  updateDocument() {
    if (!this.newDocument.doc_name) {
      Swal.fire('กรุณากรอกชื่อเอกสาร', '', 'warning');
      return;
    }
  
    const formData = new FormData();
    formData.append('doc_name', this.newDocument.doc_name);
  
    if (this.selectedFile) {
      formData.append('file_doc', this.selectedFile);
    }
  
    this.service
      .updateDocument(this.newDocument.docId, formData)
      .subscribe({
        next: () => {
          this.loadDocuments();
          this.closeModal();
          Swal.fire({
            icon: 'success',
            title: 'แก้ไขสำเร็จ',
            showConfirmButton: false,
            timer: 1000,
          });
        },
        error: () =>
          Swal.fire({
            icon: 'error',
            title: 'แก้ไขไม่สำเร็จ',
          }),
      });
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  saveDocument() {
    if (!this.newDocument.doc_name) {
      Swal.fire('กรุณากรอกชื่อเอกสาร', '', 'warning');
      return;
    }
  
    if (this.modalMode === 'add' && !this.selectedFile) {
      Swal.fire('กรุณาเลือกไฟล์เอกสาร', '', 'warning');
      return;
    }
  
    const formData = new FormData();
    formData.append('doc_name', this.newDocument.doc_name);
  
    if (this.selectedFile) {
      formData.append('file_doc', this.selectedFile);
    }
  
    this.service.createDocument(formData).subscribe({
      next: () => {
        this.loadDocuments();
        this.closeModal();
        Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          showConfirmButton: false,
          timer: 1000,
        });
      },
      error: () => {
        Swal.fire('เกิดข้อผิดพลาด', '', 'error');
      },
    });
  }

  resetForm() {
    this.newDocument = {
      docId: 0,
      doc_name: '',
      file_url: '',
      download_count: 0,
    };
  }

  deleteDocument(id: number) {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.service.deleteDocument(id).subscribe({
        next: () => {
          this.loadDocuments();
          Swal.fire({
            icon: 'success',
            title: 'ลบสำเร็จ',
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true,
          });
        },
        error: () =>
          Swal.fire({
            icon: 'error',
            title: 'ลบไม่สำเร็จ',
          }),
      });
    });
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }
}
