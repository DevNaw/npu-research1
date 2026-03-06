import { Component, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Router } from '@angular/router';
import { DataPerformanceItem } from '../../models/dashboard.model';
import { registerLocaleData } from '@angular/common';
import localeTh from '@angular/common/locales/th';
import { NewsItem } from '../../models/news.model';
import { DashboardService } from '../../services/dashboard.service';
import {
  DashboardData,
  DashboardResponse,
  ResearchItem,
  ResearchSection,
  ResearchType,
} from '../../models/dashboard-main.model';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexPlotOptions,
  ApexYAxis,
  ApexStroke,
  ApexGrid,
  ApexAnnotations,
  ApexFill,
  ChartComponent,
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: any; //ApexXAxis;
  annotations: ApexAnnotations;
  fill: ApexFill;
  stroke: ApexStroke;
  grid: ApexGrid;
};

export type ReportType = 'project' | 'article' | 'innovation';

registerLocaleData(localeTh);

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class UserDashboardComponent implements OnInit {
  @ViewChild('chart') chart: ChartComponent | undefined;

  charts: {
    type: ReportType;
    title: string;
    subtitle: string;
    options: ChartOptions;
  }[] = [];

  today: Date = new Date();
  newsList: NewsItem[] = [];

  pageSize = 10;
  currentPage = 1;
  searchText = '';
  selectedTab: ResearchType = 'PROJECT';
  reportType: ReportType = 'project';

  loading = false;
  error: string | null = null;

  publications: ResearchSection = {
    projects: [],
    articles: [],
    innovations: [],
  };

  researches: DataPerformanceItem[] = [];
  dashboardData: DashboardData | null = null;

  filteredResearch: ResearchItem[] = [];
  paginatedPublications: ResearchItem[] = [];

  constructor(private router: Router, private service: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();
    this.updatePagination();
  }

  loadDashboardData(): void {
    this.service.getDashboardData().subscribe({
      next: (res: DashboardResponse) => {
        if (res?.result === 1 && res?.data) {
          this.dashboardData = res.data;
          this.newsList = res.data.news;

          this.publications = res.data.researchs;

          const key = this.mapResearchTypeToKey(this.selectedTab);
          this.filteredResearch = [...this.publications[key]];

          this.updatePagination();
          this.initCharts();
        }
      },
      error: (err) => {
        console.error('Dashboard Load Error:', err);
      },
    });
  }

  initCharts(): void {
    const graph = this.dashboardData?.statistic_graph;

    this.charts = [
      {
        type: 'project',
        title: 'โครงการวิจัย',
        subtitle: 'สถิติตามปีงบประมาณ',
        options: this.createBarChart(graph?.graph_project ?? []),
      },
      {
        type: 'article',
        title: 'บทความวิจัย',
        subtitle: 'สถิติตามปีงบประมาณ',
        options: this.createBarChart(graph?.graph_article ?? []),
      },
      {
        type: 'innovation',
        title: 'ผลงานนวัตกรรม',
        subtitle: 'สถิติตามปีงบประมาณ',
        options: this.createBarChart(graph?.graph_innovation ?? []),
      },
    ];
  }

  private createBarChart(
    data: { label: string; count: number }[]
  ): ChartOptions {
    return {
      series: [
        {
          name: 'จำนวนผลงาน',
          data: data.map((item) => item.count),
        },
      ],
      annotations: {
        points: [],
      },
      chart: {
        type: 'bar',
        height: 500,
        stacked: false,
        animations: {
          enabled: false
        },
        zoom: {
          enabled: false
        },
        toolbar: {
          show: true
        },
      },
      plotOptions: {
        bar: {
          columnWidth: '50%',
          borderRadius: 6,
          borderRadiusApplication: 'around',
          backgroundBarOpacity: 1,
          backgroundBarRadius: 6,
        } as any,
      },
      dataLabels: {
        enabled: false,
      },
      xaxis: {
        labels: {
          rotate: -45,
          style: {
            fontSize: '12px',
          },
        },
        categories: data.map((item) => item.label),
        tickPlacement: 'on',
        axisBorder: {
          show: true,
          color: '#000',
          height: 1
        },
        axisTicks: {
          show: true,
          color: '#000'
        }
      },
      yaxis: {
        title: {
          text: 'จำนวน',
        },
        min: 0,
        tickAmount: 5,
        axisBorder: {
          show: true,
          color: '#000'
        },
        axisTicks: {
          show: true,
          color: '#000'
        }
      },
      stroke: {
        width: 2,
      },

      fill: {
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'horizontal',
          shadeIntensity: 0.25,
          gradientToColors: undefined,
          inverseColors: true,
          opacityFrom: 0.85,
          opacityTo: 0.85,
          stops: [50, 0, 100],
        },
      },

      grid: {
        show: true,
        borderColor: '#cccccc',
        strokeDashArray: 0,
        position: 'back',
        xaxis: {
          lines: {
            show: true
          }
        },
        yaxis: {
          lines: {
            show: true
          }
        },
        row: {
          colors: ['transparent'],
          opacity: 0.5
        },
        column: {
          colors: ['transparent'],
          opacity: 0.5
        }
      }
    };
  }

  onSearch() {
    const keyword = this.searchText.toLowerCase().trim();

    const key = this.mapResearchTypeToKey(this.selectedTab);

    this.filteredResearch = this.publications[key].filter(
      (p) =>
        p.title_th.toLowerCase().includes(keyword) ||
        (p.title_en?.toLowerCase().includes(keyword) ?? false) ||
        p.year.toString().includes(keyword) ||
        p.own.some((owner) => owner.full_name.toLowerCase().includes(keyword))
    );

    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedPublications = this.filteredResearch.slice(start, end);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updatePagination();
  }

  get totalPages(): number {
    return Math.ceil(this.filteredResearch.length / this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // Nevigate to
  goToResearch() {
    this.router.navigateByUrl('/research');
  }
  goToAticle() {
    this.router.navigateByUrl('/aticle');
  }
  goToInnovation() {
    this.router.navigateByUrl('/innovation');
  }
  goToManual() {
    this.router.navigateByUrl('/manual');
  }

  viewItem(id: number) {
    this.router.navigate([
      '/performance-public',
      this.selectedTab.toLowerCase(),
      id,
    ]);
  }

  changeTab(tab: ResearchType): void {
    this.selectedTab = tab;
    this.searchText = '';
    this.currentPage = 1;

    const key = this.mapResearchTypeToKey(tab);
    this.filteredResearch = [...this.publications[key]];

    this.updatePagination();
  }

  SeeMoreDetails(type: ReportType) {
    this.router.navigate(['/performance-by-departmaent', type]);
  }

  formatThaiDate(date: Date): string {
    const d = new Date(date);
    const day = d.getDate();
    const month = d.toLocaleDateString('th-TH', { month: 'long' });
    const year = d.getFullYear() + 543;

    return `${day} ${month} ${year}`;
  }

  goToNewsDetail(id: number): void {
    this.router.navigate(['/news', id]);
  }

  goToAllNews() {
    this.router.navigate(['/news']);
  }

  sweet() {
    Swal.fire({
      icon: 'success',
      title: 'Your work has been saved',
      showConfirmButton: false,
      timer: 1500,
    });
  }

  downloadPDF() {
    const element = document.getElementById('chart-pdf');
    if (!element) return;

    html2canvas(element, {
      scale: 2, // ⬅ เพิ่มความคม
      useCORS: true,
      backgroundColor: '#ffffff',
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 10, 10, pdfWidth - 20, pdfHeight);

      pdf.save('research-chart.pdf');
    });
  }

  getLastUpdatedText(): string {
    const now = new Date();

    const date = now.toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const time = now.toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });

    return `ข้อมูล ณ วันที่ ${date} เวลา ${time} น.`;
  }

  private mapResearchTypeToKey(type: ResearchType): keyof ResearchSection {
    switch (type) {
      case 'PROJECT':
        return 'projects';
      case 'ARTICLE':
        return 'articles';
      case 'INNOVATION':
        return 'innovations';
    }
  }
}
