import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MajorData } from '../../models/major.model';

type ReportType = 'research' | 'article' | 'innovation';

@Component({
  selector: 'app-performance-detail-by-department',
  standalone: false,
  templateUrl: './performance-detail-by-department.component.html',
  styleUrl: './performance-detail-by-department.component.css',
})
export class PerformanceDetailByDepartmentComponent {
  reportType!: ReportType;
  departmentId!: number;
  department?: any;

  pageSize = 10;
  currentPage = 1;

  departments = [
    { id: 1, major: 'คณะวิศวกรรมศาสตร์' },
    { id: 2, major: 'คณะวิทยาศาสตร์' },
    { id: 3, major: 'คณะครุศาสตร์' },
    { id: 4, major: 'คณะเทคโนโลยีอุตสาหกรรม' },
    { id: 5, major: 'คณะวิทยาการจัดการและเทคโนโลยีสารสนเทศ' },
  ];

  allMajors: MajorData[] = [
    // ================= คณะวิศวกรรมศาสตร์ =================
    {
      id: 1,
      departmentId: 1,
      branch_name: 'วิศวกรรมคอมพิวเตอร์',
      research: 3,
      article: 5,
      innovation: 2,
    },
    {
      id: 2,
      departmentId: 1,
      branch_name: 'วิศวกรรมไฟฟ้า',
      research: 4,
      article: 3,
      innovation: 1,
    },
    {
      id: 3,
      departmentId: 1,
      branch_name: 'วิศวกรรมโยธา',
      research: 2,
      article: 4,
      innovation: 2,
    },

    // ================= คณะวิทยาศาสตร์ =================
    {
      id: 4,
      departmentId: 2,
      branch_name: 'คณิตศาสตร์',
      research: 5,
      article: 3,
      innovation: 1,
    },
    {
      id: 5,
      departmentId: 2,
      branch_name: 'ฟิสิกส์',
      research: 4,
      article: 2,
      innovation: 2,
    },
    {
      id: 6,
      departmentId: 2,
      branch_name: 'เคมี',
      research: 3,
      article: 4,
      innovation: 1,
    },

    // ================= คณะครุศาสตร์ =================
    {
      id: 7,
      departmentId: 3,
      branch_name: 'การประถมศึกษา',
      research: 6,
      article: 3,
      innovation: 2,
    },
    {
      id: 8,
      departmentId: 3,
      branch_name: 'ภาษาไทย',
      research: 2,
      article: 2,
      innovation: 0,
    },
    {
      id: 9,
      departmentId: 3,
      branch_name: 'ภาษาอังกฤษ',
      research: 3,
      article: 2,
      innovation: 1,
    },

    // ================= คณะเทคโนโลยีอุตสาหกรรม =================
    {
      id: 10,
      departmentId: 4,
      branch_name: 'เทคโนโลยีอุตสาหกรรม',
      research: 4,
      article: 4,
      innovation: 3,
    },
    {
      id: 11,
      departmentId: 4,
      branch_name: 'เทคโนโลยีการผลิต',
      research: 3,
      article: 6,
      innovation: 2,
    },

    // ================= คณะวิทยาการจัดการและเทคโนโลยีสารสนเทศ =================
    {
      id: 12,
      departmentId: 5,
      branch_name: 'วิทยาการคอมพิวเตอร์',
      research: 5,
      article: 8,
      innovation: 4,
    },
    {
      id: 13,
      departmentId: 5,
      branch_name: 'ระบบสารสนเทศ',
      research: 4,
      article: 6,
      innovation: 3,
    },
  ];

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const type = this.route.snapshot.paramMap.get('type');
    this.departmentId = Number(this.route.snapshot.paramMap.get('id'));

    if (type === 'research' || type === 'article' || type === 'innovation') {
      this.reportType = type;
    }

    this.department = this.departments.find((d) => d.id === this.departmentId);

    this.filteredMajors = this.allMajors.filter(
      (m) => m.departmentId === this.departmentId
    );
  }

  filteredMajors: MajorData[] = [];

  get totalPages(): number {
    return Math.ceil(this.filteredMajors.length / this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get totalAll(): number {
    return this.filteredMajors.reduce((sum, m) => {
      return (
        sum +
        (this.reportType === 'research'
          ? m.research
          : this.reportType === 'article'
          ? m.article
          : m.innovation)
      );
    }, 0);
  }

  get paginatedMajors() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredMajors.slice(start, start + this.pageSize);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;

    if (page === this.currentPage) return;

    this.currentPage = page;
  }
}
