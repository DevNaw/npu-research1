import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-edit-traning',
  standalone: false,
  templateUrl: './user-edit-traning.component.html',
  styleUrl: './user-edit-traning.component.css'
})
export class UserEditTraningComponent implements OnInit {
 userId!: string | null;
  isModalAdd = false;
  isModalEdit = false;

  dropdownOpen: string | null = null;
  searchLocation = '';
  selectedLocation: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  location: string[] = [
    'กรุงเทพมหานคร',
    'กระบี่',
    'กาญจนบุรี',
    'กาฬสินธุ์',
    'กำแพงเพชร',
    'ขอนแก่น',
    'จันทบุรี',
    'ฉะเชิงเทรา',
    'ชลบุรี',
    'เชียงใหม่',
    'เชียงราย',
    'ตรัง',
    'ตราด',
    'ตาก',
    'นครนายก',
    'นครปฐม',
    'นครพนม',
    'นครราชสีมา',
    'นครศรีธรรมราช',
    'นครสวรรค์',
    'นราธิวาส',
    'นนทบุรี',
    'น่าน',
    'บึงกาฬ',
    'บุรีรัมย์',
    'ปทุมธานี',
    'ประจวบคีรีขันธ์',
    'ปัตตานี',
    'พระนครศรีอยุธยา',
    'พังงา',
    'พัทลุง',
    'พิจิตร',
    'พิษณุโลก',
    'เพชรบุรี',
    'เพชรบูรณ์',
    'แพร่',
    'ภูเก็ต',
    'มหาสารคาม',
    'มุกดาหาร',
    'แม่ฮ่องสอน',
    'ยะลา',
    'ยโสธร',
    'ร้อยเอ็ด',
    'ระนอง',
    'ระยอง',
    'ราชบุรี',
    'ลพบุรี',
    'ลำปาง',
    'ลำพูน',
    'เลย',
    'ศรีสะเกษ',
    'สกลนคร',
    'สงขลา',
    'สมุทรปราการ',
    'สมุทรสงคราม',
    'สมุทรสาคร',
    'สระบุรี',
    'สระแก้ว',
    'สิงห์บุรี',
    'สุโขทัย',
    'สุพรรณบุรี',
    'สุราษฎร์ธานี',
    'สุรินทร์',
    'หนองคาย',
    'หนองบัวลำภู',
    'อ่างทอง',
    'อุดรธานี',
    'อุตรดิตถ์',
    'อุทัยธานี',
    'อุบลราชธานี',
  ];

  ngOnInit(): void {
    this.userId = this.route.snapshot.paramMap.get('id');
  }
  
  // ===== Modal Control =====
  openModalAdd() {
    this.isModalAdd = true;
  }

  closeModalAdd() {
    this.isModalAdd = false;
    this.resetDropdown();
  }

  openModalEdit() {
    this.isModalEdit = true;
  }

  closeModalEdit() {
    this.isModalEdit = false;
    this.resetDropdown();
  }

  // ===== Dropdown Control =====
  toggle(key: string) {
    this.dropdownOpen = this.dropdownOpen === key ? null : key;
  }

  isOpen(key: string) {
    return this.dropdownOpen === key;
  }

  selectLocation(value: string) {
    this.selectedLocation = value;
    this.dropdownOpen = null;
  }

  filteredLocation() {
    return this.location.filter((l) =>
      l.toLowerCase().includes(this.searchLocation.toLowerCase())
    );
  }

  resetDropdown() {
    this.dropdownOpen = null;
    this.searchLocation = '';
    this.selectedLocation = null;
  }

  // ===== SweetAlert =====
  saveAdd() {
    Swal.fire({
      icon: 'success',
      title: 'เพิ่มข้อมูลสำเร็จ',
      timer: 1500,
      showConfirmButton: false,
    });
    this.closeModalAdd();
  }

  saveEdit() {
    Swal.fire({
      icon: 'success',
      title: 'บันทึกข้อมูลสำเร็จ',
      timer: 1500,
      showConfirmButton: false,
    });
    this.closeModalEdit();
  }

  deleteTraining() {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      text: 'คุณต้องการลบข้อมูลนี้หรือไม่',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'ลบข้อมูลสำเร็จ',
          timer: 1200,
          showConfirmButton: false,
        });
      }
    });
  }

  save() {
    Swal.fire({
      icon: 'success',
      title: 'บันทึกข้อมูลทั้งหมดสำเร็จ',
      timer: 1500,
      showConfirmButton: false,
    });
    this.router.navigateByUrl('/user-profile');
  }
}
