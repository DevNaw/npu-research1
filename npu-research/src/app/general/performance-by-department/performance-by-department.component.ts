import { Component, OnInit } from '@angular/core';
import { DepartmentData } from '../../models/department.model';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';

type ReportType = 'research' | 'article' | 'innovation';


@Component({
  selector: 'app-performance-by-department',
  standalone: false,
  templateUrl: './performance-by-department.component.html',
  styleUrl: './performance-by-department.component.css'
})
export class PerformanceByDepartmentComponent implements OnInit {
reportType: ReportType | null = null;

pageSize = 10;
currentPage = 1;

documents: DepartmentData[] = [
  {
    id: 1,
    major: 'คณะวิศวกรรมศาสตร์',
    academic: 12
  },
  {
    id: 2,
    major: 'คณะวิทยาศาสตร์',
    academic: 9
  },
  {
    id: 3,
    major: 'คณะครุศาสตร์',
    academic: 7
  },
  {
    id: 4,
    major: 'คณะเทคโนโลยีอุตสาหกรรม',
    academic: 10
  },
  {
    id: 5,
    major: 'คณะวิทยาการจัดการและเทคโนโลยีสารสนเทศ',
    academic: 14
  },
];

filteredDocuments: DepartmentData[] = [];

titles: Record<ReportType, { main: string; sub: string }> = {
  research: {
    main: 'รายงานจำนวนโครงการวิจัย',
    sub: 'จำแนกตามหน่วยงาน',
  },
  article: {
    main: 'รายงานจำนวนบทความ/วารสาร',
    sub: 'จำแนกตามหน่วยงาน',
  },
  innovation: {
    main: 'รายงานจำนวนนวัตกรรมสิ่งประดิษฐ์',
    sub: 'จำแนกตามหน่วยงาน',
  },
};


constructor(private router: Router, private route: ActivatedRoute) {}

ngOnInit(){
  const type = this.route.snapshot.paramMap.get('type');
    this.reportType = this.isReportType(type) ? type : null;

    this.filteredDocuments = [...this.documents];
}

isReportType(value: string | null): value is ReportType {
  return value === 'research' || value === 'article' || value === 'innovation';
}

viewResearchReport() {
  this.reportType = 'research';
}

viewArticleReport() {
  this.reportType = 'article';
}

viewInnovationReport() {
  this.reportType = 'innovation';
}

get totalPages(): number {
  return Math.ceil(this.filteredDocuments.length / this.pageSize);
}

get pages(): number[] {
  return Array.from({ length: this.totalPages }, (_, i) => i + 1);
}

get totalDepartment(): number {
  return this.filteredDocuments.reduce(
    (sum, r) => sum + r.academic,
    0
  );
}

get totalSupport():number {
  return this.filteredDocuments.reduce(
    (sum: number, r: any) => sum + r.support, 0
  );
}

get paginatedDepartment(): DepartmentData[] {
  const start = (this.currentPage - 1) * this.pageSize;
  return this.filteredDocuments.slice(start, start + this.pageSize);
}

changePage(page: number): void {
  if (page < 1 || page > this.totalPages) return;
  this.currentPage = page;
}

goToDetail(d: DepartmentData): void {
  if (!this.reportType) return;

  this.router.navigate([
    '/performance-detail-by-departmaent',
    this.reportType,
    d.id,
  ]);
}
}
