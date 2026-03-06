import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NewsItem } from '../../models/news.model';
import { AdminNewsService } from '../../services/admin-news.service';
import { MainComponent } from '../../shared/layouts/main/main.component';

@Component({
  selector: 'app-management-user',
  standalone: false,
  templateUrl: './management-user.component.html',
  styleUrl: './management-user.component.css'
})
export class ManagementUserComponent {
  news: NewsItem[] = [];
  filteredNews: NewsItem[] = [];
  isModalOpen = false;
  passwordData: any = {};

  pageSize = 10;
  currentPage = 1;
  searchText: string = '';
  showModal = false;
  modalMode: 'add' | 'edit' = 'add';

  constructor(private router: Router, private service: AdminNewsService) {}

  ngOnInit() {
    MainComponent.showLoading();
    Promise.all([
      this.loadNews(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => MainComponent.hideLoading());
  }

  loadNews() {
    this.service.getNews().subscribe({
      next: (res) => {
        this.news = res.data.news;
        this.filteredNews = [...this.news];
      },
      error: (err) => console.error(err),
    });
  }

  editNews(id: number) {
    this.router.navigate(['/admin/news/edit', id]);
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
    this.router.navigate(['/admin/news/create']);
  }

  deleteNews(id: number) {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      text: 'ข้อมูลนี้จะไม่สามารถกู้คืนได้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (result.isConfirmed) {
  
        this.service.deleteNews(id).subscribe({
          next: () => {
            this.loadNews();
            Swal.fire({
              icon: 'success',
              title: 'ลบเรียบร้อย',
              timer: 1500,
              showConfirmButton: false,
            });
          },
          error: (err) => console.error(err),
        });
  
      }
    });
  }

  openModal() {
    this.isModalOpen = true;
    this.passwordData = {
      password: '',
      confirm_password: '',
    };
  }

  closeModal() {
    this.isModalOpen = false;
  }

  save() {}
}
