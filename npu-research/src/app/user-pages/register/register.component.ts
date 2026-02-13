import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterData } from '../../models/profile.model';
import Swal from 'sweetalert2';
import { Expertise } from '../../models/expertise.model';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  openDropdown: string | null = null;

  expertises: Expertise[] = [];
  selectedMajors: Expertise[] = [];
  searchMajor = '';

  registerData: RegisterData = {
    first_name: '',
    last_name: '',
    email: '',
    expertise_ids: [],
    password: '',
    password_confirmation: '',
  };

  constructor(private router: Router, private registerService: AuthService) {}

  ngOnInit() {
    this.registerService.getExpertise().subscribe({
      next: (expertises) => {
        this.expertises = expertises;
      },
    });
  }

  // Submin
  submit() {
    Swal.fire({
      title: 'กรุณารอสักครู่',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.registerService.register(this.registerData).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Successfully',
          showConfirmButton: false,
          timer: 1000,
        });
        this.router.navigateByUrl('/login');
      },
      error(err) {
        Swal.fire({
          icon: 'error',
          title: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
          text: err.error.message || 'กรุณาลองใหม่อีกครั้ง',
          showCancelButton: false,
        });
      },
    });
  }

  register() {
    this.registerService.register(this.registerData).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'ลงทะเบียนสำเร็จ',
          showConfirmButton: false,
          timer: 1000,
        });
        this.router.navigate(['/login']);
      },
      error(err) {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: err.error.message || 'กรุณาลองใหม่อีกครั้ง',
          showCancelButton: true,
        });
      },
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
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

  selectMajor(ex: Expertise) {
    const exists = this.selectedMajors.find(
      (m) => m.expertise_id === ex.expertise_id
    );

    if (!exists) {
      this.selectedMajors.push(ex);

      // เก็บ id ลง registerData
      this.registerData.expertise_ids.push(ex.expertise_id);
    }
    this.searchMajor = '';
    this.openDropdown = null;
  }

  filteredMajors(): Expertise[] {
    return this.expertises.filter((ex) =>
      ex.name_th.toLowerCase().includes(this.searchMajor.toLowerCase())
    );
  }

  removeMajor(index: number) {
    const removed = this.selectedMajors[index];

    this.selectedMajors.splice(index, 1);

    this.registerData.expertise_ids = this.registerData.expertise_ids.filter(
      (id) => id !== removed.expertise_id
    );
  }
}
