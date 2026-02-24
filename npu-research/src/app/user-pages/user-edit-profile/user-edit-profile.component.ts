import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ProfileService } from '../../services/profile.service';
import { GeneralInfo } from '../../models/edit-general.model';

@Component({
  selector: 'app-user-edit-profile',
  standalone: false,
  templateUrl: './user-edit-profile.component.html',
  styleUrl: './user-edit-profile.component.css',
})
export class UserEditProfileComponent implements OnInit {
  openDropdown: string | null = null;
  userId!: string | null;
  data: GeneralInfo = {
    first_name: '',
    last_name: '',
    first_name_en: null,
    last_name_en: null,
    email: '',
    phone: null,
    id_card_number: '',
    date_of_birth: '',
    age: 0,
    ethnicity: '',
    nationality: '',
    religion: ''
  };

   /* ===== data ===== */
   ethnicity = ['ไทย', 'จีน', 'ญี่ปุ่น', 'อเมริกัน'];
   nationality = ['ไทย', 'ญี่ปุ่น', 'จีน', 'อังกฤษ'];
   religion = ['พุทธ', 'คริสต์', 'อิสลาม', 'ฮินดู'];
   majors = ['คอมพิวเตอร์', 'เทคโนโลยีสารสนเทศ', 'วิศวกรรม', 'ปัญญาประดิษฐ์'];
 
   /* ===== selected ===== */
   selectedTitle = '';
   selectedEthnicity = '';
   selectedNationality = '';
   selectedReligion = '';
   selectedMajors: string[] = [];
 
   /* ===== search ===== */
   searchTitle = '';
   searchEthnicity = '';
   searchNationality = '';
   searchReligion = '';
   searchMajor = '';
 

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: ProfileService,
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  // =============== loadData ==================
  loadData(){
    this.service.getGeneralInfo().subscribe({
      next: (res) => {
        const info = res.data.general_info;

      this.data = {
        ...info,
        date_of_birth: this.convertThaiDateToISO(info.date_of_birth)
      };
        
      },
      error: (err) => {
        console.error(err);
      }
    })
  }

  // ======= Update Profile ==========
  updateProfile(): void {
    this.service.updateGeneral(this.data).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'สำเร็จ',
          text: 'อัปเดตข้อมูลเรียบร้อยแล้ว'
        });

        const role = localStorage.getItem('role');

        setTimeout(() => {
          this.router.navigateByUrl(
            role === 'admin' ? '/admin/profile' : '/user/profile'
          );
        }, 1500);
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'ผิดพลาด',
          text: 'ไม่สามารถอัปเดตข้อมูลได้'
        });
      }
    });
  }

  toggle(name: string, event: MouseEvent) {
    event.stopPropagation();
    this.openDropdown = this.openDropdown === name ? null : name;
  }

  isOpen(name: string) {
    return this.openDropdown === name;
  }

  @HostListener('document:click')
  closeAll() {
    this.openDropdown = null;
  }

  /* ===== filter ===== */
  filteredEthnicity() {
    return this.ethnicity.filter((e) => e.includes(this.searchEthnicity));
  }

  filteredNationality() {
    return this.nationality.filter((n) => n.includes(this.searchNationality));
  }

  filteredReligion() {
    return this.religion.filter((r) => r.includes(this.searchReligion));
  }

  filteredMajors() {
    return this.majors.filter(
      (m) => m.includes(this.searchMajor) && !this.selectedMajors.includes(m)
    );
  }

  /* ===== select ===== */
  selectTitles(v: string) {
    this.selectedTitle = v;
    this.searchTitle = '';
    this.openDropdown = null;
  }

  selectEthnicitys(v: string) {
    this.selectedEthnicity = v;
    this.searchEthnicity = '';
    this.openDropdown = null;
  }

  selectNationalitys(v: string) {
    this.selectedNationality = v;
    this.searchNationality = '';
    this.openDropdown = null;
  }

  selectReligion(v: string) {
    this.selectedReligion = v;
    this.searchReligion = '';
    this.openDropdown = null;
  }

  selectMajor(v: string) {
    this.selectedMajors.push(v);
    this.searchMajor = '';
  }

  removeMajor(i: number) {
    this.selectedMajors.splice(i, 1);
  }

  save() {
    Swal.fire({
      icon: 'warning',
      title: 'ยืนยันการบันทึกข้อมูล',
      text: 'คุณต้องการบันทึกข้อมูลนี้ใช่หรือไม่?',
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#ef4444',
    }).then((result) => {
  
      if (!result.isConfirmed) return;
  
      // 🔄 Loading
      Swal.fire({
        title: 'กำลังบันทึกข้อมูล',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading(),
      });
  
      this.service.updateGeneral(this.data).subscribe({
  
        next: () => {
          Swal.fire({
            icon: 'success',
            title: 'สำเร็จ',
            text: 'อัปเดตข้อมูลเรียบร้อยแล้ว',
            timer: 1500,
            showConfirmButton: false
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
            text: 'ไม่สามารถบันทึกข้อมูลได้'
          });
        }
  
      });
  
    });
  }

  // ===== Nationality =====
  nationalityList: string[] = [
    'ไทย',
    'จีน',
    'ญี่ปุ่น',
    'เกาหลี',
    'อเมริกัน',
    'อังกฤษ',
    'ฝรั่งเศส',
  ];

  private convertThaiDateToISO(thaiDate: string): string {
    if (!thaiDate) return '';
  
    const months: any = {
      'มกราคม': 0,
      'กุมภาพันธ์': 1,
      'มีนาคม': 2,
      'เมษายน': 3,
      'พฤษภาคม': 4,
      'มิถุนายน': 5,
      'กรกฎาคม': 6,
      'สิงหาคม': 7,
      'กันยายน': 8,
      'ตุลาคม': 9,
      'พฤศจิกายน': 10,
      'ธันวาคม': 11
    };
  
    const parts = thaiDate.split(' ');
    const day = parseInt(parts[0], 10);
    const month = months[parts[1]];
    const year = parseInt(parts[2], 10) - 543; // แปลง พ.ศ. → ค.ศ.
  
    const date = new Date(year, month, day);
  
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  }
}
