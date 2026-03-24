import { Component } from '@angular/core';
import { MainComponent } from '../../shared/layouts/main/main.component';
import { OECDChild, OECDMajor, OECDSub } from '../../models/oecd.model';
import { OECDService } from '../../services/oecd.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-manage-oecd',
  standalone: false,
  templateUrl: './manage-oecd.component.html',
  styleUrl: './manage-oecd.component.css',
})
export class ManageOecdComponent {
  showModal = false;
  showSubModal = false;
  showChildModal = false;
  modalMode: 'add' | 'edit' = 'add';
  modalSub: 'add' | 'edit' = 'add';
  modalChild: 'add' | 'edit' = 'add';
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

  newChild: any = {
    parent_id: 0,
    code: '',
    name_th: '',
    level: 3,
    sort_order: 0,
  };

  constructor(private service: OECDService, private authService: AuthService) {}

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

  onSearch() {}

  printPage() {}

  exportExcel() {}

  closeModal() {
    this.showModal = false;
    this.showSubModal = false;
    this.showChildModal = false;
    this.resetForm();
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

  // ======== ADD =======
  openAddModal() {
    this.modalMode = 'add';
    this.showModal = true;
    this.newMajor.sort_order = this.oecdList.length + 1;
    this.newMajor.code = '0' + this.newMajor.sort_order;
  }

  openAddSubModal(major: OECDMajor, mi: number) {
    this.showSubModal = true; // แทน showModal
    this.modalSub = 'add';
    this.newSub.parent_id = major.major_id;
    this.newSub.code = major.code + '.0' + (major.children.length + 1);
    this.newSub.sort_order = mi + 1;
  }

  openAddChildModal(sub: OECDSub, si: number) {
    this.showChildModal = true; // แทน showModal
    this.modalChild = 'add';
    this.newChild.parent_id = sub.sub_id;
    this.newChild.code = sub.code + '.0' + (sub.children.length + 1);
    this.newChild.sort_order = si + 1;
  }

  // ======= EDIT =======
  openEditModal(item: OECDMajor) {
    this.modalMode = 'edit';
    this.newMajor = { ...item };
    this.showModal = true;
  }

  openEditSubModal(sub: OECDSub, si: number) {
    this.showSubModal = true; // แทน showModal
    this.modalSub = 'edit';
    this.newSub = { ...sub };
  }

  openEditChildModal(child: OECDChild) {
    this.showChildModal = true; // แทน showModal
    this.modalChild = 'edit';
    this.newChild = { ...child };
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

  saveSub() {
    if (!this.newSub.name_th || !this.newSub.code) {
      Swal.fire('กรุณากรอกข้อมูลให้ครบถ้วน', '', 'warning');
      return;
    }

    this.service.createOECD(this.buildSubData()).subscribe({
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
      error: () => Swal.fire('บันทึกไม่สำเร็จ', '', 'error'),
    });
  }

  saveChild() {
    if (!this.newChild.name_th || !this.newChild.code) {
      Swal.fire('กรุณากรอกข้อมูลให้ครบถ้วน', '', 'warning');
      return;
    }

    this.service.createOECD(this.buildChildData()).subscribe({
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
      error: () => Swal.fire('บันทึกไม่สำเร็จ', '', 'error'),
    });
  }

  updateMajor(id: number) {
    if (!this.newMajor.name_th || !this.newMajor.code) {
      Swal.fire('กรุณากรอกข้อมูลให้ครบถ้วน', '', 'warning');
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

  updateSub(id: number) {
    if (!this.newSub.name_th || !this.newSub.code) {
      Swal.fire('กรุณากรอกข้อมูลให้ครบถ้วน', '', 'warning');
      return;
    }

    this.service.updateOECD(id, this.buildSubData()).subscribe({
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

  updateChild(id: number) {
    if (!this.newChild.name_th || !this.newChild.code) {
      Swal.fire('กรุณากรอกข้อมูลให้ครบถ้วน', '', 'warning');
      return;
    }

    this.service.updateOECD(id, this.buildChildData()).subscribe({
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

  // ======= Delete =======
  deleteMajor(id: number) {
    this.confirmDeleteWithPassword(id);
  }
  deleteSub(id: number) {
    this.confirmDeleteWithPassword(id);
  }
  deleteChild(id: number) {
    this.confirmDeleteWithPassword(id);
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

  private buildChildData(): Partial<OECDChild> {
    const d = this.newChild;
    return {
      ...(d.parent_id && { parent_id: d.parent_id }),
      ...(d.code && { code: d.code }),
      ...(d.name_th && { name_th: d.name_th }),
      ...(d.level && { level: d.level }),
      ...(d.sort_order && { sort_order: d.sort_order }),
    };
  }

  // ======= Reset Form =======
  resetForm() {
    this.newMajor = {
      parent_id: 0,
      code: '',
      name_th: '',
      level: 1,
      sort_order: 0,
    };
    this.newSub = {
      parent_id: 0,
      code: '',
      name_th: '',
      level: 2,
      sort_order: 0,
    };
    this.newChild = {
      parent_id: 0,
      code: '',
      name_th: '',
      level: 3,
      sort_order: 0,
    };
  }

  private confirmDeleteWithPassword(id: number) {
    Swal.fire({
      title: 'ยืนยันการลบข้อมูล',
      text: 'กรุณาใส่รหัสผ่านของคุณเพื่อยืนยัน',
      icon: 'warning',
      input: 'password',
      inputPlaceholder: 'กรอกรหัสผ่าน',
      inputAttributes: { autocomplete: 'current-password' },
      showCancelButton: true,
      confirmButtonText: 'ยืนยันการลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#e53e3e',
      preConfirm: (password) => {
        if (!password) {
          Swal.showValidationMessage('กรุณากรอกรหัสผ่าน');
          return false;
        }
        return password;
      },
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.authService.verifyPassword(result.value).subscribe({
        next: (valid) => {
          if (!valid) {
            Swal.fire('รหัสผ่านไม่ถูกต้อง', '', 'error');
            return;
          }

          this.service.deleteOECD(id).subscribe({
            next: () => {
              this.loadOECD();
              Swal.fire({
                icon: 'success',
                title: 'ลบข้อมูลสำเร็จ',
                timer: 1500,
                showConfirmButton: false,
              });
            },
            error: () => Swal.fire('ลบข้อมูลไม่สำเร็จ', '', 'error'),
          });
        },
        error: () => Swal.fire('รหัสผ่านไม่ถูกต้อง', '', 'error'),
      });
    });
  }
}
