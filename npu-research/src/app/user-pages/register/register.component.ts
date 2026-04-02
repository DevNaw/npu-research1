import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterData } from '../../models/profile.model';
import Swal from 'sweetalert2';
import { Organization } from '../../models/expertise.model';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  showPassword = false;
  showConfirmPassword = false;
  openDropdown: string | null = null;
  majorInput: string = '';
  searchOrganization = '';
  organizations: Organization[] = [];
  selectedOrganization: Organization | null = null;

  registerData: RegisterData = {
    first_name: '',
    last_name: '',
    email: '',
    org_id: 0,
    expertises: [],
    password: '',
    password_confirmation: '',
  };

  constructor(private router: Router, private registerService: AuthService) {}

  ngOnInit() {
    this.registerService.getOrganizations().subscribe({
      next: (organizations) => {
        this.organizations = organizations;
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
    this.openDropdown = this.openDropdown === name ? null : name;
  }

  isOpen(name: string) {
    return this.openDropdown === name;
  }

  @HostListener('document:click')
  closeAll() {
    this.openDropdown = null;
  }

  removeMajor(index: number) {
    this.registerData.expertises.splice(index, 1);
  }

  addMajor(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();

      const value = this.majorInput.trim();
      if (value && !this.registerData.expertises.includes(value)) {
        this.registerData.expertises.push(value);
      }
      this.majorInput = '';
    }
  }

  selectOrganization(o: any) {
    this.selectedOrganization = o;
    this.registerData.org_id = o.id;
    this.openDropdown = null;
    this.searchOrganization = '';
  }
}
