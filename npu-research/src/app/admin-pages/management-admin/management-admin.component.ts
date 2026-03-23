import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AdminNewsService } from '../../services/admin-news.service';
import { MainComponent } from '../../shared/layouts/main/main.component';
import { ManagementService } from '../../services/management.service';
import { Admin, AdminDataPayload, Update } from '../../models/management-admin.model';

@Component({
  selector: 'app-management-admin',
  standalone: false,
  templateUrl: './management-admin.component.html',
  styleUrl: './management-admin.component.css',
})
export class ManagementAdminComponent {
 
  isModalOpen = false;
  passwordData: any = {};
  admins: Admin[] = [];
  filteredAdmins: Admin[] = [];

  adminsData:  AdminDataPayload | null = null;
  updateAdmin: Update | null = null;

  pageSize = 10;
  currentPage = 1;
  searchText: string = '';
  showModal = false;
  showModalEdit = false;
  modalMode: 'add' | 'edit' = 'add';

  constructor(private router: Router, private service: AdminNewsService, private managementService: ManagementService) {}

  ngOnInit() {
    MainComponent.showLoading();
    Promise.all([
      this.loadAdmins(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => MainComponent.hideLoading());
  }

  loadAdmins() {
    this.managementService.getAdmins().subscribe({
      next: (res) => {
        this.admins = res.data.admins;
        this.filteredAdmins = [...this.admins];
      },
      error: (err) => console.error(err),
    });
  }


  editNews(id: number) {
    this.router.navigate(['/admin/news/edit', id]);
  }

  onSearch() {
    this.filteredAdmins = this.admins.filter((n) =>
      n.first_name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  get paginatedAdmins() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredAdmins.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this.filteredAdmins.length / this.pageSize);
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

  deleteAdmin(id: number) {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      text: 'ข้อมูลนี้จะไม่สามารถกู้คืนได้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (result.isConfirmed) {
        this.managementService.deleteAdmin(id).subscribe({
          next: () => {
            this.loadAdmins();
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

  openAddModal() {
    this.modalMode = 'add';
    this.showModal = true;
  
    this.adminsData = {
      id: 0,
      first_name: '',
      last_name: '',
      email: '',
      password: ''
    };
  }

  openEditModal(admin: Admin) {
    this.showModalEdit = true;
  
    this.updateAdmin = {
      id: admin.id,
      first_name: admin.first_name,
      last_name: admin.last_name,
      email: admin.email,
      password: ''
    };
  }

  closeModal() {
    this.showModal = false;
    this.showModalEdit = false;
    this.resetForm();
  }

  saveExpertise() {
    if (!this.adminsData) return;
    Swal.fire({
      title: 'กำลังดำเนินการ...',
      text: 'กรุณารอสักครู่',
      timer: 1000,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.managementService.createAdmin(this.adminsData).subscribe({
      next: () => {
        this.loadAdmins();
        this.resetForm();
        this.closeModal();
        Swal.fire({
          icon: 'success',
            title: 'บันทึกสำเร็จ',
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true
        });
      },
      error: () => Swal.fire('เกิดข้อผิดพลาด', '', 'error'),
    });
  }

  updateExpertise() {
    if (!this.updateAdmin) return;
  
    const payload: any = { ...this.updateAdmin };
  
    // ถ้าไม่ได้กรอกรหัสใหม่ → ไม่ต้องส่ง
    if (!payload.password || payload.password.trim() === '') {
      delete payload.password;
    }
  
    Swal.fire({
      title: 'กำลังดำเนินการ...',
      text: 'กรุณารอสักครู่',
      timer: 1000,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  
    this.managementService.updateAdmin(payload.id, payload).subscribe({
      next: () => {
        this.loadAdmins();
        this.closeModal();
  
        Swal.fire({
          icon: 'success',
          title: 'แก้ไขสำเร็จ',
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
        });
      },
      error: () =>
        Swal.fire({
          icon: 'error',
          title: 'แก้ไขไม่สำเร็จ',
        }),
    });
  }

  resetForm() {
    this.adminsData = {
      id: 0,
      first_name: '',
      last_name: '',
      email: '',
      password: ''
    };
    this.updateAdmin = {
      id: 0,
      first_name: '',
      last_name: '',
      email: '',
      password: ''
    };
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
