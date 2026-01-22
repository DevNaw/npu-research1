import { Component, HostListener } from '@angular/core';
import { ApexChart, ApexLegend } from 'ng-apexcharts';

interface Researcher {
  faculty: string;
  name: string;
  major: string;
  position: string;
}

@Component({
  selector: 'app-user-researchers',
  standalone: false,
  templateUrl: './user-researchers.component.html',
  styleUrl: './user-researchers.component.css',
})
export class UserResearchersComponent {
  openDropdown: string | null = null;
  /** ===== STATE ===== */
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
    }
  };

  filteredResearchers: Researcher[] = [];
  /** ===== SEARCH ===== */
  search() {
    this.isSearched = true;

    this.filteredResearchers = this.publications.filter((r) => {
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

    this.prepareDonutChart();
  }

  /** ===== DONUT CALCULATION (อิงข้อมูลตารางจริง) ===== */
  hasDonutData = false;

  prepareDonutChart() {
    const majorMap: { [key: string]: number } = {};

    this.filteredResearchers.forEach((r) => {
      majorMap[r.major] = (majorMap[r.major] || 0) + 1;
    });

    this.donutLabels = Object.keys(majorMap);
    this.donutSeries = Object.values(majorMap);

    this.totalResearchers = this.donutSeries.reduce((a, b) => a + b, 0);
    this.hasDonutData = this.totalResearchers > 0;
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
  
}
