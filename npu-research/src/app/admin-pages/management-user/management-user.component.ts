import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { NewsItem } from '../../models/news.model';
import { AdminNewsService } from '../../services/admin-news.service';
import { MainComponent } from '../../shared/layouts/main/main.component';
import { User } from '../../models/management-user.model';
import { ManagementService } from '../../services/management.service';

@Component({
  selector: 'app-management-user',
  standalone: false,
  templateUrl: './management-user.component.html',
  styleUrl: './management-user.component.css'
})
export class ManagementUserComponent {
  
  isModalOpen = false;
  passwordData: any = {};

  users: User[] = [];
  filteredUsers: User[] = [];

  pageSize = 10;
  currentPage = 1;
  searchText: string = '';

  constructor(private router: Router, private managementService: ManagementService) {}

  ngOnInit() {
    MainComponent.showLoading();
    Promise.all([
      this.loadUsers(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => MainComponent.hideLoading());
  }

  loadUsers() {
    this.managementService.getUsers().subscribe({
      next: (res) => {
        this.users = res.data.users;
        this.filteredUsers = [...this.users];
      },
      error: (err) => console.error(err),
    });
  }


  editNews(id: number) {
    this.router.navigate(['/admin/news/edit', id]);
  }

  onSearch() {
    this.filteredUsers = this.users.filter(n =>
      n.first_name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  get paginatedUsers() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredUsers.length / this.pageSize);
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

  deleteUser(id: number) {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      text: 'ข้อมูลนี้จะไม่สามารถกู้คืนได้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (result.isConfirmed) {
  
        this.managementService.deleteUser(id).subscribe({
          next: () => {
            this.loadUsers();
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

  openModal(id: number) {
    this.isModalOpen = true;
  
    this.passwordData = {
      id,
      new_password: '',
      confirm_password: '',
    };
  }

  closeModal() {
    this.isModalOpen = false;
  }

  save() {
    if (!this.passwordData.new_password) {
      Swal.fire({
        icon: 'error',
        title: 'ผิดพลาด',
        text: 'รหัสผ่านไม่ตรงกัน',
      });
      return;
    }
  
    this.managementService
      .updatePassword(this.passwordData.id, this.passwordData)
      .subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'สำเร็จ',
            text: 'เปลี่ยนรหัสผ่านสำเร็จ',
            timer: 1500,
            showConfirmButton: false,
          });
  
          this.closeModal();
        },
        error: (err) => {
          console.error(err);
  
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถเปลี่ยนรหัสผ่านได้',
          });
        },
      });
  }
}
