import { Component, OnInit, ViewChild } from '@angular/core';
import {
  BarSummary,
  ResearchItem,
  ResearchProfileData,
} from '../../models/get-profile-by-id.model';
import { ProfileService } from '../../services/profile.service';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ApexChart,
  ApexLegend,
  ApexDataLabels,
  ApexPlotOptions,
  ApexAxisChartSeries,
  ApexYAxis,
  ApexXAxis,
  ApexFill,
  ApexTooltip,
  ApexStroke,
  ChartComponent,
  ApexMarkers,
} from 'ng-apexcharts';
import { MainComponent } from '../../shared/layouts/main/main.component';
import { AuthService } from '../../services/auth.service';
import { Color, LegendPosition, ScaleType } from '@swimlane/ngx-charts';

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

export type BarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  fill: ApexFill;
  tooltip: ApexTooltip;
  stroke: ApexStroke;
  legend: ApexLegend;
};

type ResearchTab = 'project' | 'article' | 'innovation';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;

  fullLabels: string[] = [];
  fullLabelsSub: string[] = [];
  radarData: any;
  loading = false;

  profileDataById: ResearchProfileData | null = null;
  isPersonalOpen = true;
  isWorkOpen = false;
  isEducation = false;

  selectedTab: ResearchTab = 'project';
  searchText = '';
  paginationData: ResearchItem[] = [];
  currentPage = 1;
  pageSize = 10;

  researchData: any = { projects: [], articles: [], innovations: [] };

  /* ===== Charts ===== */
  radarChartOptions!: Partial<RadarChartOptions>;
  radarChartOptionsSub!: Partial<RadarChartOptions>;
  barChartOptions!: Partial<BarChartOptions>;
  barSummary: BarSummary[] = [];
  donutSummary: any;

  originalData: ResearchItem[] = [];
  filteredData: ResearchItem[] = [];
  totalItems = 0;

  // ===== ngx-charts =====
  single: { name: string; value: number }[] = [];
  legendPosition: LegendPosition = LegendPosition.Below;
  hasData = false;
  hasProjectData = false;
  hasArticleData = false;
  hasInnovationData = false;

  colorScheme: Color = {
    name: 'horizon',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#038FFB', '#06E396', '#FEB119'],
  };

  labelFormat = (name: string): string => {
    const item = this.single.find((d) => d.name === name);
    if (!item) return name;
    const total = this.single.reduce((sum, d) => sum + d.value, 0);
    const percent = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
    return `${name}\n${percent}%`;
  };

  tabs: { key: ResearchTab; label: string; icon: string }[] = [
    { key: 'project', label: 'งานวิจัย', icon: 'bi-journal-text' },
    { key: 'article', label: 'ผลงานตีพิมพ์', icon: 'bi-file-earmark-text' },
    { key: 'innovation', label: 'นวัตกรรมสิ่งประดิษฐ์', icon: 'bi-award' },
  ];

  constructor(
    private service: ProfileService,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {
    this.initCharts();
  }

  ngOnInit() {
    MainComponent.showLoading();
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loading = true;
        this.loadDataById(+id);
      }
      MainComponent.hideLoading();
    });
  }

  private initCharts(): void {
    const radarBase = {
      chart: {
        type: 'radar' as const,
        height: 300,
        width: '100%',
        toolbar: { show: false },
        foreColor: '#394250',
      },
      labels: [] as string[],
      fill: { opacity: 0.3 },
      dataLabels: { enabled: true, style: { colors: ['#394250'] } },
      plotOptions: {
        radar: {
          size: 120,
          polygons: {
            strokeColors: '#e5e7eb',
            fill: { colors: ['transparent'] },
          },
        },
      },
      yaxis: { labels: { style: { colors: '#394250' } } },
      xaxis: { labels: { style: { colors: '#394250' } } },
    };

    this.barChartOptions = {
      series: [
        { name: 'โครงการวิจัย', data: [] },
        { name: 'บทความ', data: [] },
        { name: 'นวัตกรรม', data: [] },
      ],
      chart: { type: 'bar', height: 200 },
      plotOptions: {
        bar: { horizontal: false, columnWidth: '55%', borderRadius: 6 },
      },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 2, colors: ['transparent'] },
      xaxis: { categories: [] },
      yaxis: { title: {} },
      fill: { opacity: 1 },
      tooltip: { y: { formatter: (val) => `${val} ผลงาน` } },
      legend: { show: true },
    };

    this.radarChartOptions = {
      ...radarBase,
      series: [{ name: 'จำนวนงานวิจัย', data: [] as number[] }],
      stroke: { width: 2, colors: ['#038FFB'] },
      markers: { size: 4, colors: ['#038FFB'], strokeColors: '#394250' },
      tooltip: {
        theme: 'dark',
        custom: ({ series, seriesIndex, dataPointIndex }: any) =>
          this.tooltipTemplate(
            this.fullLabels[dataPointIndex],
            series[seriesIndex][dataPointIndex],
            '#038FFB'
          ),
      },
    };

    this.radarChartOptionsSub = {
      ...radarBase,
      series: [
        { name: 'จำนวนงานวิจัย', data: [] as number[], color: '#FF4560' },
      ],
      fill: { opacity: 0.3, colors: ['#FF4560'] },
      stroke: { width: 2, colors: ['#FF4560'] },
      markers: { size: 4, colors: ['#FF4560'], strokeColors: '#ffffff' },
      tooltip: {
        theme: 'dark',
        custom: ({ series, seriesIndex, dataPointIndex }: any) =>
          this.tooltipTemplate(
            this.fullLabelsSub[dataPointIndex],
            series[seriesIndex][dataPointIndex],
            '#FF4560'
          ),
      },
    };
  }

  private tooltipTemplate(label: string, value: number, color: string): string {
    return `<div style="padding:8px 12px; background:#333; color:#fff; border-radius:6px;">
      <div style="font-weight:600; margin-bottom:4px;">${label}</div>
      <hr style="border-color:#555; margin:4px 0;">
      <div style="display:flex; align-items:center; gap:6px;">
        <span style="width:10px; height:10px; border-radius:50%; background:${color}; display:inline-block;"></span>
        <span>จำนวน: ${value}</span>
      </div>
    </div>`;
  }

  loadDataById(id: number) {
    this.service.getProfileById(id).subscribe({
      next: (res) => {
        this.profileDataById = res.data;
        this.barSummary = res.data.bar;
        this.donutSummary = res.data.donut;
        this.researchData = res.data.researchs;
        this.radarData = res.data.radar;
        this.loading = false;
        this.changeTab('project');
        this.updateCharts();
      },
      error: (err) => console.error(err),
    });
  }

  updateCharts(): void {
    if (!this.barSummary.length) return;

    const sorted = [...this.barSummary].sort((a, b) => a.year - b.year);
    const years = sorted.map((i) => i.year.toString());

    // ===== BAR =====
    this.barChartOptions = {
      ...this.barChartOptions,
      series: [
        { name: 'โครงการวิจัย', data: sorted.map((i) => i.project_count) },
        { name: 'บทความ', data: sorted.map((i) => i.article_count) },
        { name: 'นวัตกรรม', data: sorted.map((i) => i.innovation_count) },
      ],
      xaxis: { categories: years },
    };

    // ===== PIE (ngx-charts) =====
    this.single = [
      { name: 'โครงการวิจัย', value: this.donutSummary.projects_count },
      { name: 'บทความ', value: this.donutSummary.articles_count },
      { name: 'นวัตกรรม', value: this.donutSummary.innovations_count },
    ];

    const total = this.single.reduce((sum, d) => sum + d.value, 0);
    this.hasData = total > 0;
    this.hasProjectData = this.donutSummary.projects_count > 0;
    this.hasArticleData = this.donutSummary.articles_count > 0;
    this.hasInnovationData = this.donutSummary.innovations_count > 0;

    // ===== RADAR =====
    const tabIndex =
      this.selectedTab === 'project'
        ? 0
        : this.selectedTab === 'article'
        ? 1
        : 2;
    const tabLabel =
      this.tabs.find((t) => t.key === this.selectedTab)?.label || '';

    this.fullLabels = this.radarData?.major?.labels || [];
    this.fullLabelsSub = this.radarData?.sub?.labels || [];

    const labels = this.fullLabels.map((l: string) => this.shortLabel(l));
    const labelsSub = this.fullLabelsSub.map((l: string) => this.shortLabel(l));
    const values = [
      ...(this.radarData?.major?.datasets[tabIndex]?.data || []),
    ] as number[];
    const valuesSub = [
      ...(this.radarData?.sub?.datasets[tabIndex]?.data || []),
    ] as number[];

    this.radarChartOptions = {
      ...this.radarChartOptions,
      series: [{ name: tabLabel, data: values }],
      labels,
      xaxis: { categories: labels },
    };

    this.radarChartOptionsSub = {
      ...this.radarChartOptionsSub,
      series: [{ name: tabLabel, data: valuesSub }],
      labels: labelsSub,
      xaxis: { categories: labelsSub },
    };
  }

  // ── Tab / Pagination ─────────────────────────────────────────
  changeTab(tab: ResearchTab): void {
    this.selectedTab = tab;
    this.searchText = '';
    this.currentPage = 1;

    if (!this.researchData) return;

    this.originalData =
      tab === 'project'
        ? this.researchData.projects || []
        : tab === 'article'
        ? this.researchData.articles || []
        : this.researchData.innovations || [];

    this.filteredData = [...this.originalData];
    this.totalItems = this.filteredData.length;
    this.updateCharts();
    this.updatePagination();
  }

  onSearch(): void {
    const keyword = this.searchText.toLowerCase().trim();
    this.filteredData = !keyword
      ? [...this.originalData]
      : this.originalData.filter((item) =>
          item.title_th?.toLowerCase().includes(keyword)
        );
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    this.paginationData = this.filteredData.slice(start, start + this.pageSize);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.currentPage = page;
    this.updatePagination();
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.pageSize);
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
  viewItem(id: number) {
    if (this.authService.isLoggedIn()) {
      const base = this.authService.isAdmin()
        ? '/admin/performance-by-departmaent'
        : '/user/performance-by-departmaent';
      this.router.navigate([base, this.selectedTab, id]);
    } else {
      this.router.navigate(['/performance-public', this.selectedTab, id]);
    }
  }

  shortLabel(fullLabel: string, maxLength = 12): string {
    return fullLabel.length > maxLength
      ? fullLabel.slice(0, maxLength) + '...'
      : fullLabel;
  }
}
