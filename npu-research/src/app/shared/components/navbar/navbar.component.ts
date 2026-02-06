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
  openManual = false;
  openSave = false;
  openFunding = false;
  openNews = false;
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

  @HostListener('document:click')
  closeDropdown() {
    if (!this.isTouchDevice) return;

    this.isOpen = false;
    this.openManual = false;
    this.openSave = false;
    this.openFunding = false;
    this.openNews = false;
  }

  /* ===== Desktop (hover) ===== */
  onMouseEnter(type: 'report' | 'manual' | 'save' | 'funding' | 'news') {
    if (!this.supportsHover()) return;

    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }

    this.closeDropdown();
    const map = {
      report: () => (this.isOpen = true),
      manual: () => (this.openManual = true),
      save: () => (this.openSave = true),
      funding: () => (this.openFunding = true),
      news: () => (this.openNews = true),
    };

    map[type]();
  }

  supportsHover(): boolean {
    return window.matchMedia('(hover: hover)').matches;
  }

  onMouseLeave() {
    if (!this.supportsHover()) return;

    this.closeTimeout = setTimeout(() => {
      this.closeDropdown();
    }, 200);
  }

  onToggle(
    type: 'report' | 'manual' | 'save' | 'funding' | 'news',
    event: Event
  ) {
    if (this.supportsHover()) return;

    event.stopPropagation();
    event.preventDefault();

    if (type === 'report') {
      this.isOpen = !this.isOpen;
      this.openManual = false;
      this.openSave = false;
      this.openNews = false;
      this.openFunding = false;
    }

    if (type === 'manual') {
      this.openManual = !this.openManual;
      this.isOpen = false;
      this.openSave = false;
      this.openNews = false;
      this.openFunding = false;
    }

    if (type === 'save') {
      this.openSave = !this.openSave;
      this.isOpen = false;
      this.openManual = false;
      this.openNews = false;
      this.openFunding = false;
    }

    if (type === 'funding') {
      this.openFunding = !this.openFunding;
      this.isOpen = false;
      this.openManual = false;
      this.openNews = false;
      this.openSave = false;
    }

    if (type === 'news') {
      this.openNews = !this.openNews;
      this.isOpen = false;
      this.openManual = false;
      this.openFunding = false;
      this.openSave = false;
    }
  }
}
