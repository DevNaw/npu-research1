import { Component, HostListener } from '@angular/core';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { Funding } from '../../models/admin-funding.model';
import { AdminFundingService } from '../../services/admin-funding.service';
import { MainComponent } from '../../shared/layouts/main/main.component';

@Component({
  selector: 'app-external-funding',
  standalone: false,
  templateUrl: './external-funding.component.html',
  styleUrl: './external-funding.component.css',
})
export class ExternalFundingComponent {
  pageSize = 10;
  currentPage = 1;
  searchText = '';
  today = new Date();

  showModal = false;
  modalMode: 'add' | 'edit' = 'add';
  isStatusOpen = false;

  fundings: Funding[] = [];
  filteredFundings: Funding[] = [];
  selectedFunding: Funding | null = null;

  constructor(private service: AdminFundingService) {}

  ngOnInit(): void {
    MainComponent.showLoading();
    Promise.all([
      this.loadFunding(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => MainComponent.hideLoading());
  }

  loadFunding() {
    this.service.getFunding().subscribe({
      next: (res) => {
        this.fundings = res.data.fundings || [];
        this.filteredFundings = [...this.fundings];
      },
      error: () => {
        Swal.fire('โหลดข้อมูลไม่สำเร็จ', '', 'error');
      },
    });
  }

  onSearch() {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredFundings = this.fundings.filter((p) =>
      p.funding_name.toLowerCase().includes(keyword)
    );

    this.currentPage = 1;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredFundings.length / this.pageSize) || 1;
  }

  get paginatedExternalFunding() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredFundings.slice(start, start + this.pageSize);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  exportExcel() {
    Swal.fire('ไม่ได้เปิดใช้งาน', '', 'info');
  }

  printPage() {
    Swal.fire('ไม่ได้เปิดใช้งาน', '', 'info');
  }

  openAddModal() {
    this.modalMode = 'add';
    this.selectedFunding = {
      id: 0,
      funding_name: '',
      description: '',
      is_active: 1,
    };

    this.showModal = true;
  }

  openEditModal(item: Funding) {
    this.modalMode = 'edit';
    this.selectedFunding = { ...item };
    this.showModal = true;
  }

  updateFunding() {
    if (!this.selectedFunding) return;

    this.service
      .updateFunding(this.selectedFunding.id, this.selectedFunding)
      .subscribe({
        next: () => {
          this.loadFunding();
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
            title: 'เกิดข้อผิดพลาด',
          }),
      });
  }

  closeModal() {
    this.showModal = false;
    this.isStatusOpen = false;
    this.resetForm();
  }

  saveFunding() {
    if (!this.selectedFunding) return;

    this.service.createFunding(this.selectedFunding).subscribe({
      next: () => {
        this.loadFunding();
        this.resetForm();
        this.closeModal();
        Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
        });
      },
      error: () => Swal.fire('เกิดข้อผิดพลาด', '', 'error'),
    });
  }

  resetForm() {
    this.selectedFunding = {
      id: 0,
      funding_name: '',
      description: '',
      is_active: 1,
    };
  }

  delectFunding(id: number) {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.service.deleteFunding(id).subscribe({
        next: () => {
          this.loadFunding();
          Swal.fire({
            icon: 'success',
            title: 'ลบสำเร็จ',
            showConfirmButton: false,
            timer: 1000,
            timerProgressBar: true,
          });
        },
      });
    });
  }

  selectStatus(value: 0 | 1) {
    if (!this.selectedFunding) return;
    this.selectedFunding.is_active = value;
    this.isStatusOpen = false;
  }

  @HostListener('document:click')
  onDocumentClick() {
    if (this.isStatusOpen) {
      this.isStatusOpen = false;
    }
  }
}
