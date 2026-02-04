import { Component } from '@angular/core';
import { DepartmentData } from '../../models/department.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-performance-by-department',
  standalone: false,
  templateUrl: './performance-by-department.component.html',
  styleUrl: './performance-by-department.component.css'
})
export class PerformanceByDepartmentComponent {
// reportType เอาไว้บอกว่าตอนนี้ดูรายงานอะไร
reportType: 'research' | 'article' | 'innovation' | null = null;
pageSize = 10;
currentPage = 1;

documents: DepartmentData[] = [
  {
    id: 1,
    major: 'สาขาวิศวกรรมคอมพิวเตอร์',
    academic: 3
  },
  {
    id: 2,
    major: 'สาขาวิทยาการคอม',
    academic: 3
  },
  {
    id: 3,
    major: 'สาขาเกษตร',
    academic: 2
  },
];

filteredDocuments = [...this.documents];

constructor(private router: Router) {}

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
  return Math.ceil(this.documents.length / this.pageSize);
}

get pages(): number[] {
  return Array.from({ length: this.totalPages }, (_, i) => i + 1);
}

get totalDepartment(): number {
  return this.filteredDocuments.reduce(
    (sum: number, r: any) => sum + r.academic, 0
  );
}

get totalSupport():number {
  return this.filteredDocuments.reduce(
    (sum: number, r: any) => sum + r.support, 0
  );
}

get paginatedDepartment() {
  const startIndex = (this.currentPage - 1) * this.pageSize;
  return this.documents.slice(startIndex, startIndex + this.pageSize);
}

changePage(page: number) {
  if (page < 1 || page > this.totalPages) return;

  if (page === this.currentPage) return;

  this.currentPage = page;
}

goToDetail() {
  this.router.navigate(['/performance-detail-by-departmaent']);
}
}
