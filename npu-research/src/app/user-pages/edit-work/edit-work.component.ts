import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import {
  ExpertiseOption,
  OrganizationOption,
  WorkInfo,
} from '../../models/work.model';
import { WorkService } from '../../services/work.service';

@Component({
  selector: 'app-edit-work',
  standalone: false,
  templateUrl: './edit-work.component.html',
  styleUrl: './edit-work.component.css',
})
export class EditWorkComponent {
  selectedMajors: ExpertiseOption[] = [];
  searchMajor = '';

  organizationOptions: OrganizationOption[] = [];
  selectOrganization: OrganizationOption | null = null;
  searchOrganization = '';

  openDropdown: string | null = null;

  workInfo: WorkInfo = {
    position: '',
    organization: { id: 0, faculty: '' },
    type: '',
    line_work: '',
    academic_position: '',
    interest: '',
    expertise: [{ id: 0, name_th: '', name_en: '' }],
    work_start_date: '',
    year_of_service: 0,
  };
  expertiseOptions: ExpertiseOption[] = [];

  typeOptions: string[] = ['พนักงาน', 'ลูกจ้าง', 'อาจารย์พิเศษ'];

  constructor(private router: Router, private service: WorkService) {}

  ngOnInit() {
    this.loadWork();
  }

  loadWork() {
    this.service.getWorkInfo().subscribe((res) => {
      const data = res?.data?.work_info;

      if (!data) {
        console.error('No work_info from API');
        return;
      }

      if (data.work_start_date) {
        const converted = this.convertThaiDateToISO(data.work_start_date);
        data.work_start_date = converted || '';
      }

      if (!data.organization) {
        data.organization = { id: 0, faculty: '' };
      }

      this.workInfo = data;

      this.expertiseOptions = res.data.expertises || [];
      this.organizationOptions = res.data.organizations || [];

      this.selectOrganization =
        this.organizationOptions.find(
          (o) => o.organization_id === data.organization?.id
        ) || null;

      this.selectedMajors = (data.expertise || []).map((e: any) => ({
        expertise_id: e.id,
        name_th: e.name_th,
        name_en: e.name_en,
      }));
    });
  }

  saveWork() {
    Swal.fire({
      icon: 'warning',
      title: 'ยืนยันการบันทึกข้อมูล',
      text: 'คุณต้องการบันทึกข้อมูลนี้ใช่หรือไม่',
      showConfirmButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#ef4444',
      customClass: {
        title: 'swal-title-lg',
        htmlContainer: 'swal-text-2xl',
        confirmButton: 'swal-btn-3xl',
        cancelButton: 'swal-btn-3xl',
      },
    }).then((result) => {
      if (!result.isConfirmed) return;

      Swal.fire({
        title: 'กำลังบันทึกข้อมูล',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });

      this.service.updateWork(this.workInfo).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'สำเร็จ',
            text: 'อัปเดตข้อมูลเรียบร้อยแล้ว',
            timer: 1500,
            showConfirmButton: false,
          });

          const role = localStorage.getItem('role');

          setTimeout(() => {
            this.router.navigateByUrl(
              role === 'admin' ? '/admin/profile' : '/user/profile'
            );
          }, 1500);
        },

        error: (err) => {
          console.error(err);

          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถบันทึกข้อมูลได้',
          });
        },
      });
    });
  }

  toggle(name: string, event: MouseEvent) {
    event.stopPropagation();

    if (this.openDropdown !== name) {
      this.openDropdown = name;
    }
  }

  isOpen(name: string) {
    return this.openDropdown === name;
  }

  @HostListener('document:click')
  closeAll() {
    this.openDropdown = null;
  }

  goBack() {
    this.navigateByRole();
  }

  private navigateByRole() {
    const role = localStorage.getItem('role');

    this.router.navigateByUrl(
      role === 'admin' ? '/admin/profile' : '/user/profile'
    );
  }

  removeMajor(index: number): void {
    this.selectedMajors.splice(index, 1);
  }

  selectMajor(major: ExpertiseOption): void {
    const exists = this.selectedMajors.find(
      (m) => m.expertise_id === major.expertise_id
    );

    if (!exists) {
      this.selectedMajors.push(major);
    }

    this.searchMajor = '';
    this.openDropdown = null;
  }

  selectType(type: string): void {
    if (this.workInfo) {
      this.workInfo.type = type;
    }

    this.openDropdown = null;
  }

  filteredMajors(): ExpertiseOption[] {
    if (!this.searchMajor.trim()) {
      return this.expertiseOptions;
    }

    return this.expertiseOptions.filter((m) =>
      m.name_th.toLowerCase().includes(this.searchMajor.toLowerCase())
    );
  }

  private convertThaiDateToISO(thaiDate: string): string {
    if (!thaiDate) return '';

    const months: any = {
      มกราคม: 0,
      กุมภาพันธ์: 1,
      มีนาคม: 2,
      เมษายน: 3,
      พฤษภาคม: 4,
      มิถุนายน: 5,
      กรกฎาคม: 6,
      สิงหาคม: 7,
      กันยายน: 8,
      ตุลาคม: 9,
      พฤศจิกายน: 10,
      ธันวาคม: 11,
    };

    const parts = thaiDate.split(' ');
    const day = parseInt(parts[0], 10);
    const month = months[parts[1]];
    const year = parseInt(parts[2], 10) - 543; // แปลง พ.ศ. → ค.ศ.

    const date = new Date(year, month, day);

    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  filteredOrganizations(): OrganizationOption[] {
    if (!this.searchOrganization.trim()) {
      return this.organizationOptions;
    }

    return this.organizationOptions.filter((o) =>
      o.faculty.toLowerCase().includes(this.searchOrganization.toLowerCase())
    );
  }

  selectOrganizationOption(org: OrganizationOption) {
    this.selectOrganization = org;
    this.workInfo.organization = {
      id: org.organization_id,
      faculty: org.faculty,
    };

    this.openDropdown = null;
  }
}
