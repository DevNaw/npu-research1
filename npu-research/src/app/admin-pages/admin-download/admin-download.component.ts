import { Component } from '@angular/core';
import Swal from 'sweetalert2';

export interface Documents {
  name: string;
  fileUrl: string;
}

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
  editIndex: number | null = null;

  documents: Documents[] = [
    {
      name: 'แบบฟอร์มขอรับทุนวิจัย',
      fileUrl: 'https://www.example.com/files/research-grant-form.pdf',
    },
    {
      name: 'คู่มือการใช้งานระบบงานวิจัย',
      fileUrl: 'https://www.example.com/files/research-system-manual.pdf',
    },
    {
      name: 'ประกาศหลักเกณฑ์การพิจารณาทุน',
      fileUrl: 'https://www.example.com/files/grant-criteria.pdf',
    },
  ];

  filteredDocument = [...this.documents];

  newDocument: Documents = {
    name: '',
    fileUrl: ''
  }

  onSearch() {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredDocument = this.documents.filter((d) =>
    d.name.toLowerCase().includes(keyword)
  );
  }

  get totalPages(): number {
    return Math.ceil(this.documents.length / this.pageSize);
  }

  get paginatedDocument() {
    const startIndex = (this.currentPage - 1) * this.pageSize;

    return this.documents.slice(startIndex, startIndex + this.pageSize);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  openAddModal() {
    this.modalMode = 'add';
    this.newDocument = { name: '', fileUrl: ''}
    this.showModal = true;
  }

  openEditModal(items: any, index: number){
    this.modalMode = 'edit';
    this.editIndex = index;
    this.newDocument = { ...items };
    this.showModal = true;
  }

  updateDocument() {
    if (this.editIndex === null) return;

    this.documents[this.editIndex] = { ...this.newDocument };
    this.onSearch();
    this.closeModal();
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

saveDocument() {
    if (!this.newDocument.name || !this.newDocument.fileUrl) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบ',
        text: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        confirmButtonText: 'ตกลง',
      });
      return;
    }

    this.documents.push({ ...this.newDocument });
    this.onSearch(); // refresh ตาราง
    this.closeModal();

    Swal.fire({
      icon: 'success',
      title: 'บันทึกสำเร็จ',
      text: 'เพิ่มข้อมูลสาขาเรียบร้อยแล้ว',
      timer: 1500,
      showConfirmButton: false,
    });
  }

  resetForm() {
    this.newDocument = {
      name: '',
      fileUrl: ''
    };
  }

  deleteDocument(index: number) {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      text: 'ข้อมูลนี้จะไม่สามารถกู้คืนได้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (result.isConfirmed) {
        // ลบข้อมูล
        this.documents.splice(index, 1);

        // refresh ตาราง / search
        this.onSearch();

        Swal.fire({
          icon: 'success',
          title: 'ลบเรียบร้อย',
          text: 'ข้อมูลถูกลบแล้ว',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  }
}
