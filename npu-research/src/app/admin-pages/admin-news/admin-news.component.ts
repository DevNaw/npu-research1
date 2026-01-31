import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { News } from '../../models/news.model';

@Component({
  selector: 'app-admin-news',
  standalone: false,
  templateUrl: './admin-news.component.html',
  styleUrl: './admin-news.component.css',
})
export class AdminNewsComponent {
  news: News[] = [
    {
      id: 1,
      title: 'มหาวิทยาลัยนครพนมเผยผลงานวิจัย เสริมศักยภาพการพัฒนาท้องถิ่นอย่างยั่งยืน',
      date: '2026-01-01',
      dateend: '2026-01-31',
    },
    {
      id: 2,
      title: 'งานวิจัย มนพ. ขับเคลื่อนองค์ความรู้สู่การใช้ประโยชน์เชิงพื้นที่',
      date: '2026-02-01',
      dateend: '2026-02-28',
    },
    {
      id: 2,
      title: 'งานวิจัย มนพ. พลังเล็ก ๆ ที่สร้างการเปลี่ยนแปลงใหญ่ให้สังคม',
      date: '2026-02-01',
      dateend: '2026-02-28',
    },
  ];

  filteredNews = [...this.news];

  pageSize = 10;
  currentPage = 1;
  searchText: string = '';
  showModal = false;
  modalMode: 'add' | 'edit' = 'add';
  editIndex: number | null = null;

  constructor(private router: Router) {}

  editNews(news: News) {
    this.router.navigate(['/admin/news/edit', news.id]);
  }

  onSearch() {
    this.filteredNews = this.news.filter(n =>
      n.title.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  get paginatedNews() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredNews.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredNews.length / this.pageSize);
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  createNews() {
    this.router.navigate(['/admin-news/create']);
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
