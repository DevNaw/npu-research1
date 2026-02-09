import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

type MenuType = 'report' | 'manual' | 'save' | 'funding' | 'news';
type MobileSubMenu = 'funding' | 'news' | 'save' | 'report' | null;

@Component({
  selector: 'app-navbar',
  standalone: false,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  isMobileMenuOpen = false;
  // openMobileReport = false;
  // openMobileSave = false;
  // openMobileNews = false;
  // openMobileFunding = false;
  openReport = false;

  openMobileSubMenu: MobileSubMenu = null;

  openMenu: MenuType | null = null;
  closeTimeout: any = null;
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

  // toggleMobileMenu() {
  //   this.isMobileMenuOpen = !this.isMobileMenuOpen;
  // }
  toggleMobileMenu(event?: Event) {
    event?.stopPropagation();
    this.isMobileMenuOpen = !this.isMobileMenuOpen;

    if (!this.isMobileMenuOpen) {
      this.openMobileSubMenu = null;
    }
  }

  toggleMobileSubMenu(type: MobileSubMenu, event: Event) {
    event.stopPropagation();
    this.openMobileSubMenu =
      this.openMobileSubMenu === type ? null : type;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  closeAllMobileMenus() {
    this.openMobileSubMenu = null;
    this.isMobileMenuOpen = false;
  }

  onLogout() {
    this.logout();
    // this.closeMobileMenu();
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

  // toggleReportMenu() {
  //   this.openMobileReport = !this.openMobileReport;
  // }

  // closeReportMenu() {
  //   this.openMobileReport = false;
  // }

  // toggleSaveMenu() {
  //   this.openMobileSave = !this.openMobileSave;
  // }

  // closeSaveMenu() {
  //   this.openMobileSave = false;
  //   this.closeReportMenu();
  // }

  // toggleNewaMenu() {
  //   this.openMobileNews = !this.openMobileNews;
  // }

  // closeNewsMenu() {
  //   this.openMobileNews = false;
  //   this.closeReportMenu();
  // }

  // toggleFundingMenu() {
  //   this.openMobileFunding = !this.openMobileFunding;
  // }

  // closeFundingMenu() {
  //   this.openMobileFunding = false;
  //   this.closeReportMenu();
  // }

  goToManual() {
    this.router.navigate(['/manual']);
  }

  isDesktop(): boolean {
    return window.innerWidth >= 768; // md
  }

  supportsHover(): boolean {
    return window.matchMedia('(hover: hover)').matches;
  }

  onMouseEnter(type: MenuType) {
    if (!this.supportsHover()) return;

    this.clearCloseTimeout();
    this.openMenu = type;
  }

  onMouseLeave(type: MenuType) {
    if (!this.supportsHover()) return;

    this.closeTimeout = setTimeout(() => {
      if (this.openMenu === type) {
        this.openMenu = null;
      }
    }, 120);
  }

  onToggle(type: MenuType, event: Event) {
    if (this.supportsHover()) return;

    event.preventDefault();
    event.stopPropagation();

    this.openMenu = this.openMenu === type ? null : type;
  }

  private clearCloseTimeout() {
    if (this.closeTimeout) {
      clearTimeout(this.closeTimeout);
      this.closeTimeout = null;
    }
  }

  @HostListener('document:click')
  onDocumentClick() {
    // Desktop ใช้ hover ไม่ต้องยุ่ง
    if (this.supportsHover()) return;

    // ปิดเมนู desktop (เผื่อ iPad บางรุ่น)
    this.openMenu = null;

    // Mobile
    this.closeAllMobileMenus();
  }
}
