import { Component } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-edit-work',
  standalone: false,
  templateUrl: './edit-work.component.html',
  styleUrl: './edit-work.component.css'
})
export class EditWorkComponent {
  work = {
    position: 'อาจารย์',
    department: 'คณะวิศวกรรมศาสตร์',
    type: 'พนักงาน',
    line: 'วิชาการ',
    academicPosition: 'อาจารย์',
    interests:
      'เครือข่ายเซ็นเซอร์ไร้สาย เครือข่ายเฉพาะกิจ การประเมินประสิทธิภาพโพรโทคอล',
    expertise: 'สาขาวิทยาศาสตร์กายภาพและคณิตศาสตร์',
    startDate: '2013-12-02',
  };

  constructor(private router: Router) {}

  saveWork() {
    Swal.fire({
      icon: 'success',
      title: 'บันทึกสำเร็จ',
      text: 'ข้อมูลการทำงานถูกอัปเดตแล้ว',
      timer: 1500,
      showConfirmButton: false,
    }).then(() => {
      this.navigateByRole();
    });
  }
  

  goBack() {
    this.navigateByRole(); // ปรับ route ตามจริง
  }

  private navigateByRole() {
    const role = localStorage.getItem('role');
  
    this.router.navigateByUrl(
      role === 'admin' ? '/admin/profile' : '/user/profile'
    );
  }
  
}
