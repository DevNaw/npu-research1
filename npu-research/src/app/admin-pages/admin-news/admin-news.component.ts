import { Component } from '@angular/core';
import Swal from 'sweetalert2';

export interface News {
  title: string;
  category: string;
  link: string;
  date: Date;
  dateend: Date;
}

@Component({
  selector: 'app-admin-news',
  standalone: false,
  templateUrl: './admin-news.component.html',
  styleUrl: './admin-news.component.css',
})
export class AdminNewsComponent {
  pageSize = 10;
  currentPage = 1;
  searchText: string = '';
  showModal = false;
  modalMode: 'add' | 'edit' = 'add';
  editIndex: number | null = null;

  news: News[] = [
    {
      title: 'เปิดรับข้อเสนอโครงการวิจัย ประจำปีงบประมาณ 2569',
      category: 'งานวิจัย',
      link: 'https://research.npu.ac.th/news/research-2569',
      date: new Date('2025-10-01'),
      dateend: new Date('2025-12-31'),
    },
    {
      title: 'ประกาศทุนสนับสนุนงานวิจัยจาก สกสว. รอบที่ 2',
      category: 'ทุนวิจัย',
      link: 'https://research.npu.ac.th/news/tsri-round2',
      date: new Date('2025-09-15'),
      dateend: new Date('2025-11-30'),
    },
    {
      title: 'ขอเชิญเข้าร่วมอบรมการเขียนบทความวิจัยเพื่อตีพิมพ์ระดับนานาชาติ',
      category: 'อบรม/สัมมนา',
      link: 'https://research.npu.ac.th/news/international-paper-workshop',
      date: new Date('2025-08-20'),
      dateend: new Date('2025-08-25'),
    },
  ];

  filteredNews = [...this.news];

  onSearch() {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredNews = this.news.filter((n) =>
      n.title.toLowerCase().includes(keyword)
    );
  }

  get totalPages(): number {
    return Math.ceil(this.news.length / this.pageSize);
  }

  get paginatedNews() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.news.slice(startIndex, startIndex + this.pageSize);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  newNews: News = {
    title: '',
    category: '',
    link: '',
    date: new Date(),
    dateend: new Date(),
  };

  openAddModal() {
    (this.modalMode = 'add'),
      (this.newNews = {
        title: '',
        category: '',
        link: '',
        date: new Date(),
        dateend: new Date(),
      });
    this.showModal = true;
  }

  openEditModal(item: any, index: number) {
    (this.modalMode = 'edit'),
      (this.editIndex = index),
      (this.newNews = { ...item });
    this.showModal = true;
  }

  updateNews() {
    if (this.editIndex === null) return;

    this.news[this.editIndex] = { ...this.newNews };
    this.onSearch();
    this.closeModal();
  }

  closeModal() {
    this.showModal = false;
    this.resetForm();
  }

  saveNews() {
    if (!this.newNews.title || !this.newNews.category || !this.newNews.link) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบ',
        text: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        confirmButtonText: 'ตกลง',
      });
      return;
    }

    this.news.push({ ...this.newNews });
    this.onSearch();
    this.closeModal();

    Swal.fire({
      icon: 'success',
      title: 'บันทึกสำเร็จ',
      text: 'เพิ่มข้อมูลข่าวเรียบร้อย',
      timer: 1500,
      showConfirmButton: false,
    });
  }

  resetForm() {
    this.newNews = {
      title: '',
      category: '',
      link: '',
      date: new Date(),
      dateend: new Date(),
    };
  }

  delectNews(index: number) {
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
        this.news.splice(index, 1);
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
