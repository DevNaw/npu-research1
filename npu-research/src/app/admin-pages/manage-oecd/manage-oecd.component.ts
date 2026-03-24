import { Component } from '@angular/core';
import { MainComponent } from '../../shared/layouts/main/main.component';
import { OECDChild, OECDMajor, OECDSub } from '../../models/oecd.model';
import { OECDService } from '../../services/oecd.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-manage-oecd',
  standalone: false,
  templateUrl: './manage-oecd.component.html',
  styleUrl: './manage-oecd.component.css'
})
export class ManageOecdComponent {
  showModal = false;
  modalMode: 'add' | 'edit' = 'add';
  modalSub: 'add' | 'edit' = 'add';
  pageSize = 3;
  currentPage = 1;
  searchText = '';
  majors: any[] = [];
  oecdList: OECDMajor[] = [];
  selectedMajor: OECDMajor | null = null;
  selectedSub: OECDSub | null = null;
  selectedChild: OECDChild | null = null;
  filteredMajors: OECDMajor[] = [];

  newMajor: any = {
    parent_id: 0,
    code: '',
    name_th: '',
    level: 1,
    sort_order: 0,
  };

  newSub: any = {
    parent_id: 0,
    code: '',
    name_th: '',
    level: 2,
    sort_order: 0,
  };

  constructor(
    private service: OECDService,
  ) {}

  ngOnInit() {
    MainComponent.showLoading();
    Promise.all([
      this.loadOECD(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => MainComponent.hideLoading());
  }

  loadOECD() {
    this.service.getOECD().subscribe({
      next: (res) => {
        this.oecdList = res.data.oecd;
        this.filteredMajors = [...this.oecdList];
      },
      error: () => {
        Swal.fire('โหลดข้อมูลไม่สำเร็จ', '', 'error');
      },
    });
  }

  onSearch(){}

  printPage(){}

  exportExcel(){}

  

  closeModal() {
    this.showModal = false;
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  get totalPages(): number {
    return Math.ceil(this.filteredMajors.length / this.pageSize);
  }
  get paginatedOrganizations() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredMajors.slice(start, start + this.pageSize);
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

    for (
      let i = Math.max(2, current - 1);
      i <= Math.min(total - 1, current + 1);
      i++
    ) {
      pages.push(i);
    }

    if (current < total - 2) pages.push('...');

    pages.push(total);

    return pages;
  }

  // ======== ADD EDIT =======
  openEditModal(item: OECDMajor) {
    this.modalMode = 'edit';
    this.newMajor = { ...item };
    this.showModal = true;
  }

  openAddModal() {
    this.modalMode = 'add';
    this.showModal = true;
    this.newMajor.sort_order = this.oecdList.length + 1;
    this.newMajor.code = '0' + this.newMajor.sort_order;
  }

  openAddSubModal(major: OECDMajor, mi: number) {
    this.modalMode = 'add';
    this.showModal = true;
    this.newMajor.parent_id = major.major_id;
    this.newSub.code = major.code + '.0' + (major.children.length + 1);
    this.newSub.sort_order = mi + 1;
  }

  // ====== Save Update ======
  saveMajor() {
    if (!this.newMajor.name_th || !this.newMajor.code) {
      Swal.fire('กรุณากรอกข้อมูลให้ครบถ้วน', '', 'warning');
      return;
    }

    this.service.createOECD(this.buildMajorData()).subscribe({
      next: () => {
        this.loadOECD();
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

  updateMajor(id: number) {
    if (!this.newMajor.name_th || !this.newMajor.code) {
      Swal.fire('/tosuกรอกข้อมูลให้ครบถ้วน', '', 'warning');
      return;
    }

    this.service.updateOECD(id, this.buildMajorData()).subscribe({
      next: () => {
        this.loadOECD();
        this.closeModal();
        Swal.fire({
          icon: 'success',
          title: 'แก้ไขสำเร็จ',
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
        });
      },
      error: () => Swal.fire('แก้ไขไม่สำเร็จ', '', 'error'),
    });
  }

  saveSub() {
    if (!this.newSub.name_th || !this.newSub.code) {
      Swal.fire('/tosuกรอกข้อมูลให้ครบถ้วน', '', 'warning');
      return;
    }

    this.service.createOECD(this.buildSubData()).subscribe({
      next: () => {
        this.loadOECD();
        this.closeModal();
        Swal.fire({
          icon: 'success',
          title: 'توج้้สร้างสำเร็จ',
          showConfirmButton: false,
          timer: 1000,
          timerProgressBar: true,
        });
      },
      error: () => Swal.fire('توج้้สร้างไม่สำเร็จ', '', 'error'),
    });
  }

  // ====== Build Data ======
  private buildMajorData(): Partial<OECDMajor> {
    const d = this.newMajor;
    return {
      ...(d.parent_id && { parent_id: d.parent_id }),
      ...(d.code && { code: d.code }),
      ...(d.name_th && { name_th: d.name_th }),
      ...(d.level && { level: d.level }),
      ...(d.sort_order && { sort_order: d.sort_order }),
    };
  }

  private buildSubData(): Partial<OECDSub> {
    const d = this.newSub;
    return {
      ...(d.parent_id && { parent_id: d.parent_id }),
      ...(d.code && { code: d.code }),
      ...(d.name_th && { name_th: d.name_th }),
      ...(d.level && { level: d.level }),
      ...(d.sort_order && { sort_order: d.sort_order }),
    };
  }

}
