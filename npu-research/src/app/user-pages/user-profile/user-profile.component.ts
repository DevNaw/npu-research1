import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

interface Address {
  houseNo?: string;
  alley?: string;
  road?: string;
  subDistrict?: string;
  district?: string;
  province?: string;
  phone?: string;
}

@Component({
  selector: 'app-user-profile',
  standalone: false,
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent {
   
  selectedTab = 'research';
  trainings: any[] = []; // ถ้าไม่มีข้อมูล
  address: Address = {};
  isEditModalOpen = false;
  editData: any = {};
  item: any;

  constructor(private router: Router) {}

  editItem(id: number) {
    this.router.navigate(['/edit', id]);
  }

  deleteItem(id: number) {
    Swal.fire({
      title: 'ยืนยันการลบ',
      text: 'คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้ ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', // red-500
      cancelButtonColor: '#6b7280', // gray-500
      confirmButtonText: 'ลบข้อมูล',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        // 🔥 ลบข้อมูลในตาราง
        this.data[this.selectedTab] = this.data[this.selectedTab].filter(
          (item: any) => item.id !== id
        );

        // ✅ แจ้งผลลัพธ์
        Swal.fire({
          title: 'ลบสำเร็จ',
          text: 'ข้อมูลถูกลบเรียบร้อยแล้ว',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });

        // ✅ ถ้าใช้ API
        // this.service.delete(id).subscribe(() => {
        //   Swal.fire('ลบสำเร็จ', 'ข้อมูลถูกลบเรียบร้อย', 'success');
        // });
      }
    });
  }

  // ตัวอย่างมีข้อมูล
  // trainings = [
  //   { title: 'ชื่อหลักสูตร', value: 'อบรม Angular ขั้นสูง' },
  //   { title: 'ปีที่อบรม', value: '2567' }
  // ];

  data: any = {
    research: [
      {
        title: 'การศึกษาระบบการจัดการน้ำของชุมชน...',
        date: '20 ก.ค. 2562 เวลา 20:09:43 น.',
      },
    ],
    article: [],
    innovation: [],
  };

  changeTab(tab: string) {
    this.selectedTab = tab;
  }

  goToEditProfile(i: string) {
    this.router.navigateByUrl('/user-edit-profile');
  }

  goToEditStudy(s: string) {
    this.router.navigateByUrl('/user-edit-study');
  }

  goToEditTraning() {
    this.router.navigateByUrl('/user-edit-traning');
  }

  goToEditAddress() {
    this.router.navigateByUrl('/user-edit-address');
  }
}
