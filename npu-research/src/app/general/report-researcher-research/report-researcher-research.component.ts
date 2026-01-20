import { Component, HostListener } from '@angular/core';
import { ApexChart, ApexLegend } from 'ng-apexcharts';

interface Research {
  type: 'project' | 'article' | 'innovation';
  faculty: string;
  funding: 'internal' | 'external';
  year: number;
  name: string;
  title: string;
}

@Component({
  selector: 'app-report-researcher-research',
  standalone: false,
  templateUrl: './report-researcher-research.component.html',
  styleUrl: './report-researcher-research.component.css',
})
export class ReportResearcherResearchComponent {
  openDropdown: string | null = null;
  /** ===== STATE ===== */
  isSearched = false;

  selectedType = '';
  selectedFaculty = '';
  selectedFunding = '';
  selectedYear = '';
  researchTitle = '';

  searchFaculitie = '';

  facultySearch: string = '';

  /** ===== DATA (ตัวอย่าง) ===== */
  researches: Research[] = [
    {
      type: 'project',
      faculty: 'คณะวิศวกรรมศาสตร์',
      funding: 'external',
      year: 2024,
      name: 'นาย ก',
      title: 'ระบบ AI',
    },
    {
      type: 'article',
      faculty: 'คณะวิทยาศาสตร์',
      funding: 'internal',
      year: 2023,
      name: 'นาง ข',
      title: 'ชีววิทยาโมเลกุล',
    },
    {
      type: 'article',
      faculty: 'คณะเทคโนโลยีสารสนเทศ',
      funding: 'internal',
      year: 2023,
      name: 'นาง ข',
      title: 'ชีววิทยาโมเลกุล',
    },
    {
      type: 'article',
      faculty: 'คณะบริหารธุรกิจ',
      funding: 'internal',
      year: 2023,
      name: 'นาง ข',
      title: 'ชีววิทยาโมเลกุล',
    },
    {
      type: 'article',
      faculty: 'คณะครุศาสตร์',
      funding: 'internal',
      year: 2025,
      name: 'นาง f',
      title: 'ชีววิทยาโมเลกุล',
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
  years = [2022, 2023, 2024];

  /** ===== FILTERED (ตาราง + กราฟใช้ชุดนี้) ===== */
  filteredResearchers: Research[] = [];

  /** ===== DONUT CHART ===== */
  donutLabels: string[] = [];
  donutSeries: number[] = [];
  totalResearchers = 0;

  donutChart = {
    type: 'donut' as const,
    height: 300,
  };

  donutLegend = {
    position: 'bottom' as const,
  };

  /** ===== SEARCH ===== */
  search() {
    this.isSearched = true;

    this.filteredResearchers = this.researches.filter((r) => {
      return (
        (!this.selectedType || r.type === this.selectedType) &&
        (!this.selectedFaculty || r.faculty === this.selectedFaculty) &&
        (!this.selectedFunding || r.funding === this.selectedFunding) &&
        (!this.selectedYear || r.year === +this.selectedYear) &&
        (!this.researchTitle ||
          r.title.toLowerCase().includes(this.researchTitle.toLowerCase()))
      );
    });

    this.prepareDonut();
  }

  /** ===== DONUT CALCULATION (อิงข้อมูลตารางจริง) ===== */
  prepareDonut() {
    const map: Record<string, number> = {};

    this.filteredResearchers.forEach((r) => {
      map[r.type] = (map[r.type] || 0) + 1;
    });

    this.donutLabels = Object.keys(map).map((t) =>
      t === 'project'
        ? 'โครงการวิจัย'
        : t === 'article'
        ? 'บทความ/วารสาร'
        : 'นวัตกรรม'
    );

    this.donutSeries = Object.values(map);
    this.totalResearchers = this.filteredResearchers.length;
  }


toggleDropdown(name: string, event:MouseEvent) {
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

  return this.faculties.filter(f =>
    f.toLowerCase().includes(this.searchFaculitie.toLowerCase())
  );
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
