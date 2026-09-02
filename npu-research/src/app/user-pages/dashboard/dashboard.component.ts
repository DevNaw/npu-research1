import { Component, HostListener, OnInit, ViewChild, NgZone } from '@angular/core';
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
  FacultyOverviewItem,
  FacultyOverviewResponse,
  FacultyOecdData,
  FacultyOecdItem,
  FacultyOecdResponse,
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

  // ── Skills Overview (OECD/FORD) radars ──────────────────────
  radarChartOptions!: Partial<RadarChartOptions>;
  radarChartOptionsSub!: Partial<RadarChartOptions>;
  fullLabels: string[] = [];
  fullLabelsSub: string[] = [];

  chartView: [number, number] = [300, 300];

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

  // ngx-charts (FORD pie)
  single: { name: string; value: number; extra: { percent: number } }[] = [];
  legendPosition: LegendPosition = LegendPosition.Below;
  hasData = false;

  otherMajor: { label: string; value: number } | null = null;
  otherSub: { label: string; value: number } | null = null;

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

  // ── Faculty overview (bar ซ้าย + radar ขวา) ──────────────────
  facultyTab: ReportType = 'project';
  facultyOverviewItems: FacultyOverviewItem[] = [];
  facultyOverviewTotal = 0;
  facultyBarChart!: ChartOptions;
  facultyRadarChart!: Partial<RadarChartOptions>;
  facultyFullLabels: string[] = [];
  hasFacultyData = false;

  // ── OECD ของคณะที่เลือก (radar ขวา) ─────────────────────────
  selectedFacultyOecd: FacultyOecdData | null = null;
  facultyOecdRadar!: Partial<RadarChartOptions>;
  facultyOecdFullLabels: string[] = [];
  hasFacultyOecd = false;
  loadingOecd = false;

  labelFormat = (name: string): string => {
    const item = this.single.find((d) => d.name === name);
    if (!item) return name;

    const total = this.single.reduce((sum, d) => sum + d.value, 0);
    const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';

    const isMobile = window.innerWidth < 640;
    const maxLen = isMobile ? 4 : 6;
    const shortName = name.length > maxLen ? name.slice(0, maxLen) + '…' : name;

    return `${shortName} ${percent}%`;
  };

  constructor(
    private router: Router,
    private service: DashboardService,
    private authService: AuthService,
    private zone: NgZone
  ) {
    this.initRadarCharts();
    this.initEmptyFacultyCharts();
  }

  ngOnInit(): void {
    this.setChartView();
    MainComponent.showLoading();
    Promise.all([
      this.loadDashboardData(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => MainComponent.hideLoading());

    this.updatePagination();
  }

  // ── Skills Overview radars init ──────────────────────────────
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
          this.initFacultyCharts();
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

  // ── Charts Overview (bar ตามหน่วยงาน) ────────────────────────
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

  // ── Top 10 OECD (bar) ────────────────────────────────────────
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

  // ── Skills Overview tab (radar major/sub + FORD pie + top10) ─
  changeTabForChart(tab: ResearchType): void {
    this.selectedTab = tab;
    const tabIndex = tab === 'PROJECT' ? 0 : tab === 'ARTICLE' ? 1 : 2;

    // RADAR หลัก — กรอง "อื่นๆ" ออก
    const majorLabels = this.dashboardData?.radar.major.labels || [];
    const majorValues = (this.dashboardData?.radar.major.datasets[tabIndex]
      ?.data ?? []) as number[];

    const majorPairs = majorLabels.map((label, i) => ({
      label,
      value: majorValues[i] ?? 0,
    }));

    const majorFiltered = majorPairs.filter((p) => p.label.trim() !== 'อื่นๆ');
    this.otherMajor =
      majorPairs.find((p) => p.label.trim() === 'อื่นๆ') ?? null;

    this.fullLabels = majorFiltered.map((p) => p.label);
    this.radarChartOptions = {
      ...this.radarChartOptions,
      labels: majorFiltered.map((p) => this.shortLabel(p.label)),
      series: [
        { name: 'จำนวนงานวิจัย', data: majorFiltered.map((p) => p.value) },
      ],
    };

    // RADAR ย่อย — กรอง "อื่นๆ" ออก
    const subLabels = this.dashboardData?.radar.sub.labels || [];
    const subValues =
      this.dashboardData?.radar.sub.datasets[tabIndex]?.data || [];

    const subPairs = subLabels.map((label, i) => ({
      label,
      value: (subValues as number[])[i] ?? 0,
    }));

    const subFiltered = subPairs.filter((p) => p.label.trim() !== 'อื่นๆ');
    this.otherSub = subPairs.find((p) => p.label.trim() === 'อื่นๆ') ?? null;

    this.fullLabelsSub = subFiltered.map((p) => p.label);
    this.radarChartOptionsSub = {
      ...this.radarChartOptionsSub,
      labels: subFiltered.map((p) => this.shortLabel(p.label)),
      series: [
        { name: 'จำนวนงานวิจัย', data: subFiltered.map((p) => p.value) },
      ],
    };

    // PIE (ngx-charts / FORD)
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

  // ── Navigation ───────────────────────────────────────────────
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

  routerToArticle() {
    this.router.navigate(['/aticle']);
  }
  routerToProject() {
    this.router.navigate(['/research']);
  }
  routerToInnovation() {
    this.router.navigate(['/innovation']);
  }
  routerToResearchers() {
    this.router.navigate(['/all-researcher']);
  }

  // ── Publications Table: tab / search / pagination ────────────
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

  @HostListener('window:resize')
  setChartView(): void {
    const w = window.innerWidth;
    if (w < 640) {
      this.chartView = [w - 120, 240];
    } else if (w < 1024) {
      this.chartView = [380, 300];
    } else {
      this.chartView = [0, 350];
    }
  }

  onChartSelect(event: any): void {
    const item = this.single.find((d) => d.name === event.name);
    if (!item) return;

    const total = this.single.reduce((sum, d) => sum + d.value, 0);
    const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';

    const colorMap: Record<string, string> = {
      โครงการวิจัย: '#038FFB',
      บทความ: '#06E396',
      นวัตกรรม: '#FEB119',
    };

    const color = colorMap[item.name] ?? '#394250';

    Swal.fire({
      title: item.name,
      html: `
        <div style="display:flex; flex-direction:column; align-items:center; gap:8px; padding:8px 0 4px;">
          <div style="display:flex; align-items:baseline; gap:6px;">
            <span style="font-size:2.2rem; font-weight:700; color:${color}; line-height:1;">${item.value}</span>
            <span style="font-size:1rem; font-weight:500; color:#555;">ผลงาน</span>
          </div>
          <div style="background:#f5f5f5; border-radius:20px; padding:3px 14px;">
            <span style="font-size:0.9rem; color:#888; font-weight:500;">${percent}%</span>
          </div>
        </div>
      `,
      confirmButtonColor: '#f2cb05',
      confirmButtonText: 'ปิด',
      width: 320,
      customClass: {
        title: 'swal-title-custom',
        confirmButton: 'swal-confirm-custom',
      },
    });
  }

  // ============================================================
  // Faculty overview (bar ซ้าย + radar ขวา + OECD ของคณะ)
  // ============================================================

  private toApiType(t: ReportType): 'PROJECT' | 'ARTICLE' | 'INNOVATION' {
    return t === 'project'
      ? 'PROJECT'
      : t === 'article'
      ? 'ARTICLE'
      : 'INNOVATION';
  }

  /** ค่าเริ่มต้นกัน undefined ก่อน API กลับมา */
  private initEmptyFacultyCharts(): void {
    const empty = [{ label: '', label_full: '', count: 0 }];
    this.facultyBarChart = this.createFacultyBarChart(empty);
    this.facultyRadarChart = this.createFacultyRadarChart(empty);
  }

  /** เรียกครั้งเดียวหลังโหลด dashboardData */
  initFacultyCharts(): void {
    this.changeFacultyTab(this.facultyTab);
  }

  /** สลับ tab: ยิง API ภาพรวมคณะ + เคลียร์ OECD ที่เลือก */
  changeFacultyTab(type: ReportType): void {
    this.facultyTab = type;
    this.clearFacultyOecd();

    this.service.getFacultyBreakdown(this.toApiType(type)).subscribe({
      next: (res: FacultyOverviewResponse) => {
        if (res?.result === 1 && res?.data) {
          const items = [...(res.data.items ?? [])]
            .filter((d) => (d.count ?? 0) > 0)
            .sort((a, b) => b.count - a.count);

          this.facultyOverviewItems = items;
          this.facultyOverviewTotal = res.data.total ?? 0;

          const chartData = items.map((d) => ({
            label: d.faculty_short || d.faculty_name,
            label_full: d.faculty_name,
            count: d.count,
          }));

          this.hasFacultyData = chartData.length > 0;
          this.facultyBarChart = this.createFacultyBarChart(chartData);
          this.facultyRadarChart = this.createFacultyRadarChart(chartData);
        } else {
          this.hasFacultyData = false;
        }
      },
      error: (err) => {
        console.error('Faculty overview load error:', err);
        this.hasFacultyData = false;
      },
    });
  }

  getFacultyTotal(): number {
    return this.facultyOverviewTotal;
  }

  /** กราฟแท่งแนวนอน (ฝั่งซ้าย) — คลิกแท่งเพื่อโหลด OECD ของคณะ */
  private createFacultyBarChart(
    data: { label: string; count: number; label_full: string }[]
  ): ChartOptions {
    const height = Math.max(320, data.length * 42);

    return {
      colors: ['#F2CB05'],
      series: [{ name: 'จำนวนผลงาน', data: data.map((d) => d.count) }],
      annotations: { points: [] },
      chart: {
        type: 'bar',
        height,
        stacked: false,
        animations: { enabled: false },
        zoom: { enabled: false },
        toolbar: { show: true },
        events: {
          dataPointSelection: (_e: any, _ctx: any, cfg: any) => {
            const item = this.facultyOverviewItems[cfg.dataPointIndex];
            if (item) this.selectFacultyOecd(item);
          },
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '55%',
          borderRadius: 4,
          borderRadiusApplication: 'end',
          distributed: false,
        } as any,
      },
      dataLabels: {
        enabled: true,
        style: { fontSize: '12px', colors: ['#394250'] },
        offsetX: 24,
      },
      xaxis: {
        categories: data.map((d) => d.label_full || d.label),
        labels: { style: { fontSize: '12px' } },
        axisBorder: { show: true, color: '#000' },
        axisTicks: { show: true, color: '#000' },
      },
      yaxis: {
        labels: { style: { fontSize: '12px', colors: '#394250' } as any },
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
              <span style="width:10px; height:10px; border-radius:50%; background:#F2CB05; display:inline-block;"></span>
              <span>จำนวน: ${value}</span>
            </div>
          </div>`;
        },
      },
      stroke: { width: 1, colors: ['#e0b800'] },
      fill: {
        colors: ['#F2CB05'],
        opacity: 1,
        type: 'gradient',
        gradient: {
          shade: 'light',
          type: 'horizontal',
          shadeIntensity: 0.25,
          inverseColors: true,
          opacityFrom: 0.9,
          opacityTo: 0.9,
          stops: [0, 100],
        },
      },
      grid: {
        show: true,
        borderColor: '#e5e7eb',
        position: 'back',
        xaxis: { lines: { show: true } },
        yaxis: { lines: { show: false } },
      },
    };
  }

  /** เรดาร์เทียบสัดส่วนคณะ (ฝั่งขวา, Top 8) */
  private createFacultyRadarChart(
    data: { label: string; count: number; label_full: string }[]
  ): Partial<RadarChartOptions> {
    const top = data.slice(0, 8);
    this.facultyFullLabels = top.map((d) => d.label_full || d.label);

    return {
      series: [{ name: 'จำนวนผลงาน', data: top.map((d) => d.count) }],
      chart: {
        type: 'radar',
        height: 360,
        width: '100%',
        toolbar: { show: false },
        foreColor: '#394250',
      },
      labels: top.map((d) => this.shortLabel(d.label_full || d.label, 10)),
      fill: { opacity: 0.3, colors: ['#F2CB05'] },
      stroke: { width: 2, colors: ['#F2CB05'] },
      markers: { size: 4, colors: ['#F2CB05'], strokeColors: '#394250' },
      dataLabels: { enabled: true, style: { colors: ['#394250'] } },
      plotOptions: {
        radar: {
          size: 130,
          polygons: {
            strokeColors: '#e5e7eb',
            fill: { colors: ['transparent'] },
          },
        },
      },
      yaxis: { labels: { style: { colors: '#394250' } } },
      xaxis: { labels: { style: { colors: '#394250' } } },
      tooltip: {
        theme: 'dark',
        custom: ({ series, seriesIndex, dataPointIndex }: any) => {
          const label = this.facultyFullLabels[dataPointIndex];
          const value = series[seriesIndex][dataPointIndex];
          return `<div style="padding:8px 12px; background:#333; color:#fff; border-radius:6px;">
            <div style="font-weight:600; margin-bottom:4px;">${label}</div>
            <hr style="border-color:#555; margin:4px 0;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="width:10px; height:10px; border-radius:50%; background:#F2CB05; display:inline-block;"></span>
              <span>จำนวน: ${value}</span>
            </div>
          </div>`;
        },
      },
    };
  }

  /** คลิกแท่งคณะ (ฝั่งซ้าย) → โหลด OECD แล้วเปลี่ยน radar ฝั่งขวา */
  selectFacultyOecd(item: FacultyOverviewItem): void {
    // ครอบด้วย zone.run เพราะ event มาจาก ApexCharts (นอก Angular zone)
    this.zone.run(() => {
      this.loadingOecd = true;
      this.selectedFacultyOecd = null;

      this.service
        .getMajorBreakdown(item.organization_id, this.toApiType(this.facultyTab))
        .subscribe({
          next: (res: FacultyOecdResponse) => {
            if (res?.result === 1 && res?.data) {
              this.hasFacultyOecd = (res.data.radar?.items?.length ?? 0) > 0;
              this.buildFacultyOecdRadar(res.data);
              this.loadingOecd = false;
              // หน่วง 1 tick ให้ *ngIf ถอด spinner ก่อน แล้วค่อย mount radar ใหม่
              setTimeout(() => {
                this.selectedFacultyOecd = res.data;
              }, 0);
            } else {
              this.loadingOecd = false;
            }
          },
          error: (err) => {
            console.error('Faculty OECD load error:', err);
            this.loadingOecd = false;
          },
        });
    });
  }

  clearFacultyOecd(): void {
    this.selectedFacultyOecd = null;
    this.hasFacultyOecd = false;
    this.loadingOecd = false;
  }

  /** สร้าง radar OECD ของคณะ (ฝั่งขวา) */
  private buildFacultyOecdRadar(data: FacultyOecdData): void {
    const labels = data.radar?.labels ?? [];
    const values = data.radar?.data ?? [];
    this.facultyOecdFullLabels = [...labels];

    this.facultyOecdRadar = {
      series: [{ name: 'จำนวนผลงาน', data: [...values] }],
      chart: {
        type: 'radar',
        height: 360,
        width: '100%',
        toolbar: { show: false },
        foreColor: '#394250',
      },
      labels: labels.map((l) => this.shortLabel(l, 10)),
      fill: { opacity: 0.3, colors: ['#16498C'] },
      stroke: { width: 2, colors: ['#16498C'] },
      markers: { size: 4, colors: ['#16498C'], strokeColors: '#394250' },
      dataLabels: { enabled: true, style: { colors: ['#394250'] } },
      plotOptions: {
        radar: {
          size: 130,
          polygons: {
            strokeColors: '#e5e7eb',
            fill: { colors: ['transparent'] },
          },
        },
      },
      yaxis: { labels: { style: { colors: '#394250' } } },
      xaxis: { labels: { style: { colors: '#394250' } } },
      tooltip: {
        theme: 'dark',
        custom: ({ series, seriesIndex, dataPointIndex }: any) => {
          const label = this.facultyOecdFullLabels[dataPointIndex];
          const value = series[seriesIndex][dataPointIndex];
          return `<div style="padding:8px 12px; background:#333; color:#fff; border-radius:6px;">
            <div style="font-weight:600; margin-bottom:4px;">${label}</div>
            <hr style="border-color:#555; margin:4px 0;">
            <div style="display:flex; align-items:center; gap:6px;">
              <span style="width:10px; height:10px; border-radius:50%; background:#16498C; display:inline-block;"></span>
              <span>จำนวน: ${value}</span>
            </div>
          </div>`;
        },
      },
    };
  }
}