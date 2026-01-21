import { Component, HostListener } from '@angular/core';
import { ApexChart, ApexLegend, ApexPlotOptions } from 'ng-apexcharts';
import { DataProfile } from '../../models/profile.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-report-researcher-profile',
  standalone: false,
  templateUrl: './report-researcher-profile.component.html',
  styleUrl: './report-researcher-profile.component.css',
})
export class ReportResearcherProfileComponent {
  openDropdown: string | null = null;
  isSearched = false;
  selectedFaculty = '';
  selectedCareer: string = '';
  researcherName: string = '';
  earchFaculitie = '';

  searchFaculitie = '';

  facultySearch: string = '';

  /** ===== DATA (ตัวอย่าง) ===== */
  publications: DataProfile[] = [
    {
      id: 1,
      faculty: 'คณะวิศวกรรมศาสตร์',
      name: 'นาย ก',
      career_path: 'academic',
      position: 'อาจารย์',
    },
    {
      id: 2,
      faculty: 'คณะวิศวกรรมศาสตร์',
      name: 'นาย ข',
      career_path: 'support',
      position: 'เจ้าหน้าที่',
    },
    {
      id: 3,
      faculty: 'คณะวิศวกรรมศาสตร์',
      name: 'นาย ค',
      career_path: 'academic',
      position: 'อาจารย์',
    },
    {
      id: 4,
      faculty: 'คณะวิทยาศาสตร์',
      name: 'นาง ง',
      career_path: 'academic',
      position: 'อาจารย์',
    },
    {
      id: 5,
      faculty: 'คณะวิทยาศาสตร์',
      name: 'นาย จ',
      career_path: 'support',
      position: 'เจ้าหน้าที่',
    },
  ];

  faculties = [
    'คณะวิศวกรรมศาสตร์',
    'คณะวิทยาศาสตร์',
    'คณะครุศาสตร์',
    'คณะบริหารธุรกิจ',
    'คณะเทคโนโลยีสารสนเทศ',
    'คณะเทคโนโลยีสารสนเทศ',
    'คณะเทคโนโลยีสารสนเทศ',
    'คณะเทคโนโลยีสารสนเทศ',
  ];

  paginatedInnovations: DataProfile[] = [];

  constructor(private router: Router) {}

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
    fontSize: '14px',
  };

  filteredResearchers: DataProfile[] = [];
  /** ===== SEARCH ===== */
  search() {
    this.isSearched = true;

    this.filteredResearchers = this.publications.filter((r) => {
      const matchFaculty =
        !this.selectedFaculty || r.faculty === this.selectedFaculty;

      const matchCareer =
        !this.selectedCareer || r.career_path === this.selectedCareer;

      const matchName =
        !this.researcherName ||
        r.name.toLowerCase().includes(this.researcherName.toLowerCase());

      return matchFaculty && matchCareer && matchName;
    });

    this.prepareDonutChart();
  }

  /** ===== DONUT CALCULATION (อิงข้อมูลตารางจริง) ===== */
  prepareDonutChart() {
    const academicCount = this.filteredResearchers.filter(
      (r) => r.career_path === 'academic'
    ).length;

    const supportCount = this.filteredResearchers.filter(
      (r) => r.career_path === 'support'
    ).length;

    this.donutLabels = ['สายวิชาการ', 'สายสนับสนุน'];
    this.donutSeries = [academicCount, supportCount];
    this.totalResearchers = academicCount + supportCount;
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

  viewProfile(id: number) {
    this.router.navigate(['/user-profile', id]);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    if (page === this.currentPage) return;

    this.currentPage = page;
    this.updatePagination();
  }
  currentPage: number = 1;
  pageSize: number = 10;

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.filteredResearchers = this.filteredResearchers.slice(start, end);
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
