import { Component, HostListener } from '@angular/core';
import { ApexChart, ApexLegend } from 'ng-apexcharts';

interface Researcher {
  faculty: string;
  name: string;
  career_path: 'academic' | 'support';
  position: string;
}

@Component({
  selector: 'app-admin-search-researcher',
  standalone: false,
  templateUrl: './admin-search-researcher.component.html',
  styleUrl: './admin-search-researcher.component.css'
})
export class AdminSearchResearcherComponent {
  openDropdown: string | null = null;
  /** ===== STATE ===== */
  isSearched = false;
  selectedFaculty = '';
  selectedCareer: string = '';
  researcherName: string = '';
  earchFaculitie = '';

  searchFaculitie = '';

  facultySearch: string = '';

  /** ===== DATA (ตัวอย่าง) ===== */
  publications: Researcher[] = [
    {
      faculty: 'คณะวิศวกรรมศาสตร์',
      name: 'นาย ก',
      career_path: 'academic',
      position: 'อาจารย์',
    },
    {
      faculty: 'คณะวิศวกรรมศาสตร์',
      name: 'นาย ข',
      career_path: 'support',
      position: 'เจ้าหน้าที่',
    },
    {
      faculty: 'คณะวิศวกรรมศาสตร์',
      name: 'นาย ค',
      career_path: 'academic',
      position: 'อาจารย์',
    },
    {
      faculty: 'วิทยาศาสตร์',
      name: 'นาง ง',
      career_path: 'academic',
      position: 'อาจารย์',
    },
    {
      faculty: 'วิทยาศาสตร์',
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

  /** ===== FILTERED (ตาราง + กราฟใช้ชุดนี้) ===== */

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
  };

  filteredResearchers: Researcher[] = [];
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
}
