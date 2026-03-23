import { Component } from '@angular/core';
import Swal from 'sweetalert2';
import { MainComponent } from '../../shared/layouts/main/main.component';
import { ManualService } from '../../services/manual.service';
import { Manual } from '../../models/manual.model';

@Component({
  selector: 'app-admin-manual',
  standalone: false,
  templateUrl: './admin-manual.component.html',
  styleUrl: './admin-manual.component.css',
})
export class AdminManualComponent {
  pageSize = 10;
  currentPage = 1;
  searchText: string = '';
  showModal = false;
  modalMode: 'add' | 'edit' = 'add';

  documents: Manual[] = [];
  filteredDocument: Manual[] = [];
  selectedFile: File | null = null;
  manualDocument: Manual = {
    manual_id: 0,
    doc_name: '',
    file_url: '',
    download_count: 0,
  };

  constructor(private service: ManualService) {}

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
        this.documents = res.data.manuals;
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
    console.log('open modal');
    this.modalMode = 'add';
    this.selectedFile = null;
    this.manualDocument = {
      manual_id: 0,
      doc_name: '',
      file_url: '',
      download_count: 0,
    };
    this.showModal = true;
  }

  get currentFileName(): string {
    if (!this.manualDocument.file_url) return '';
    return this.manualDocument.file_url.split('/').pop() || '';
  }

  openEditModal(items: Manual) {
    this.modalMode = 'edit';
    this.selectedFile = null;
    this.manualDocument = { ...items };
    this.showModal = true;
  }

  updateDocument() {
    if (!this.manualDocument.doc_name) {
      Swal.fire('กรุณากรอกชื่อเอกสาร', '', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('doc_name', this.manualDocument.doc_name);

    if (this.selectedFile) {
      formData.append('file_manual', this.selectedFile);
    }

    Swal.fire({
      title: 'กำลังบันทึกข้อมูล...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    this.service.updateDocument(this.manualDocument.manual_id, formData).subscribe({
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
    if (!this.manualDocument.doc_name) {
      Swal.fire('กรุณากรอกชื่อเอกสาร', '', 'warning');
      return;
    }

    if (this.modalMode === 'add' && !this.selectedFile) {
      Swal.fire('กรุณาเลือกไฟล์เอกสาร', '', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append('doc_name', this.manualDocument.doc_name);

    if (this.selectedFile) {
      formData.append('file_manual', this.selectedFile);
    }

    Swal.fire({
      title: 'กำลังบันทึกข้อมูล...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

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
    this.manualDocument = {
      manual_id: 0,
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

  get visiblePages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: (number | string)[] = [];
  
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
  
    pages.push(1);
  
    if (current > 3) pages.push('...');
  
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
  
    if (current < total - 2) pages.push('...');
  
    pages.push(total);
  
    return pages;
  }
}
