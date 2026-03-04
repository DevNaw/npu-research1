import { Component, HostListener } from '@angular/core';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { AdminExpertiseService } from '../../services/admin-expertise.service';
import { Expertise } from '../../models/admin-expertise.model';

type MajorStatus = 'พร้อมใช้งาน' | 'ไม่พร้อมใช้งาน';

export interface Majors {
  name: string;
  description: string;
  status: MajorStatus;
}

@Component({
  selector: 'app-specialization',
  standalone: false,
  templateUrl: './specialization.component.html',
  styleUrl: './specialization.component.css',
})
export class SpecializationComponent {
  pageSize = 10;
  currentPage = 1;
  searchText = '';
  today = new Date();

  showModal = false;
  modalMode: 'add' | 'edit' = 'add';
  isStatusOpen = false;

  expertises: Expertise[] = [];
  filteredExpertises: Expertise[] = [];

  selectedExpertise: Expertise | null = null;

  constructor(private service: AdminExpertiseService) {}

  ngOnInit(): void {
    this.loadExpertise();
  }

  loadExpertise() {
    this.service.getExpertise().subscribe({
      next: (res) => {
        this.expertises = res.data.expertises || [];
        this.filteredExpertises = [...this.expertises];
      },
      error: () => {
        Swal.fire('โหลดข้อมูลไม่สำเร็จ', '', 'error');
      },
    });
  }

  onSearch() {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredExpertises = this.expertises.filter(
      (e) =>
        e.name_th.toLowerCase().includes(keyword) ||
        e.name_en.toLowerCase().includes(keyword)
    );

    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredExpertises.length / this.pageSize) || 1;
  }

  get paginatedExpertises(): Expertise[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredExpertises.slice(start, start + this.pageSize);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  openAddModal() {
    this.modalMode = 'add';
    this.selectedExpertise = {
      expertise_id: 0,
      name_th: '',
      name_en: '',
      is_active: 1,
    };
    this.showModal = true;
  }

  openEditModal(item: Expertise) {
    this.modalMode = 'edit';
    this.selectedExpertise = { ...item };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.isStatusOpen = false;
    this.selectedExpertise = null;
  }

  saveExpertise() {
    if (!this.selectedExpertise) return;

    this.service.createExpertise(this.selectedExpertise).subscribe({
      next: () => {
        this.loadExpertise();
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
    if (!this.selectedExpertise) return;

    this.service
      .updateExpertise(
        this.selectedExpertise.expertise_id,
        this.selectedExpertise
      )
      .subscribe({
        next: () => {
          this.loadExpertise();
          this.closeModal();
      
          Swal.fire({
            icon: 'success',
            title: 'อัปเดตสำเร็จ',
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true
          });
        },
        error: () =>
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด'
          }),
      });
  }

  deleteExpertise(id: number) {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.service.deleteExpertise(id).subscribe({
        next: () => {
          this.loadExpertise();
      
          Swal.fire({
            icon: 'success',
            title: 'ลบสำเร็จ',
            showConfirmButton: false,
            timer: 1500,
            timerProgressBar: true,
          });
        },
        error: () =>
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
          }),
      });
    });
  }

  selectStatus(value: 0 | 1) {
    if (!this.selectedExpertise) return;
    this.selectedExpertise.is_active = value;
    this.isStatusOpen = false;
  }

  @HostListener('document:click')
  closeStatusDropdown() {
    this.isStatusOpen = false;
  }

  printPage() {
    Swal.fire('ยังไม่ได้เปิดใช้งาน Print', '', 'info');
  }

  exportExcel() {
    Swal.fire('ยังไม่ได้เปิดใช้งาน Export', '', 'info');
  }

  resetForm() {
    this.selectedExpertise = {
      expertise_id: 0,
      name_th: '',
      name_en: '',
      is_active: 1,
    };
  }
}
