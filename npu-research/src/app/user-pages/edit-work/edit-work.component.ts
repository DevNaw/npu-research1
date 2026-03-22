import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Expertise, Organization } from '../../models/work.model';
import { WorkService } from '../../services/work.service';
import { MainComponent } from '../../shared/layouts/main/main.component';

@Component({
  selector: 'app-edit-work',
  standalone: false,
  templateUrl: './edit-work.component.html',
  styleUrl: './edit-work.component.css',
})
export class EditWorkComponent {
  selectedMajors: Expertise[] = [];
  searchMajor = '';

  organizationOptions: Organization[] = [];
  selectOrganization: Organization | null = null;
  searchOrganization = '';

  openDropdown: string | null = null;
  majorInput: string = '';

  workInfo: any = {
    position: '',
    organization: { id: 0, faculty: '' },
    type: '',
    line_work: '',
    academic_position: '',
    interest: '',
    expertises: [],
    work_start_date: '',
    year_of_service: 0,
  };

  expertiseOptions: Expertise[] = [];

  typeOptions: string[] = ['วิชาการ', 'สนับสนุน'];

  constructor(private router: Router, private service: WorkService) {}

  ngOnInit() {
    MainComponent.showLoading();
    Promise.all([
      this.loadWork(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => {
      MainComponent.hideLoading();
    });
  }

  loadWork() {
    this.service.getWorkInfo().subscribe((res) => {
      const data = res?.data?.work_info;

      if (!data) return;

      this.expertiseOptions = res.data.expertises || [];
      this.organizationOptions = res.data.organizations || [];

      if (data.organization?.id) {
        const found = this.organizationOptions.find(
          (o) => o.id === data.organization?.id
        );

        if (found) {
          data.organization = found;
        }
      }

      this.workInfo = data;

      if (this.workInfo?.work_start_date) {
        this.workInfo.work_start_date = this.workInfo.work_start_date.slice(
          0,
          10
        );
      }

      this.selectedMajors = (data.expertises || []).map((e: any) => ({
        expertise: e.expertise,
      }));
    });
  }

  convertThaiDateToISO(thaiDate: string): string {
    if (!thaiDate) return '';

    const thaiMonths: { [key: string]: string } = {
      มกราคม: '01',
      กุมภาพันธ์: '02',
      มีนาคม: '03',
      เมษายน: '04',
      พฤษภาคม: '05',
      มิถุนายน: '06',
      กรกฎาคม: '07',
      สิงหาคม: '08',
      กันยายน: '09',
      ตุลาคม: '10',
      พฤศจิกายน: '11',
      ธันวาคม: '12',
    };

    const parts = thaiDate.trim().split(' ');
    if (parts.length === 3) {
      const day = parts[0].padStart(2, '0');
      const month = thaiMonths[parts[1]];
      const year = (parseInt(parts[2], 10) - 543).toString();

      if (day && month && year) {
        return `${day}-${month}-${year}`;
      }
    }
    return '';
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

      this.service.updateWork(this.buildPayload()).subscribe({
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

  selectMajor(major: Expertise): void {
    const exists = this.selectedMajors.find(
      (m) => m.expertise === major.expertise
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

  filteredOrganizations(): Organization[] {
    if (!this.searchOrganization.trim()) {
      return this.organizationOptions;
    }

    return this.organizationOptions.filter((o) =>
      o.faculty.toLowerCase().includes(this.searchOrganization.toLowerCase())
    );
  }

  selectOrganizationOption(org: Organization) {
    this.selectOrganization = org;
    this.workInfo.organization = {
      id: org.id,
      faculty: org.faculty,
    };

    this.openDropdown = null;
  }

  removeMajor(index: number) {
    this.selectedMajors.splice(index, 1);
  }

  addMajor(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.majorInput.trim()) {
      event.preventDefault();

      const value = this.majorInput.trim();

      const exists = this.selectedMajors.find((m) => m.expertise === value);

      if (!exists) {
        this.selectedMajors.push({ expertise: value });
      }

      this.majorInput = '';
    }
  }

  calculateYearsOfService() {
    if (!this.workInfo.work_start_date) return;

    const startDate = new Date(this.workInfo.work_start_date);
    const today = new Date();

    let year = today.getFullYear() - startDate.getFullYear();
    let month = today.getMonth() - startDate.getMonth();

    if (month < 0 || (month === 0 && today.getDate() < startDate.getDate())) {
      year--;
    }

    this.workInfo.year_of_service = year;
  }

  private buildPayload(): Record<string, any> {
    const w = this.workInfo;

    return {
      ...(w.position && { position: w.position }),
      ...(w.type && { type: w.type }),
      ...(w.line_work && { line_work: w.line_work }),
      ...(w.academic_position && { academic_position: w.academic_position }),
      ...(w.interest && { interest: w.interest }),
      ...(w.work_start_date && { work_start_date: w.work_start_date }),
      ...(w.year_of_service && { year_of_service: Number(w.year_of_service) }),
      ...(w.organization?.id && { organization_id: w.organization.id }),
      ...(this.selectedMajors.length > 0 && {
        expertises: this.selectedMajors.map((m) => m.expertise),
      }),
    };
  }
}
