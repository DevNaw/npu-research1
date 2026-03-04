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
  
      if (!data) return;
  
      this.expertiseOptions = res.data.expertises || [];
      this.organizationOptions = res.data.organizations || [];
  
      // ✅ map organization จาก id จริง
      if (data.organization?.id) {
        const found = this.organizationOptions.find(
          (o) => o.id === data.organization.id
        );
  
        if (found) {
          data.organization = found;  // 👈 สำคัญมาก
        }
      }
  
      this.workInfo = data;
      console.log(this.workInfo);
      
  
      if (this.workInfo?.work_start_date) {
        this.workInfo.work_start_date =
          this.workInfo.work_start_date.slice(0, 10);
      }
  
      this.selectedMajors = (data.expertise || []).map((e: any) => ({
        expertise_id: e.id,
        name_th: e.name_th,
        name_en: e.name_en,
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
      const day = parts[0].padStart(2, '0'); // เติม 0 ข้างหน้าถ้าเป็นเลขหลักเดียว
      const month = thaiMonths[parts[1]];
      const year = (parseInt(parts[2], 10) - 543).toString(); // แปลง พ.ศ. เป็น ค.ศ.

      if (day && month && year) {
        return `${day}-${month}-${year}`;
      }
    }
    return ''; // คืนค่าว่างถ้าฟอร์แมตไม่ถูกต้อง
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

      const payload = {
        position: this.workInfo.position,
        type: this.workInfo.type,
        line_work: this.workInfo.line_work,
        academic_position: this.workInfo.academic_position,
        interest: this.workInfo.interest,
        work_start_date: this.workInfo.work_start_date,
        year_of_service: Number(this.workInfo.year_of_service),
        organization_id: this.workInfo.organization?.id ?? 0,
        expertise: this.selectedMajors.map((m) => m.expertise_id),
      };

      this.service.updateWork(payload).subscribe({
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
      id: org.id,
      faculty: org.faculty,
    };

    this.openDropdown = null;
  }
}
