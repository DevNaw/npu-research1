import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  isMobileMenuOpen = false;
  openMobileReport = false;
  openMobileSave = false;
  openMobileNews = false;
  openMobileFunding = false;
  openReport = false;
  closeTimeout: any = null;

  isOpen = false;
  isTouchDevice = false;

  doc = {
    researcher: {
      label: 'สำหรับนักวิจัย',
      fileUrl: 'assets/manual/researcher.pdf',
    },
    admin: {
      label: 'สำหรับแอดมิน',
      fileUrl: 'assets/manual/admin.pdf',
    },
    executive: {
      label: 'สำหรับผู้บริหาร',
      fileUrl: 'assets/manual/executive.pdf',
    },
  };

  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.isTouchDevice =
      'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  // onMouseEnter() {
  //   if (!this.isTouchDevice) {
  //     this.isOpen = true;
  //   }
  // }

  // onMouseLeave() {
  //   if (!this.isTouchDevice) {
  //     this.isOpen = false;
  //   }
  // }

  onClick(event: Event) {
    if (this.isTouchDevice) {
      event.stopPropagation();
      this.isOpen = !this.isOpen;
    }
  }

  @HostListener('document:click')
  closeDropdown() {
    if (this.isTouchDevice) {
      this.isOpen = false;
    }
  }

  close() {
    this.openReport = false;
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  onLogout() {
    this.logout();
    this.closeMobileMenu();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/dashboard']);
  }

  get role() {
    return this.auth.getRole();
  }

  get isLoggedIn() {
    return this.auth.isLoggedIn();
  }

  toggleReportMenu() {
    this.openMobileReport = !this.openMobileReport;
  }

  closeReportMenu() {
    this.openMobileReport = false;
  }

  toggleSaveMenu() {
    this.openMobileSave = !this.openMobileSave;
  }

  closeSaveMenu() {
    this.openMobileSave = false;
    this.closeReportMenu();
  }

  toggleNewaMenu() {
    this.openMobileNews = !this.openMobileNews;
  }

  closeNewsMenu() {
    this.openMobileNews = false;
    this.closeReportMenu();
  }

  toggleFundingMenu() {
    this.openMobileFunding = !this.openMobileFunding;
  }

  closeFundingMenu() {
    this.openMobileFunding = false;
    this.closeReportMenu();
  }

  goToManual() {
    this.router.navigate(['/manual']);
  }
  
  isDesktop(): boolean {
    return window.innerWidth >= 768; // md
  }
  
  /* ===== Desktop (hover) ===== */
  onMouseEnter() {
    if (!this.supportsHover()) return;
  
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }
  
    this.isOpen = true;
  }

  supportsHover(): boolean {
    return window.matchMedia('(hover: hover)').matches;
  }
  
  onMouseLeave() {
  if (!this.supportsHover()) return;

  this.closeTimeout = setTimeout(() => {
    this.isOpen = false;
  }, 200);
}
  
onToggle(event: Event) {
  if (this.supportsHover()) return;

  event.stopPropagation();
  event.preventDefault();

  this.isOpen = !this.isOpen;
}
}
