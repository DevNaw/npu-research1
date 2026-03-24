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
  ApexMarkers,
  ApexTooltip,
  ApexXAxis,
} from 'ng-apexcharts';
import { MainComponent } from '../../shared/layouts/main/main.component';
import { AuthService } from '../../services/auth.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: any;
  annotations: ApexAnnotations;
  fill: ApexFill;
  stroke: ApexStroke;
  grid: ApexGrid;
  tooltip?: ApexTooltip;
};

export type RadarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  fill: ApexFill;
  stroke: ApexStroke;
  markers: ApexMarkers;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  plotOptions?: ApexPlotOptions;
  yaxis?: ApexYAxis;
  tooltip?: ApexTooltip;
  colors?: string[];
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
  radarChartOptions!: Partial<RadarChartOptions>;
  radarChartOptionsSub!: Partial<RadarChartOptions>;
  fullLabels: string[] = [];
  fullLabelsSub: string[] = [];
  fullLabelSubSub: string[] = [];
  chartOptions: any;

  charts: {
    type: ReportType;
    title: string;
    subtitle: string;
    options: ChartOptions;
  }[] = [];

  chartsOECD: {
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

  constructor(
    private router: Router,
    private service: DashboardService,
    private authService: AuthService,
  ) {
    this.radarChartOptions = {
      series: [
        {
          name: 'จำนวนงานวิจัย',
          data: [],
        },
      ],
      chart: {
        type: 'radar',
        height: 300,
        width: '100%',
        toolbar: { show: false },
        foreColor: '#394250',
      },
      labels: [],
      fill: {
        opacity: 0.3,
      },
      stroke: {
        width: 2,
        colors: ['#038FFB'],
      },
      markers: {
        size: 4,
        colors: ['#038FFB'],
        strokeColors: '#394250',
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ['#394250'],
        },
      },

      plotOptions: {
        radar: {
          size: 120,
          polygons: {
            strokeColors: '#e5e7eb',
            fill: {
              colors: ['transparent'],
            },
          },
        },
      },

      yaxis: {
        labels: {
          style: {
            colors: '#394250',
          },
        },
      },

      xaxis: {
        labels: {
          style: {
            colors: '#394250',
          },
        },
      },

      tooltip: {
        theme: 'dark',
        custom: ({ series, seriesIndex, dataPointIndex }) => {
          const fullLabel = this.fullLabels[dataPointIndex]; // ⭐ ตัวจริง
          const value = series[seriesIndex][dataPointIndex];
      
          return  `<div style="padding:8px 12px; background:#333; color:#fff; border-radius:6px;">
        <div style="font-weight:600; margin-bottom:4px;">${fullLabel}</div>
        <hr style="border-color:#555; margin:4px 0;">
        <div style="display:flex; justify-content:space-around; align-items:center; gap:6px;">
          <span style="width:10px; height:10px; border-radius:50%; background:#038FFB; display:inline-block;"></span>
          <span>จำนวน: ${value}</span>
        </div>
      </div>`;
        }
      },
    };

    this.radarChartOptionsSub = {
      series: [
        {
          name: 'จำนวนงานวิจัย',
          data: [],
        },
      ],
      chart: {
        type: 'radar',
        height: 480,
        width: '100%',
        toolbar: { show: false },
        foreColor: '#394250',
      },
      labels: [],
      fill: {
        opacity: 0.3,
        colors: ['#FF4560'],
      },
      stroke: {
        width: 2,
        colors: ['#FF4560'],
      },
      markers: {
        size: 4,
        colors: ['#FF4560'],
        strokeColors: '#ffffff',
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ['#394250'],
        },
      },

      plotOptions: {
        radar: {
          size: 120,
          polygons: {
            strokeColors: '#e5e7eb',
            fill: {
              colors: ['transparent'],
            },
          },
        },
      },

      yaxis: {
        labels: {
          style: {
            colors: '#394250',
          },
        },
      },

      xaxis: {
        labels: {
          style: {
            colors: '#394250',
          },
        },
      },

      tooltip: {
        theme: 'dark',
        custom: ({ series, seriesIndex, dataPointIndex }) => {
          const fullLabelSub = this.fullLabelsSub[dataPointIndex];
          const value = series[seriesIndex][dataPointIndex];
      
          return  `<div style="padding:8px 12px; background:#333; color:#fff; border-radius:6px;">
        <div style="font-weight:600; margin-bottom:4px;">${fullLabelSub}</div>
        <hr style="border-color:#555; margin:4px 0;">
        <div style="display:flex; justify-content:space-around; align-items:center; gap:6px;">
          <span style="width:10px; height:10px; border-radius:50%; background:#FF4560; display:inline-block;"></span>
          <span>จำนวน: ${value}</span>
        </div>
      </div>`;
        }
      },
    };
  }

  ngOnInit(): void {
    MainComponent.showLoading();

    Promise.all([
      this.loadDashboardData(),
      new Promise(resolve => setTimeout(resolve, 1000))
    ]).then(() => {
      MainComponent.hideLoading();
    });
    
    this.updatePagination();
  }

  loadDashboardData(): void {
    this.loading = true;
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
          this.initChartsOECD();
          this.changeTabForChart(this.selectedTab);
          this.loading = false;
        }
      },
      error: (err) => {
        console.error('Dashboard Load Error:', err);
        this.loading = false;
      },
    });
  }

  initCharts(): void {
    const graph = this.dashboardData?.statistic_graph;

    this.charts = [
      {
        type: 'project',
        title: 'กราฟสรุปจำนวนโครงการวิจัย',
        subtitle: 'จำแนกตามหน่วยงาน',
        options: this.createBarChart(graph?.graph_project ?? []),
      },
      {
        type: 'article',
        title: 'กราฟสรุปจำนวนบทความวิชาการ',
        subtitle: 'จำแนกตามหน่วยงาน',
        options: this.createBarChart(graph?.graph_article ?? []),
      },
      {
        type: 'innovation',
        title: 'กราฟสรุปจำนวนนวัตกรรมสิ่งประดิษฐ์',
        subtitle: 'จำแนกตามหน่วยงาน',
        options: this.createBarChart(graph?.graph_innovation ?? []),
      },
    ];
  }

  private createBarChart(
    data: { label: string; count: number; label_full: string }[]
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
          enabled: false,
        },
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: true,
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
        categories: data.map((item) => item.label),
        tickPlacement: 'on',
        axisBorder: {
          show: true,
          color: '#000',
          height: 1,
        },
        labels: {
          rotate: -45,
          style: {
            fontSize: '12px',
          },
        },
        axisTicks: {
          show: true,
          color: '#000',
        },
      },
      tooltip: {
        theme: 'dark',
        custom: ({ series, seriesIndex, dataPointIndex }) => {
          const fullLabel = data[dataPointIndex]?.label_full ?? '';
          const value = series[seriesIndex][dataPointIndex]; // แก้ตรงนี้
      
          return `<div style="padding:8px 12px; background:#333; color:#fff; border-radius:6px;">
            <div style="font-weight:600; margin-bottom:4px;">${fullLabel}</div>
            <hr style="border-color:#555; margin:4px 0;">
            <div style="display:flex; justify-content:space-around; align-items:center; gap:6px;">
              <span style="width:10px; height:10px; border-radius:50%; background:#038FFB; display:inline-block;"></span>
              <span>จำนวน: ${value}</span>
            </div>
          </div>`;
        }
      },
      yaxis: {
        title: {
          text: 'จำนวน',
        },
        min: 0,
        max: Math.max(...data.map((item) => item.count)),
        tickAmount: 4,
        axisBorder: {
          show: true,
          color: '#000',
        },
        axisTicks: {
          show: true,
          color: '#000',
        },
      },
      stroke: {
        width: 1,
      },

      fill: {
        opacity: 1,
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
        borderColor: '#bdbdbd',
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
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.5
        },
        column: {
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.5
        }
      }
    };
  }

  initChartsOECD(): void {
    const raw = this.dashboardData?.radar.child?.raw || [];
  
    const getValue = (item: any) => {
      switch (this.selectedTab) {
        case 'PROJECT':
          return item.PROJECT;
        case 'ARTICLE':
          return item.ARTICLE;
        case 'INNOVATION':
          return item.INNOVATION;
        default:
          return 0;
      }
    };
  
    const mappedData = raw.map(item => ({
      label: item.name,
      count: getValue(item),
    }));
  
    this.chartsOECD = [
      {
        type: this.selectedTab.toLowerCase() as any,
        title: 'กราฟสรุปตาม OECD (สาขาย่อย)',
        subtitle: 'จำแนกตามประเภทผลงาน',
        options: this.createBarChartOECD(mappedData),
      },
    ];
  }

  private createBarChartOECD(
    data: { label: string; count: number }[]
  ): ChartOptions {

  const shortLabels = data.map(item => this.truncateText(item.label, 8));
  const values = data.map(item => item.count);

  const maxValue = Math.max(...values, 10);

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
          enabled: false,
        },
        zoom: {
          enabled: false,
        },
        toolbar: {
          show: true,
        },
      },
      plotOptions: {
        bar: {
          columnWidth: '40%',
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
        categories: shortLabels,
        tickPlacement: 'on',
        labels: {
          rotate: -45,
          hideOverlappingLabels: true,
          trim: true,
          style: {
            fontSize: '11px',
          },
        },
      },
      tooltip: {
        custom: ({ series, seriesIndex, dataPointIndex }: any) => {
          const fullLabel = data[dataPointIndex]?.label ?? '';
          const value = series[seriesIndex][dataPointIndex];
      
          return `
            <div style="padding:10px 14px; background:#fff; color:#333; border-radius:6px; border:1px solid #e0e0e0; box-shadow:0 2px 8px rgba(0,0,0,0.15);">
              <div style="font-weight:600; margin-bottom:6px;">${fullLabel}</div>
              <hr style="border-color:#eee; margin:4px 0;">
              <div style="display:flex; align-items:center; gap:6px;">
                <span style="width:10px; height:10px; border-radius:50%; background:#008FFB; display:inline-block;"></span>
                <span>จำนวนผลงาน: <strong>${value}</strong></span>
              </div>
            </div>
          `;
        },
      },
      yaxis: {
        title: {
          text: 'จำนวน',
        },
        min: 0,
        max: maxValue,
        tickAmount: 4,
        axisBorder: {
          show: true,
          color: '#000',
        },
        axisTicks: {
          show: true,
          color: '#000',
        },
      },
      stroke: {
        width: 1,
      },

      fill: {
        opacity: 1,
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
        borderColor: '#bdbdbd',
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
          colors: ['#f3f3f3', 'transparent'],
          opacity: 0.5
        },
        column: {
          colors: ['#f3f3f3', 'transparent'],
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

  // viewItem(id: number) {
  //   this.router.navigate([
  //     '/performance-public',
  //     this.selectedTab.toLowerCase(),
  //     id,
  //   ]);
  // }

  viewItem(id: number) {
    if (this.authService.isLoggedIn()) {
      const basePath = this.authService.isAdmin()
        ? '/admin/performance-by-departmaent'
        : '/user/performance-by-departmaent';
  
      this.router.navigate([basePath, this.selectedTab.toLowerCase(), id]);
    } else {
      this.router.navigate([
        '/performance-public',
        this.selectedTab.toLowerCase(),
        id,
      ]);
    }
  }

  changeTab(tab: ResearchType): void {
    this.selectedTab = tab;
    this.searchText = '';
    this.currentPage = 1;

    const key = this.mapResearchTypeToKey(tab);
    this.filteredResearch = [...this.publications[key]];

    this.updatePagination();
  }

  changeTabForChart(tab: ResearchType): void {
    this.selectedTab = tab;

    const tabIndex = 
      tab === 'PROJECT'
        ? 0
        : tab === 'ARTICLE'
        ? 1
        : 2;

    let values: any;
    let labels: string[] = [];
  
    if (tab === 'PROJECT') {
      labels = this.dashboardData?.radar.major.labels || [];
      values = this.dashboardData?.radar.major.datasets[tabIndex].data || [];
      
    } else if (tab === 'ARTICLE') {
      labels = this.dashboardData?.radar.major.labels || [];
      values = this.dashboardData?.radar.major.datasets[tabIndex].data || [];
    } else {
      labels = this.dashboardData?.radar.major.labels || [];
      values = this.dashboardData?.radar.major.datasets[tabIndex].data || [];
    }
  
    // ===== RADAR =====
    this.fullLabels = labels;
    this.radarChartOptions.labels = labels.map(l => this.shortLabel(l));
    this.radarChartOptions.series = [
      {
        name: 'จำนวนงานวิจัย',
        data: values,
      },
    ];
  
    if (tab === 'PROJECT') {
      labels = this.dashboardData?.radar.sub.labels || [];
      values = this.dashboardData?.radar.sub.datasets[tabIndex].data || [];
      
    } else if (tab === 'ARTICLE') {
      labels = this.dashboardData?.radar.sub.labels || [];
      values = this.dashboardData?.radar.sub.datasets[tabIndex].data || [];
    } else {
      labels = this.dashboardData?.radar.sub.labels || [];
      values = this.dashboardData?.radar.sub.datasets[tabIndex].data || [];
    }
  
    // ===== RADAR =====
    this.fullLabelsSub = labels;
    this.radarChartOptionsSub.labels = labels.map(l => this.shortLabel(l));
    this.radarChartOptionsSub.series = [
      {
        name: 'จำนวนงานวิจัย',
        data: values,
      },
    ];

    const ford = this.dashboardData?.ford || {
      project: [],
      article: [],
      innovation: [],
    };
    let dataFord = 
      tab === 'PROJECT'
        ? ford.project
        : tab === 'ARTICLE'
        ? ford.article
        : ford.innovation;
  
    // ===== PIE (CanvasJS) ⭐ สำคัญ =====
    this.loading = true;

    setTimeout(() => {
      this.chartOptions = {
        ...this.chartOptions,
        animationEnabled: true,
        backgroundColor: 'transparent',
        legend: {
          fontColor: '#ffffff',
        },
      data: [
        {
          type: 'doughnut',
          startAngle: 90,
          showInLegend: false,
          indexLabel: '{label}, ({percent}%)',
          indexLabelFontColor: '#ffffff',
          dataPoints: dataFord.map((ford, i) => ({
            label: ford.name,
            y: ford.count,
            percent: ford.percent,
          })),
        },
      ],
      colorSet: 'customColorSet',
    };

    this.initChartsOECD();
    this.loading = false;
    }, 0);
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

  getTotalCount(type: string): number {
    const data =
      type === 'project'
        ? this.dashboardData?.statistic_graph?.graph_project
        : type === 'article'
        ? this.dashboardData?.statistic_graph?.graph_article
        : this.dashboardData?.statistic_graph?.graph_innovation;
  
    return data?.reduce((sum, item) => sum + (item.count || 0), 0) || 0;
  }

  shortLabel(fullLabel: any) {
    const maxLength = 12;
    const shortLabel =
      fullLabel.length > maxLength
        ? fullLabel.slice(0, maxLength) + '...'
        : fullLabel;

    return shortLabel;
  }

  truncateText(text: string, maxLength: number = 6): string {
    if (!text) return '';
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  }

  get visiblePages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: (number | string)[] = [];
  
    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }
  
    pages.push(1);
  
    if (current > 3) pages.push('...');
  
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
      pages.push(i);
    }
  
    if (current < total - 2) pages.push('...');
  
    pages.push(total);
  
    return pages;
  }
}
