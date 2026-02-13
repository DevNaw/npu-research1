import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ApexChart, ApexLegend } from 'ng-apexcharts';
import { AuthService } from '../../services/auth.service';

interface Researcher {
  faculty: string;
  name: string;
  major: string;
  position: string;
}

@Component({
  selector: 'app-admin-search-researcher',
  standalone: false,
  templateUrl: './admin-search-researcher.component.html',
  styleUrl: './admin-search-researcher.component.css',
})
export class AdminSearchResearcherComponent {
  openDropdown: string | null = null;
  isSearched = false;
  selectedFaculty = '';
  selectedCareer: string = '';
  researcherName: string = '';
  searchFaculitie = '';

  searchMajor = '';
  selectedMajor = '';

  searchText = '';

  facultySearch: string = '';

  filteredData: Researcher[] = [];
  paginationData: Researcher[] = [];

  pageSize = 10;
  currentPage = 1;

  constructor(private router: Router, private authService: AuthService) {}

  /** ===== DATA (ตัวอย่าง) ===== */
  publications: Researcher[] = [
    {
      faculty: 'คณะวิศวกรรมศาสตร์',
      name: 'นาย ก',
      major: 'วิทยาการคอมพิวเตอร์',
      position: 'อาจารย์',
    },
    {
      faculty: 'คณะวิศวกรรมศาสตร์',
      name: 'นาย ข',
      major: 'ระบบสารสนเทศเพื่อการจัดการ',
      position: 'เจ้าหน้าที่',
    },
    {
      faculty: 'คณะวิศวกรรมศาสตร์',
      name: 'นาย ค',
      major: 'เทคโนโลยีสารสนเทศ',
      position: 'อาจารย์',
    },
    {
      faculty: 'วิทยาศาสตร์',
      name: 'นาง ง',
      major: 'ปัญญาประดิษฐ์และวิทยาการข้อมูล',
      position: 'อาจารย์',
    },
    {
      faculty: 'วิทยาศาสตร์',
      name: 'นาย จ',
      major: 'วิศวกรรมซอฟต์แวร์',
      position: 'เจ้าหน้าที่',
    },
    {
      faculty: 'วิทยาศาสตร์',
      name: 'นาย จ',
      major: 'วิศวกรรมซอฟต์แวร์',
      position: 'เจ้าหน้าที่',
    },
    {
      faculty: 'วิทยาศาสตร์',
      name: 'นาย จ',
      major: 'วิศวกรรมซอฟต์แวร์',
      position: 'เจ้าหน้าที่',
    },
  ];

  faculties = [
    'ทั้งหมด',
    'คณะวิศวกรรมศาสตร์',
    'คณะวิทยาศาสตร์',
    'คณะครุศาสตร์',
    'คณะบริหารธุรกิจ',
    'คณะเทคโนโลยีสารสนเทศ',
    'คณะเทคโนโลยีสารสนเทศ',
    'คณะเทคโนโลยีสารสนเทศ',
    'คณะเทคโนโลยีสารสนเทศ',
  ];

  major = [
    'ทั้งหมด',
    'วิทยาการคอมพิวเตอร์',
    'เทคโนโลยีสารสนเทศ',
    'วิศวกรรมซอฟต์แวร์',
    'ระบบสารสนเทศเพื่อการจัดการ',
    'ปัญญาประดิษฐ์และวิทยาการข้อมูล',
  ];

  /** ===== DONUT CHART ===== */
  donutLabels: string[] = [];
  donutSeries: number[] = [];
  totalResearchers = 0;

  donutChart: ApexChart = {
    type: 'donut',
    height: 320,
  };

  donutLegend: ApexLegend = {
    position: 'bottom',
    labels: {
      colors: '#fffff', // สีตัวหนังสือ (เช่น gray-800)
    },
  };

  filteredResearchers: Researcher[] = [];
  /** ===== SEARCH ===== */
  search() {
    this.isSearched = true;

    this.filteredData = this.publications.filter((r) => {
      const matchFaculty =
        !this.selectedFaculty ||
        this.selectedFaculty === 'ทั้งหมด' ||
        r.faculty === this.selectedFaculty;

      const matchMajor =
        !this.selectedMajor ||
        this.selectedMajor === 'ทั้งหมด' ||
        r.major === this.selectedMajor;

      const matchName =
        !this.researcherName ||
        r.name.toLowerCase().includes(this.researcherName.toLowerCase());

      return matchFaculty && matchMajor && matchName;
    });

    this.currentPage = 1;
    this.updatePagination();

    this.prepareDonutChart(); // ⭐ ต้องอยู่หลัง filter
  }

  /** ===== DONUT CALCULATION (อิงข้อมูลตารางจริง) ===== */
  hasDonutData = false;

  prepareDonutChart() {
    const data = this.filteredData; // ⭐ สำคัญมาก

    if (!data || data.length === 0) {
      this.hasDonutData = false;
      this.donutSeries = [];
      this.donutLabels = [];
      this.totalResearchers = 0;
      return;
    }

    const majorMap: Record<string, number> = {};

    data.forEach((r) => {
      const major = r.major || 'ไม่ระบุสาขา';
      majorMap[major] = (majorMap[major] || 0) + 1;
    });

    this.donutLabels = Object.keys(majorMap);
    this.donutSeries = Object.values(majorMap);
    this.totalResearchers = data.length;
    this.hasDonutData = true;
  }

  toggleDropdown(name: string, event: MouseEvent) {
    event.stopPropagation();
    this.openDropdown = this.openDropdown === name ? null : name;
  }

  isOpen(name: string): boolean {
    return this.openDropdown === name;
  }

  @HostListener('document:click')
  closeAll() {
    this.openDropdown = null;
  }

  selectFaculities(f: string) {
    this.selectedFaculty = f;
    this.openDropdown = null;
    this.searchFaculitie = '';
  }

  filteredFaculties(): string[] {
    if (!this.searchFaculitie) return this.faculties;

    return this.faculties.filter((f) =>
      f.toLowerCase().includes(this.searchFaculitie.toLowerCase())
    );
  }

  selectMajor(m: string) {
    this.selectedMajor = m;
    this.openDropdown = null;
    this.searchMajor = '';
  }

  filteredMajor(): string[] {
    if (!this.searchMajor) return this.major;

    return this.major.filter((m) =>
      m.toLowerCase().includes(this.searchMajor.toLowerCase())
    );
  }

  onSearch(): void {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredData = this.publications.filter(
      (item) =>
        item.faculty.toLowerCase().includes(keyword) ||
        item.major.toLowerCase().includes(keyword) ||
        item.name.toLowerCase().includes(keyword) ||
        item.position.toLowerCase().includes(keyword)
    );

    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.paginationData = this.filteredData.slice(start, end);
  }

  goToProfile() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }
    const user = this.authService.getUserFromStorage();
    const base = this.authService.isAdmin() ? '/admin' : '/user';

    // ถ้ามี id
    if (user?.id) {
      this.router.navigateByUrl(`${base}/profile/${user.id}`);
    } else {
      this.router.navigateByUrl(`${base}/profile`);
    }
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    if (page === this.currentPage) return;

    this.currentPage = page;
    this.updatePagination();
  }

  get totalPages(): number {
    return Math.ceil(this.filteredResearchers.length / this.pageSize);
  }
  get totalItems(): number {
    return this.filteredResearchers.length;
  }
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
}
