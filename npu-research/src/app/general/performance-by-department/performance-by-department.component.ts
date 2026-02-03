import { Component } from '@angular/core';

@Component({
  selector: 'app-performance-by-department',
  standalone: false,
  templateUrl: './performance-by-department.component.html',
  styleUrl: './performance-by-department.component.css'
})
export class PerformanceByDepartmentComponent {
// reportType เอาไว้บอกว่าตอนนี้ดูรายงานอะไร
reportType: 'research' | 'article' | 'innovation' | null = null;

viewResearchReport() {
  this.reportType = 'research';
}

viewArticleReport() {
  this.reportType = 'article';
}

viewInnovationReport() {
  this.reportType = 'innovation';
}

}
