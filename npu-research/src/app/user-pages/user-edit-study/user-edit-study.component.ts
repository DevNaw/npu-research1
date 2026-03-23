import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { EducationService } from '../../services/education.service';
import { MainComponent } from '../../shared/layouts/main/main.component';
import { EducationInfo } from '../../models/education-new.model';

@Component({
  selector: 'app-user-edit-study',
  standalone: false,
  templateUrl: './user-edit-study.component.html',
  styleUrl: './user-edit-study.component.css',
})
export class UserEditStudyComponent implements OnInit {
  isModalOpen = false;
  isEditMode = false;

  educationList: EducationInfo[] = [];
  selectedEducation: EducationInfo = {
    id: 0,
    highest_education: '',
    field_of_study: '',
    qualification: '',
    institution: '',
    date_graduation: '',
  };

  constructor(private router: Router, private service: EducationService) {}

  ngOnInit(): void {
    MainComponent.showLoading();
    Promise.all([
      this.getEducation(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => MainComponent.hideLoading());
  }

  getEducation() {
    this.service.getEducationNew().subscribe({
      next: (res) => {
        this.educationList = res.data.education_info || [];
      },
      error: (err) => {
        console.error(err);
        this.educationList = [];
      },
    });
  }

  openEditModal(data: EducationInfo) {
    this.isEditMode = true;
    this.selectedEducation = { ...data };

    this.isModalOpen = true;
  }

  openAddModal() {
    this.isEditMode = false;
    this.selectedEducation = {
      id: 0,
      highest_education: '',
      field_of_study: '',
      qualification: '',
      institution: '',
      date_graduation: '',
    };
    this.isModalOpen = true;
  }

  save() {
    Swal.fire({
      icon: 'question',
      title: 'ยืนยันการบันทึกข้อมูล',
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (!result.isConfirmed) return;

      const payload = this.buildPayload();

      const request$ = this.isEditMode
        ? this.service.updateEducationNew(this.selectedEducation.id, payload)
        : this.service.createEducation(payload);

      request$.subscribe({
        next: () => this.handleSaveSuccess(),
        error: () => Swal.fire('ผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error'),
      });
    });
  }

  deleteEducation(id: number) {
    Swal.fire({
      title: 'ต้องการลบข้อมูลใช่ไหม?',
      text: 'ข้อมูลจะไม่สามารถกู้้ต้องได้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่',
      cancelButtonText: 'ไม่',
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.deleteEducation(id).subscribe({
          next: () => {
            this.getEducation();
            Swal.fire({
              icon: 'success',
              title: 'ลบข้อมูลสำเร็จ',
              timer: 1500,
              showConfirmButton: false,
            });
          },
          error: (err) => console.error(err),
        });
      }
    });
  }

  private handleSaveSuccess() {
    Swal.fire({
      icon: 'success',
      title: this.isEditMode ? 'แก้ไขสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ',
      timer: 1500,
      showConfirmButton: false,
    }).then(() => {
      this.isModalOpen = false;
      this.resetForm();
      this.getEducation();
    });
  }

  resetForm() {
    this.selectedEducation = {
      id: 0,
      highest_education: '',
      field_of_study: '',
      qualification: '',
      institution: '',
      date_graduation: '',
    };
  }

  closeModal() {
    this.isModalOpen = false;
    this.getEducation();
  }

  async saveGotoProfile() {
    await Swal.fire({
      title: 'กำลังบันทึกข้อมูล',
      timer: 800,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    await Swal.fire({
      icon: 'success',
      title: 'สำเร็จ',
      text: 'อัปเดตข้อมูลเรียบร้อยแล้ว',
      timer: 1500,
      showConfirmButton: false,
    });

    const role = localStorage.getItem('role');

    this.router.navigateByUrl(
      role === 'admin' ? '/admin/profile' : '/user/profile'
    );
  }

  private buildPayload(): Partial<EducationInfo> {
    const data = this.selectedEducation;

    return {
      ...(data.highest_education && {
        highest_education: data.highest_education,
      }),
      ...(data.field_of_study && { field_of_study: data.field_of_study }),
      ...(data.qualification && { qualification: data.qualification }),
      ...(data.institution && { institution: data.institution }),
      ...(data.date_graduation && { date_graduation: data.date_graduation }),
    };
  }
}
