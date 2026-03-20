import { Component, OnInit } from '@angular/core';
import { MainComponent } from '../../shared/layouts/main/main.component';
import { GraphItem, StatisticGraph } from '../../models/dashboard-main.model';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';

type ReportType = 'project' | 'article' | 'innovation';

@Component({
  selector: 'app-performance-by-department',
  standalone: false,
  templateUrl: './performance-by-department.component.html',
  styleUrl: './performance-by-department.component.css',
})
export class PerformanceByDepartmentComponent implements OnInit {
  dataChart: StatisticGraph | null = null;
  reportType: ReportType | null = null;

  currentPage = 1;
  pageSize = 10;

  filteredDocuments: GraphItem[] = [];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: DashboardService
  ) {}

  ngOnInit() {
    MainComponent.showLoading();

    const type = this.route.snapshot.paramMap.get('type');
    this.reportType = this.isReportType(type) ? type : null;

    this.loadData();
  }

  loadData() {
    this.service.getDashboardData().subscribe({
      next: (res) => {
        this.dataChart = res.data.statistic_graph;

        this.mapData();

        MainComponent.hideLoading(); // ✅ ย้ายมาถูกที่
      },
      error: (err) => {
        console.error(err);
        MainComponent.hideLoading();
      },
    });
  }

  isReportType(value: string | null): value is ReportType {
    return value === 'project' || value === 'article' || value === 'innovation';
  }

  get totalPages(): number {
    return Math.ceil(this.filteredDocuments.length / this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get totalDepartment(): number {
    return this.filteredDocuments.reduce((sum, r) => sum + r.count, 0);
  }

  get paginatedDepartment(): GraphItem[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredDocuments.slice(start, start + this.pageSize);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
  }

  mapData() {
    if (!this.dataChart || !this.reportType) return;

    if (this.reportType === 'project') {
      this.filteredDocuments = this.dataChart.graph_project;
    } else if (this.reportType === 'article') {
      this.filteredDocuments = this.dataChart.graph_article;
    } else {
      this.filteredDocuments = this.dataChart.graph_innovation;
    }

    this.currentPage = 1;
  }

  titles: Record<ReportType, { main: string; sub: string }> = {
    project: {
      main: 'รายงานโครงการวิจัย',
      sub: 'แยกตามหน่วยงาน',
    },
    article: {
      main: 'รายงานบทความวิจัย',
      sub: 'แยกตามหน่วยงาน',
    },
    innovation: {
      main: 'รายงานนวัตกรรม',
      sub: 'แยกตามหน่วยงาน',
    },
  };
}
