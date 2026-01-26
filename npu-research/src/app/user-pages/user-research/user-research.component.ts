import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ApexChart, ApexLegend } from 'ng-apexcharts';
import { AuthService } from '../../services/auth.service';

interface Research {
  id: number;
  type: 'research' | 'article' | 'innovation';
  faculty: string;
  funding: 'internal' | 'external';
  year: number;
  name: string;
  title: string;
}

@Component({
  selector: 'app-user-research',
  standalone: false,
  templateUrl: './user-research.component.html',
  styleUrl: './user-research.component.css',
})
export class UserResearchComponent {
  openDropdown: string | null = null;
  isSearched = false;

  selectedFaculty = '';
  selectedFunding = '';
  selectedYear = '';
  researchTitle = '';
  searchSubType = '';

  searchFaculitie = '';
  searchType = '';
  facultySearch: string = '';
  selectedType: string | null = null;
  selectedSubType: string | null = null;

  searchAgency = '';
  selectedAgency: string | null = null;

  constructor(private router: Router, private authService: AuthService) {}

  /** ===== DATA (ตัวอย่าง) ===== */
  researches: Research[] = [
    {
      id: 1,
      type: 'research',
      faculty: 'คณะวิศวกรรมศาสตร์',
      funding: 'external',
      year: 2024,
      name: 'นาย ก',
      title: 'ระบบ AI',
    },
    {
      id: 2,
      type: 'article',
      faculty: 'คณะวิทยาศาสตร์',
      funding: 'internal',
      year: 2023,
      name: 'นาง ข',
      title: 'ชีววิทยาโมเลกุล',
    },
    {
      id: 3,
      type: 'article',
      faculty: 'คณะเทคโนโลยีสารสนเทศ',
      funding: 'internal',
      year: 2023,
      name: 'นาง ข',
      title: 'ชีววิทยาโมเลกุล',
    },
    {
      id: 4,
      type: 'article',
      faculty: 'คณะบริหารธุรกิจ',
      funding: 'internal',
      year: 2023,
      name: 'นาง ข',
      title: 'ชีววิทยาโมเลกุล',
    },
    {
      id: 5,
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

  agency = [
    'คณะวิทยาศาสตร์',
    'คณะวิศวกรรมศาสตร์',
    'คณะเทคโนโลยีสารสนเทศ',
    'คณะบริหารธุรกิจ',
    'คณะมนุษยศาสตร์และสังคมศาสตร์',
    'คณะศึกษาศาสตร์',
    'คณะสาธารณสุขศาสตร์',
    'คณะพยาบาลศาสตร์',
    'คณะเกษตรศาสตร์',
    'คณะนิติศาสตร์',
    'บัณฑิตวิทยาลัย',
    'สำนักวิจัยและพัฒนา',
    'สถาบันวิจัยและนวัตกรรม',
  ];
  

  typeList = ['บทความ', 'วารสาร', 'นวัตกรรมสิ่งประดิษฐ์'];

  subTypeMap: any = {
    บทความ: ['ประชุมวิชาการระดับชาติ', 'ประชุมวิชาการระดับนานาชาติ'],
    วารสาร: ['วารสารในประเทศ', 'วารสารต่างประเทศ'],
    นวัตกรรมสิ่งประดิษฐ์: [], // ไม่มีตัวเลือกย่อย
  };

  years = [2022, 2023, 2024];

  dateRange: {
    start: Date | null;
    end: Date | null;
  } = {
    start: null,
    end: null,
  };
  

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

  selectType(t: string) {
    this.selectedType = t;
    this.selectedSubType = null;
    this.searchType = '';
    this.searchSubType = '';

    // ปิด type
    this.openDropdown = null;

    // ถ้ามีประเภทย่อย → เปิด subType
    if (this.subTypeMap[t] && this.subTypeMap[t].length > 0) {
      setTimeout(() => {
        this.openDropdown = 'subType';
      }, 0);
    }
  }

  selectSubType(st: string) {
    this.selectedSubType = st;
    this.searchSubType = '';
    this.openDropdown = null;
  }

  selectAgency(a: string) {
    this.selectedAgency = a;
    this.searchAgency = '';
    this.openDropdown = null;
  }

  filteredAgency(): string[] {
    if (!this.searchAgency) return this.agency;

    return this.agency.filter((a) =>
    a.toLowerCase().includes(this.searchAgency.toLowerCase()));
  }

  filteredFaculties(): string[] {
    if (!this.searchFaculitie) return this.faculties;

    return this.faculties.filter((f) =>
      f.toLowerCase().includes(this.searchFaculitie.toLowerCase())
    );
  }

  filteredType() {
    return this.typeList.filter((t) =>
      t.toLowerCase().includes(this.searchType.toLowerCase())
    );
  }

  filteredSubType() {
    if (!this.selectedType) return [];
    return this.subTypeMap[this.selectedType].filter((st: string) =>
      st.toLowerCase().includes(this.searchSubType.toLowerCase())
    );
  }

  displaySelectedType(): string {
    if (!this.selectedType) {
      return 'เลือกประเภทผลงาน';
    }

    if (this.selectedSubType) {
      return `${this.selectedType} / ${this.selectedSubType}`;
    }

    return this.selectedType;
  }

  goToResearch(id: number, type: 'research' | 'article' | 'innovation') {
    let basePath = '/performance';

    if (this.authService.isLoggedIn()) {
      basePath = this.authService.isAdmin()
        ? '/admin/performance'
        : 'user/performance';
    }

    this.router.navigate([basePath, type, id]);
  }
}
