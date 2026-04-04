import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { Address } from '../../models/data-performance.model';
import {
  ChartComponent,
  ApexChart,
  ApexLegend,
  ApexDataLabels,
  ApexAxisChartSeries,
  ApexPlotOptions,
  ApexYAxis,
  ApexStroke,
  ApexXAxis,
  ApexFill,
  ApexTooltip,
  ApexMarkers,
} from 'ng-apexcharts';
import { ProfileService } from '../../services/profile.service';
import { BarSummary, UserProfile } from '../../models/profiledetai.model';
import { ResearchItem } from '../../models/profile-project.model';
import { EducationService } from '../../services/education.service';
import { EducationInfo } from '../../models/education.model';
import { MainComponent } from '../../shared/layouts/main/main.component';
import { Color, LegendPosition, ScaleType } from '@swimlane/ngx-charts';

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

type ResearchTab = 'project' | 'article' | 'innovation';

@Component({
  selector: 'app-user-profile',
  standalone: false,
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;

  profileData?: UserProfile;
  researchList: ResearchItem[] = [];
  originalData: ResearchItem[] = [];

  /* ===== Charts ===== */
  barChartOptions!: Partial<BarChartOptions>;
  radarChartOptions!: Partial<RadarChartOptions>;
  radarChartOptionsSub!: Partial<RadarChartOptions>;

  /* ===== Table ===== */
  selectedTab: ResearchTab = 'project';
  pageSize = 10;
  currentPage = 1;
  searchText = '';

  address: Address = {};

  isPersonalOpen = true;
  isWorkOpen = false;
  isEducation = false;
  isTraining = false;

  currentUserId!: number;
  profileUserId!: number;

  userId!: string | null;
  isModalOpen = false;
  isEditMode = false;
  openDropdown: string | null = null;

  barSummary: BarSummary[] = [];
  radarData: any;
  researchData: any;

  previewUrl: string | ArrayBuffer | null = null;
  selectedFile: File | null = null;

  educationData: EducationInfo = {
    highest_education: '',
    field_of_study: '',
    qualification: '',
    gpa: '',
    institution: '',
    date_enrollment: '',
    date_graduation: '',
  };

  education: string[] = [
    'ต่ำกว่าประถมศึกษา',
    'ประถมศึกษา',
    'มัธยมศึกษาตอนต้น',
    'มัธยมศึกษาตอนปลาย',
    'ประกาศนียบัตรวิชาชีพ (ปวช.)',
    'ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)',
    'อนุปริญญา',
    'ปริญญาตรี',
    'ประกาศนียบัตรบัณฑิต',
    'ประกาศนียบัตรบัณฑิตชั้นสูง',
    'ปริญญาโท',
    'ปริญญาเอก',
    'หลังปริญญาเอก (Postdoctoral)',
  ];

  majors: string[] = [
    'วิทยาการคอมพิวเตอร์',
    'เทคโนโลยีสารสนเทศ',
    'วิศวกรรมคอมพิวเตอร์',
    'วิศวกรรมซอฟต์แวร์',
    'ปัญญาประดิษฐ์และวิทยาการข้อมูล',
    'ระบบสารสนเทศ',
    'คณิตศาสตร์',
    'สถิติ',
    'ฟิสิกส์',
    'เคมี',
    'ชีววิทยา',
    'เทคโนโลยีชีวภาพ',
    'วิทยาศาสตร์สิ่งแวดล้อม',
    'วิศวกรรมไฟฟ้า',
    'วิศวกรรมเครื่องกล',
    'วิศวกรรมโยธา',
    'บริหารธุรกิจ',
    'การจัดการ',
    'เศรษฐศาสตร์',
    'บัญชี',
    'รัฐศาสตร์',
    'นิติศาสตร์',
    'ศึกษาศาสตร์',
    'ครุศาสตร์',
    'แพทยศาสตร์',
    'พยาบาลศาสตร์',
    'สาธารณสุขศาสตร์',
    'เภสัชศาสตร์',
    'สัตวแพทยศาสตร์',
    'ศิลปศาสตร์',
    'มนุษยศาสตร์',
    'สังคมศาสตร์',
  ];

  qualifications: string[] = [
    'วุฒิการศึกษาทั่วไป',
    'วุฒิวิชาชีพ',
    'วุฒิครู',
    'วุฒิวิศวกร',
    'วุฒิวิชาชีพเฉพาะทาง',
    'วุฒิทางการแพทย์',
    'วุฒิทางการพยาบาล',
    'วุฒิทางกฎหมาย',
    'วุฒิวิชาการ',
    'วุฒิวิจัย',
    'วุฒิผู้เชี่ยวชาญ',
    'วุฒิหลังปริญญา',
    'วุฒิบัตร (Certificate)',
    'วุฒิบัตรวิชาชีพ (Professional Certificate)',
  ];

  searchEducationLevel = '';
  searchMajors = '';
  searchQualifications = '';
  searchInstitutions = '';

  totalItems = 0;
  filteredData: ResearchItem[] = [];
  paginationData: ResearchItem[] = [];
  fullLabels: string[] = [];
  fullLabelsSub: string[] = [];
  donutSummary: any;

  chartView: [number, number] = [300, 300];

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
    { key: 'project', label: 'โครงการวิจัย', icon: 'bi-journal-text' },
    { key: 'article', label: 'ผลงานตีพิมพ์', icon: 'bi-file-earmark-text' },
    { key: 'innovation', label: 'นวัตกรรมสิ่งประดิษฐ์', icon: 'bi-award' },
  ];

  constructor(
    private router: Router,
    private authService: AuthService,
    private service: ProfileService,
    private serviceEducation: EducationService
  ) {
    this.initCharts();
  }

  ngOnInit(): void {
    this.setChartView();
    MainComponent.showLoading();
    Promise.all([
      this.loadData(),
      this.loadEducation(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => MainComponent.hideLoading());
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
      chart: { type: 'bar', height: 300 },
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
        custom: ({ series, seriesIndex, dataPointIndex }: any) => {
          const label = this.fullLabels[dataPointIndex];
          const value = series[seriesIndex][dataPointIndex];
          return this.tooltipTemplate(label, value, '#038FFB');
        },
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
        custom: ({ series, seriesIndex, dataPointIndex }: any) => {
          const label = this.fullLabelsSub[dataPointIndex];
          const value = series[seriesIndex][dataPointIndex];
          return this.tooltipTemplate(label, value, '#FF4560');
        },
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

  loadData(): void {
    this.service.getProfile().subscribe({
      next: (res) => {
        this.profileData = res.data.user;
        this.barSummary = res.data.bar;
        this.donutSummary = res.data.donut;
        this.radarData = res.data.radar;
        this.researchData = res.data.researchs;
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onPageSizeChange() {
    this.currentPage = 1;
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

  // ── Navigation ──────────────────────────────────────────────
  goToEditProfile() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }
    this.router.navigate([
      this.authService.isAdmin() ? '/admin/edit-profile' : '/user/edit-profile',
    ]);
  }

  goToEditWork() {
    this.router.navigate([
      this.authService.isAdmin() ? '/admin/edit-work' : '/user/edit-work',
    ]);
  }

  goToEditStudy() {
    this.router.navigate([
      this.authService.isAdmin() ? '/admin/edit-study' : '/user/edit-study',
    ]);
  }

  goToEditTraning() {
    this.router.navigate([
      this.authService.isAdmin() ? '/admin/edit-traning' : '/user/edit-traning',
    ]);
  }

  goToEditAddress() {
    this.router.navigate([
      this.authService.isAdmin() ? '/admin/edit-address' : '/user/edit-address',
    ]);
  }

  viewItem(id: number) {
    this.router.navigate(['/performance', this.selectedTab, id]);
  }

  editItem(id: number) {
    const base = this.authService.isAdmin() ? '/admin' : '/user';
    const route =
      this.selectedTab === 'project'
        ? `${base}/edit-research/${id}`
        : this.selectedTab === 'article'
        ? `${base}/edit-aticle/${id}`
        : `${base}/edit-innovation/${id}`;
    this.router.navigateByUrl(route);
  }

  gotoEditStudy() {
    this.router.navigate(['/user/edit-study']);
  }

  // ── Education ────────────────────────────────────────────────
  loadEducation() {
    this.serviceEducation.getEducation().subscribe({
      next: (res) => {
        this.educationData = res.data.education_info;
      },
      error: (err) => console.error(err),
    });
  }

  save() {
    Swal.fire({
      icon: 'question',
      title: 'ยืนยันการบันทึกข้อมูล',
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.service.updateEducation(this.buildEducationPayload()).subscribe({
        next: () => this.handleSaveSuccess(),
        error: () => Swal.fire('ผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error'),
      });
    });
  }

  openEditModal(data: EducationInfo) {
    this.isEditMode = true;
    this.educationData = { ...data };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.loadEducation();
  }

  private handleSaveSuccess() {
    Swal.fire({
      icon: 'success',
      title: this.isEditMode ? 'แก้ไขสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ',
      timer: 1500,
      showConfirmButton: false,
    }).then(() => {
      this.isModalOpen = false;
      window.location.reload();
      this.resetForm();
    });
  }

  private resetForm() {
    this.educationData = {
      highest_education: '',
      field_of_study: '',
      qualification: '',
      gpa: '',
      institution: '',
      date_enrollment: '',
      date_graduation: '',
    };
    this.searchEducationLevel = '';
    this.searchMajors = '';
    this.searchQualifications = '';
    this.searchInstitutions = '';
  }

  private buildEducationPayload(): Record<string, any> {
    const p = this.educationData;
    return {
      ...(p.highest_education && { highest_education: p.highest_education }),
      ...(p.field_of_study && { field_of_study: p.field_of_study }),
      ...(p.qualification && { qualification: p.qualification }),
      ...(p.gpa && { gpa: p.gpa }),
      ...(p.institution && { institution: p.institution }),
      ...(p.date_enrollment && { date_enrollment: p.date_enrollment }),
      ...(p.date_graduation && { date_graduation: p.date_graduation }),
    };
  }

  // ── Dropdown ─────────────────────────────────────────────────
  @HostListener('document:click')
  closeAll() {
    this.openDropdown = null;
  }

  toggle(el: string, event: MouseEvent) {
    event.stopPropagation();
    this.openDropdown = this.openDropdown === el ? null : el;
  }
  isOpen(e: string) {
    return this.openDropdown === e;
  }
  selectEducationLevel(e: string) {
    this.educationData.highest_education = e;
    this.searchEducationLevel = '';
    this.openDropdown = null;
  }
  selectMajor(m: string) {
    this.educationData.field_of_study = m;
    this.searchMajors = '';
    this.openDropdown = null;
  }
  selectQualification(q: string) {
    this.educationData.qualification = q;
    this.searchQualifications = '';
    this.openDropdown = null;
  }

  filteredEducationLevel() {
    return this.education.filter((e) => e.includes(this.searchEducationLevel));
  }
  filteredMajor() {
    return this.majors.filter((m) => m.includes(this.searchMajors));
  }
  filteredQualification() {
    return this.qualifications.filter((q) =>
      q.includes(this.searchQualifications)
    );
  }

  // ── Avatar ───────────────────────────────────────────────────
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    this.selectedFile = file;
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result;
    };
    reader.readAsDataURL(file);
  }

  saveAvatar() {
    if (!this.selectedFile) return;
    Swal.fire({
      title: 'กำลังอัปโหลด...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    this.service.updateAvatar(this.selectedFile).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'อัปโหลดสำเร็จ',
          showConfirmButton: false,
          timer: 1200,
        }).then(() => window.location.reload());
        this.profileData!.avatar_url = res.avatar_url;
        this.previewUrl = null;
        this.selectedFile = null;
      },
    });
  }

  cancelAvatar() {
    this.previewUrl = null;
    this.selectedFile = null;
  }

  // ── Helpers ──────────────────────────────────────────────────
  shortLabel(fullLabel: string, maxLength = 12): string {
    return fullLabel.length > maxLength
      ? fullLabel.slice(0, maxLength) + '...'
      : fullLabel;
  }

  hasAddressData(): boolean {
    return !!(
      this.address?.houseNo ||
      this.address?.alley ||
      this.address?.road ||
      this.address?.subDistrict ||
      this.address?.district ||
      this.address?.province ||
      this.address?.phone
    );
  }

  formatThaiDate(date: string): string {
    if (!date) return '';
    const d = new Date(date);
    let year = d.getFullYear();
    if (year < 2500) year += 543;
    return `${d.getDate()}/${d.getMonth() + 1}/${year}`;
  }

  deleteProject(id: number) {
    Swal.fire({
      title: 'ต้องการลบข้อมูลใช่ไหม?',
      text: 'ข้อมูลจะไม่สามารถกู้คืนได้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่',
      cancelButtonText: 'ไม่',
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.service.deleteProject(id).subscribe({
        next: () => {
          this.loadData();
          Swal.fire({
            icon: 'success',
            title: 'ลบข้อมูลสำเร็จ',
            timer: 1500,
            showConfirmButton: false,
          });
        },
        error: (err) => {
          Swal.fire(
            'ผิดพลาด',
            err.error?.message || 'ไม่สามารถลบข้อมูลได้',
            'error'
          );
        },
      });
    });
  }

  @HostListener('window:resize')
  setChartView(): void {
    const w = window.innerWidth;
    if (w < 640) {
      this.chartView = [w - 40, 260];
    } else if (w < 1024) {
      this.chartView = [420, 320];
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
      <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
        <p style="font-size:1.5rem; font-weight:600; margin:0;">
          ${item.value} ผลงาน
        </p>
        <p style="color:#888; font-size:0.9rem; margin:0;">
          ${percent}%
        </p>
      </div>
    `,
      confirmButtonColor: '#f2cb05',
      confirmButtonText: 'ปิด',
      width: 300,
    });
  }
}
