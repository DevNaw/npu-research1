import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  username = '';
  password = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    private loginService: AuthService
  ) {}

  goToDashboard() {
    Swal.fire({
      title: 'กรุณารอสักครู่',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    this.loginService.login(this.username, this.password).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'Successfully',
          showConfirmButton: false,
          timer: 1000,
        });
        // console.log(res);

        localStorage.setItem('user', JSON.stringify(res.user));
        
        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/user/dashboard']);
        }
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
}
