import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isMobileMenuOpen = false;

  doc = {
    researcher: {
      label: 'สำหรับนักวิจัย',
      fileUrl: 'assets/manual/researcher.pdf'
    },
    admin: {
      label: 'สำหรับแอดมิน',
      fileUrl: 'assets/manual/admin.pdf'
    },
    executive: {
      label: 'สำหรับผู้บริหาร',
      fileUrl: 'assets/manual/executive.pdf'
    }
  };
  

  constructor(
    public auth: AuthService,
    private router: Router
  ) {}

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  get role() {
    return this.auth.getRole();
  }

  get isLoggedIn() {
    return this.auth.isLoggedIn();
  }
}
