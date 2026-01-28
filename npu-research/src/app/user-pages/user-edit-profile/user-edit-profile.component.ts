import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-edit-profile',
  standalone: false,
  templateUrl: './user-edit-profile.component.html',
  styleUrl: './user-edit-profile.component.css',
})
export class UserEditProfileComponent implements OnInit {
  openDropdown: string | null = null;
  userId!: string | null;

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
    console.log('Editing profile ID:', this.userId);
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

  /* ===== data ===== */
  titles = [
    'นาย',
    'นาง',
    'นางสาว',
    'ว่าที่ร้อยตรี',
    'ว่าที่ร้อยตรีหญิง',
    'Mr.',
    'Ms.',
    'Mrs.',
    'ผศ.',
    'รศ.',
    'ดร.',
    'ผศ.ดร.',
    'รศ.ดร.',
    'ศ.ดร',
    'ศาสตรจารย์พิเศษ',
    'พล.อ.อ.',
    'ว่าที่ร้อยโท',
    'ว่าที่ร้อยเอก',
    'ผศ.ว่าที่ ร.อ.ดร.',
    'ผศ.ว่าที่ ร.ต.',
    'รศ.พันเอก ดร.',
    'รศ.พล.อ.ท.',
    'พันเอก',
    'พันโท',
    'พันตรี',
    'ร.อ.',
    'พันจ่าเอก',
    'พล.อ.ท.',
    'นาวาอากาศเอก',
    'เรืออากาศเอก',
    'พ.อ.อ.',
  ];
  ethnicity = ['ไทย', 'จีน', 'ญี่ปุ่น', 'อเมริกัน'];
  nationality = ['ไทย', 'ญี่ปุ่น', 'จีน', 'อังกฤษ'];
  religion = ['พุทธ', 'คริสต์', 'อิสลาม', 'ฮินดู'];
  majors = ['คอมพิวเตอร์', 'เทคโนโลยีสารสนเทศ', 'วิศวกรรม', 'ปัญญาประดิษฐ์'];

  blood = ['A', 'B', 'AB', 'O'];

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

  /* ===== filter ===== */
  filteredTitles() {
    return this.titles.filter((t) => t.includes(this.searchTitle));
  }

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
      title: 'ยืนยันการบันทึกข้อมูล',
      text: 'คุณต้องการบันทึกข้อมูลนี้ใช่หรือไม่?',
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#ef4444',
    }).then((result) => {
      if (!result.isConfirmed) return;

      const payload = {
        title: this.selectedTitle,
        ethnicity: this.selectedEthnicity,
        nationality: this.selectedNationality,
        religion: this.selectedReligion,
        majors: this.selectedMajors,
      };

      console.log('SAVE DATA :', payload);

      // 🔄 Loading
      Swal.fire({
        title: 'กำลังบันทึกข้อมูล',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // 🔥 จำลองเรียก API
      setTimeout(() => {
        Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: 'ข้อมูลถูกบันทึกเรียบร้อยแล้ว',
          showConfirmButton: false,
          timer: 1500,
        });

        // 👉 redirect หลังบันทึก
        const role = localStorage.getItem('role');

        setTimeout(() => {
          this.router.navigateByUrl(
            role === 'admin' ? '/admin/profile' : '/user/profile'
          );
        }, 1500);
      }, 1200);
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
}
