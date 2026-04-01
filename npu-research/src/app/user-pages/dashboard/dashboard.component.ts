import { Component, OnInit, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
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
import { Color, LegendPosition, ScaleType } from '@swimlane/ngx-charts';

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
  colors?: string[];
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

  // ngx-charts
  single: { name: string; value: number; extra: { percent: number } }[] = [];
  legendPosition: LegendPosition = LegendPosition.Below;
  hasData = false;

  colorScheme: Color = {
    name: 'horizon',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: [
      '#1094AB',
      '#EFC14E',
      '#ACD06D',
      '#930069',
      '#55CDE0',
      '#E44D7B',
      '#66C5A2',
      '#F5830A',
      '#6B4E92',
      '#C6D86E',
    ],
  };

  labelFormat = (name: string): string => {
    const item = this.single.find((d) => d.name === name);
    if (!item) return name;
    const total = this.single.reduce((sum, d) => sum + d.value, 0);
    const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
    return `${name}\n${percent}%`;
  };

  constructor(
    private router: Router,
    private service: DashboardService,
    private authService: AuthService
  ) {
    this.initRadarCharts();
  }

  ngOnInit(): void {
    MainComponent.showLoading();
    Promise.all([
      this.loadDashboardData(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => MainComponent.hideLoading());

    this.updatePagination();
  }

  private initRadarCharts(): void {
    const baseTooltip = (fullLabels: () => string[]) => ({
      theme: 'dark' as const,
      custom: ({ series, seriesIndex, dataPointIndex }: any) => {
        const label = fullLabels()[dataPointIndex];
        const value = series[seriesIndex][dataPointIndex];
        return `<div style="padding:8px 12px; background:#333; color:#fff; border-radius:6px;">
          <div style="font-weight:600; margin-bottom:4px;">${label}</div>
          <hr style="border-color:#555; margin:4px 0;">
          <div style="display:flex; align-items:center; gap:6px;">
            <span style="width:10px; height:10px; border-radius:50%; background:#038FFB; display:inline-block;"></span>
            <span>จำนวน: ${value}</span>
          </div>
        </div>`;
      },
    });

    const basePolygon = {
      strokeColors: '#e5e7eb',
      fill: { colors: ['transparent'] },
    };

    this.radarChartOptions = {
      series: [{ name: 'จำนวนงานวิจัย', data: [] as number[] }],
      chart: {
        type: 'radar',
        height: 300,
        width: '100%',
        toolbar: { show: false },
        foreColor: '#394250',
      },
      labels: [],
      fill: { opacity: 0.3 },
      stroke: { width: 2, colors: ['#038FFB'] },
      markers: { size: 4, colors: ['#038FFB'], strokeColors: '#394250' },
      dataLabels: { enabled: true, style: { colors: ['#394250'] } },
      plotOptions: { radar: { size: 120, polygons: basePolygon } },
      yaxis: { labels: { style: { colors: '#394250' } } },
      xaxis: { labels: { style: { colors: '#394250' } } },
      tooltip: baseTooltip(() => this.fullLabels),
    };

    this.radarChartOptionsSub = {
      series: [{ name: 'จำนวนงานวิจัย', data: [] as number[] }],
      chart: {
        type: 'radar',
        height: 480,
        width: '100%',
        toolbar: { show: false },
        foreColor: '#394250',
      },
      labels: [],
      fill: { opacity: 0.3, colors: ['#FF4560'] },
      stroke: { width: 2, colors: ['#FF4560'] },
      markers: { size: 4, colors: ['#FF4560'], strokeColors: '#ffffff' },
      dataLabels: { enabled: true, style: { colors: ['#394250'] } },
      plotOptions: { radar: { size: 120, polygons: basePolygon } },
      yaxis: { labels: { style: { colors: '#394250' } } },
      xaxis: { labels: { style: { colors: '#394250' } } },
      tooltip: {
        ...baseTooltip(() => this.fullLabelsSub),
        custom: ({ series, seriesIndex, dataPointIndex }: any) => {
          const label = this.fullLabelsSub[dataPointIndex];
          const value = series[seriesIndex][dataPointIndex];
          return `<div style="padding:8px 12px; background:#333; color:#fff; border-radius:6px;">
            <div style="font-weight:600; margin-bottom:4px;">${label}</div>
            <hr style="border-color:#555; margin:4px 0;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="width:10px; height:10px; border-radius:50%; background:#FF4560; display:inline-block;"></span>
              <span>จำนวน: ${value}</span>
            </div>
          </div>`;
        },
      },
    };
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
        title: 'กราฟสรุปจำนวนผลงานตีพิมพ์',
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
      series: [{ name: 'จำนวนผลงาน', data: data.map((d) => d.count) }],
      annotations: { points: [] },
      chart: {
        type: 'bar',
        height: 500,
        stacked: false,
        animations: { enabled: false },
        zoom: { enabled: false },
        toolbar: { show: true },
      },
      plotOptions: {
        bar: {
          columnWidth: '50%',
          borderRadius: 2,
          borderRadiusApplication: 'around',
        } as any,
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: data.map((d) => d.label),
        tickPlacement: 'on',
        axisBorder: { show: true, color: '#000', height: 1 },
        labels: { rotate: -45, style: { fontSize: '12px' } },
        axisTicks: { show: true, color: '#000' },
      },
      tooltip: {
        theme: 'dark',
        custom: ({ series, seriesIndex, dataPointIndex }: any) => {
          const fullLabel = data[dataPointIndex]?.label_full ?? '';
          const value = series[seriesIndex][dataPointIndex];
          return `<div style="padding:8px 12px; background:#333; color:#fff; border-radius:6px;">
            <div style="font-weight:600; margin-bottom:4px;">${fullLabel}</div>
            <hr style="border-color:#555; margin:4px 0;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="width:10px; height:10px; border-radius:50%; background:#f48c06; display:inline-block;"></span>
              <span>จำนวน: ${value}</span>
            </div>
          </div>`;
        },
      },
      yaxis: {
        title: { text: 'จำนวน' },
        min: 0,
        max: Math.max(...data.map((d) => d.count)),
        tickAmount: 4,
        axisBorder: { show: true, color: '#000' },
        axisTicks: { show: true, color: '#000' },
      },
      stroke: { width: 1 },
      fill: {
        colors: ['#f48c06'],
        opacity: 1,
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'horizontal',
          shadeIntensity: 0.25,
          inverseColors: true,
          opacityFrom: 0.85,
          opacityTo: 0.85,
          stops: [50, 0, 100],
        },
      },
      grid: {
        show: true,
        borderColor: '#bdbdbd',
        position: 'back',
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } },
        row: { colors: ['#f3f3f3', 'transparent'], opacity: 0.5 },
        column: { colors: ['#f3f3f3', 'transparent'], opacity: 0.5 },
      },
    };
  }

  initChartsOECD(): void {
    const raw = this.dashboardData?.radar.child?.raw || [];
    const mappedData = raw.map((item) => ({
      label: item.name,
      count: item[this.selectedTab] ?? 0,
    }));

    this.chartsOECD = [
      {
        type: this.selectedTab.toLowerCase() as ReportType,
        title: 'กราฟสรุปตาม OECD (สาขาย่อย)',
        subtitle: 'จำแนกตามประเภทผลงาน',
        options: this.createBarChartOECD(mappedData),
      },
    ];
  }

  private createBarChartOECD(
    data: { label: string; count: number }[]
  ): ChartOptions {
    const shortLabels = data.map((d) => this.truncateText(d.label, 8));
    const maxValue = Math.max(...data.map((d) => d.count), 10);

    return {
      colors: ['#06E396'],
      series: [{ name: 'จำนวนผลงาน', data: data.map((d) => d.count) }],
      annotations: { points: [] },
      chart: {
        type: 'bar',
        height: 500,
        stacked: false,
        animations: { enabled: false },
        zoom: { enabled: false },
        toolbar: { show: true },
      },
      plotOptions: {
        bar: {
          columnWidth: '40%',
          borderRadius: 2,
          borderRadiusApplication: 'around',
        } as any,
      },
      dataLabels: { enabled: false },
      xaxis: {
        categories: shortLabels,
        tickPlacement: 'on',
        labels: {
          rotate: -45,
          hideOverlappingLabels: true,
          trim: true,
          style: { fontSize: '11px' },
        },
      },
      tooltip: {
        custom: ({ series, seriesIndex, dataPointIndex }: any) => {
          const fullLabel = data[dataPointIndex]?.label ?? '';
          const value = series[seriesIndex][dataPointIndex];
          return `<div style="padding:10px 14px; background:#fff; color:#333; border-radius:6px; border:1px solid #e0e0e0; box-shadow:0 2px 8px rgba(0,0,0,0.15);">
            <div style="font-weight:600; margin-bottom:6px;">${fullLabel}</div>
            <hr style="border-color:#eee; margin:4px 0;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="width:10px; height:10px; border-radius:50%; background:#f2ae30; display:inline-block;"></span>
              <span>จำนวนผลงาน: <strong>${value}</strong></span>
            </div>
          </div>`;
        },
      },
      yaxis: {
        title: { text: 'จำนวน' },
        min: 0,
        max: maxValue,
        tickAmount: 4,
        axisBorder: { show: true, color: '#000' },
        axisTicks: { show: true, color: '#000' },
      },
      stroke: { width: 1 },
      fill: {
        colors: ['#f2ae30'],
        opacity: 1,
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'horizontal',
          shadeIntensity: 0.4,
          inverseColors: true,
          opacityFrom: 1,
          opacityTo: 1,
          stops: [50, 0, 100],
        },
      },
      grid: {
        show: true,
        borderColor: '#bdbdbd',
        position: 'back',
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: true } },
        row: { colors: ['#f3f3f3', 'transparent'], opacity: 0.5 },
        column: { colors: ['#f3f3f3', 'transparent'], opacity: 0.5 },
      },
    };
  }

  changeTabForChart(tab: ResearchType): void {
    this.selectedTab = tab;
    const tabIndex = tab === 'PROJECT' ? 0 : tab === 'ARTICLE' ? 1 : 2;

    // ===== RADAR หลัก =====
    const majorLabels = this.dashboardData?.radar.major.labels || [];
    const majorValues =
      this.dashboardData?.radar.major.datasets[tabIndex]?.data || [];
    this.fullLabels = majorLabels;
    this.radarChartOptions.labels = majorLabels.map((l) => this.shortLabel(l));
    this.radarChartOptions.series = [
      { name: 'จำนวนงานวิจัย', data: majorValues as number[] },
    ];

    // ===== RADAR ย่อย =====
    const subLabels = this.dashboardData?.radar.sub.labels || [];
    const subValues =
      this.dashboardData?.radar.sub.datasets[tabIndex]?.data || [];
    this.fullLabelsSub = subLabels;
    this.radarChartOptionsSub.labels = subLabels.map((l) => this.shortLabel(l));
    this.radarChartOptionsSub.series = [
      { name: 'จำนวนงานวิจัย', data: subValues as number[] },
    ];

    // ===== PIE (ngx-charts) =====
    const ford = this.dashboardData?.ford || {
      project: [],
      article: [],
      innovation: [],
    };
    const dataFord =
      tab === 'PROJECT'
        ? ford.project
        : tab === 'ARTICLE'
        ? ford.article
        : ford.innovation;

    this.loading = true;
    setTimeout(() => {
      this.single = dataFord.map((item) => ({
        name: item.name,
        value: item.count,
        extra: { percent: item.percent },
      }));
      this.initChartsOECD();
      this.loading = false;
    }, 0);

    this.hasData = dataFord.reduce((sum, item) => sum + item.count, 0) > 0;
  }

  // ── Navigation ──────────────────────────────────────────────
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
  goToNewsDetail(id: number) {
    this.router.navigate(['/news', id]);
  }
  goToAllNews() {
    this.router.navigate(['/news']);
  }
  SeeMoreDetails(type: ReportType) {
    this.router.navigate(['/performance-by-departmaent', type]);
  }

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

  // ── Tab / Pagination ─────────────────────────────────────────
  changeTab(tab: ResearchType): void {
    this.selectedTab = tab;
    this.searchText = '';
    this.currentPage = 1;
    const key = this.mapResearchTypeToKey(tab);
    this.filteredResearch = [...this.publications[key]];
    this.updatePagination();
  }

  onSearch() {
    const keyword = this.searchText.toLowerCase().trim();
    const key = this.mapResearchTypeToKey(this.selectedTab);
    this.filteredResearch = this.publications[key].filter(
      (p) =>
        p.title_th.toLowerCase().includes(keyword) ||
        (p.title_en?.toLowerCase().includes(keyword) ?? false) ||
        p.year.toString().includes(keyword) ||
        p.research_code.toLowerCase().includes(keyword) ||
        p.funding.source_funds.toLowerCase().includes(keyword) ||
        p.own.some((owner) => owner.full_name.toLowerCase().includes(keyword))
    );
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginatedPublications = this.filteredResearch.slice(
      start,
      start + this.pageSize
    );
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

  get visiblePages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

    const pages: (number | string)[] = [1];
    if (current > 3) pages.push('...');
    for (
      let i = Math.max(2, current - 1);
      i <= Math.min(total - 1, current + 1);
      i++
    )
      pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
  }

  // ── Helpers ──────────────────────────────────────────────────
  private mapResearchTypeToKey(type: ResearchType): keyof ResearchSection {
    return type === 'PROJECT'
      ? 'projects'
      : type === 'ARTICLE'
      ? 'articles'
      : 'innovations';
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

  shortLabel(fullLabel: string, maxLength = 12): string {
    return fullLabel.length > maxLength
      ? fullLabel.slice(0, maxLength) + '...'
      : fullLabel;
  }

  truncateText(text: string, maxLength = 6): string {
    if (!text) return '';
    return text.length > maxLength
      ? text.substring(0, maxLength) + '...'
      : text;
  }

  formatThaiDate(date: Date): string {
    const d = new Date(date);
    return `${d.getDate()} ${d.toLocaleDateString('th-TH', {
      month: 'long',
    })} ${d.getFullYear() + 543}`;
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

  sweet() {
    Swal.fire({
      icon: 'success',
      title: 'Your work has been saved',
      showConfirmButton: false,
      timer: 1500,
    });
  }
}
