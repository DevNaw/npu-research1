import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import { Address } from '../../models/data-performance.model';
import {
  ChartComponent,
  ApexChart,
  ApexResponsive,
  ApexNonAxisChartSeries,
  ApexLegend,
  ApexDataLabels,
  ApexAxisChartSeries,
  ApexPlotOptions,
  ApexYAxis,
  ApexStroke,
  ApexXAxis,
  ApexFill,
  ApexTooltip,
} from 'ng-apexcharts';
import { ProfileService } from '../../services/profile.service';
import { BarSummary, UserProfile } from '../../models/profiledetai.model';
import { ResearchItem } from '../../models/profile-project.model';
import { EducationService } from '../../services/education.service';
import { EducationInfo } from '../../models/education.model';
import { MainComponent } from '../../shared/layouts/main/main.component';

export type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  responsive: ApexResponsive[];
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
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
  pieChartOptions!: Partial<PieChartOptions>;
  barChartOptions!: Partial<BarChartOptions>;

  /* ===== Table ===== */
  selectedTab: ResearchTab = 'project';
  pageSize = 10;
  currentPage = 1;
  searchText = '';

  trainings: any[] = [];
  address: Address = {};
  isEditModalOpen = false;
  editData: any = {};

  isPersonalOpen = true;
  isWorkOpen = false;
  isEducation = false;
  isTraining = false;
  isAddress = false;

  currentUserId!: number;
  profileUserId!: number;

  selectedEducationLevel = '';
  selectedMajors = '';
  selectedQualifications = '';
  selectedCountries = '';

  searchEducationLevel = '';
  searchMajors = '';
  searchQualifications = '';
  searchInstitutions = '';
  searchCountries = '';

  userId!: string | null;
  isModalOpen = false;
  isEditMode = false;
  openDropdown: string | null = null;

  barSummary: BarSummary[] = [];
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

  // ตัวอย่างเงื่อนไข
  isOwner = this.currentUserId === this.profileUserId;

  totalItems: number = 0;

  filteredData: ResearchItem[] = [];
  paginationData: ResearchItem[] = [];

  constructor(
    private router: Router,
    private authService: AuthService,
    private service: ProfileService,
    private serviceEducation: EducationService
  ) {
    this.pieChartOptions = {
      series: [44, 55, 13],
      chart: {
        type: 'pie',
        width: 200,
      },
      labels: ['โครงการวิจัย', 'บทความ', 'นวัตกรรม'],
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: true,
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 250,
            },
            legend: {
              show: false,
            },
          },
        },
      ],
    };

    this.barChartOptions = {
      series: [
        {
          name: 'โครงการวิจัย',
          data: [4, 6, 10],
        },
        {
          name: 'บทความ',
          data: [6, 3, 1],
        },
        {
          name: 'นวัตกรรม',
          data: [3, 1, 6],
        },
      ],
      chart: {
        type: 'bar',
        height: 200,
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '55%',
          borderRadius: 6,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ['transparent'],
      },
      xaxis: {
        categories: ['2023', '2024', '2025'],
      },
      yaxis: {
        title: {},
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        y: {
          formatter: (val) => `$ ${val} thousands`,
        },
      },
      legend: {
        show: true,
      },
    };
  }

  ngOnInit(): void {
    MainComponent.showLoading();
    Promise.all([
      this.loadData(),
      this.loadEducation(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => MainComponent.hideLoading());
  }

  loadData(): void {
    this.service.getProfile().subscribe({
      next: (res) => {
        this.profileData = res.data.user;
        this.barSummary = res.data.bar;
        this.researchData = res.data.researchs;

        this.updateCharts();
        this.changeTab('project');
      },
      error: (err) => console.error(err),
    });
  }

  updateCharts(): void {
    if (!this.barSummary.length) return;

    const sorted = [...this.barSummary].sort((a, b) => a.year - b.year);

    const years = sorted.map((i) => i.year.toString());
    const projectData = sorted.map((i) => i.project_count);
    const articleData = sorted.map((i) => i.article_count);
    const innovationData = sorted.map((i) => i.innovation_count);

    // ===== BAR =====
    this.barChartOptions = {
      ...this.barChartOptions,
      series: [
        { name: 'โครงการวิจัย', data: projectData },
        { name: 'บทความ', data: articleData },
        { name: 'นวัตกรรม', data: innovationData },
      ],
      xaxis: { categories: years },
    };

    // ===== PIE (รวมทั้งหมดทุกปี) =====
    this.pieChartOptions = {
      ...this.pieChartOptions,
      series: [
        projectData.reduce((a, b) => a + b, 0),
        articleData.reduce((a, b) => a + b, 0),
        innovationData.reduce((a, b) => a + b, 0),
      ],
    };
  }

  onSearch(): void {
    const keyword = this.searchText.toLowerCase().trim();

    if (!keyword) {
      this.filteredData = [...this.originalData];
    } else {
      this.filteredData = this.originalData.filter((item) =>
        item.title_th?.toLowerCase().includes(keyword)
      );
    }

    this.currentPage = 1;
    this.updatePagination();
  }

  editItem(id: number) {
    const isAdmin = this.authService.isAdmin();

    const base = isAdmin ? '/admin' : '/user';
    let route = '';

    switch (this.selectedTab) {
      case 'project':
        route = `${base}/edit-research/${id}`;
        break;

      case 'article':
        route = `${base}/edit-article/${id}`;
        break;

      case 'innovation':
        route = `${base}/edit-innovation/${id}`;
        break;

      default:
        console.warn('Unknown tab:', this.selectedTab);
        return;
    }

    this.router.navigateByUrl(route);
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginationData = this.filteredData.slice(start, end);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    this.updatePagination();
  }

  get totalPages(): number {
    return Math.ceil(this.filteredData.length / this.pageSize);
  }

  goToEditProfile() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigateByUrl('/login');
      return;
    }

    const user = this.authService.getUserFromStorage();

    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin/edit-profile']);
    } else {
      this.router.navigate(['/user/edit-profile']);
    }
  }

  goToEditWork() {
    const user = this.authService.getUserFromStorage();
    if (!user) return;

    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin/edit-work']);
    } else {
      this.router.navigate(['/user/edit-work']);
    }
  }

  goToEditStudy() {
    const user = this.authService.getUserFromStorage();
    if (!user) return;

    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin/edit-study']);
    } else {
      this.router.navigate(['/user/edit-study']);
    }
  }

  goToEditTraning() {
    const user = this.authService.getUserFromStorage();
    if (!user) return;

    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin/edit-traning']);
    } else {
      this.router.navigate(['/user/edit-traning']);
    }
  }

  goToEditAddress() {
    const user = this.authService.getUserFromStorage();

    if (!user) return;

    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin/edit-address']);
    } else {
      this.router.navigate(['/user/edit-address']);
    }
  }

  viewItem(id: number) {
    this.router.navigate(['/performance', this.selectedTab, id]);
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

  onPageSizeChange() {
    this.currentPage = 1;
    this.updatePagination();
  }

  changeTab(tab: ResearchTab): void {
    this.selectedTab = tab;
    this.searchText = '';
    this.currentPage = 1;

    if (!this.researchData) return;

    if (tab === 'project') {
      this.originalData = this.researchData.projects || [];
    }

    if (tab === 'article') {
      this.originalData = this.researchData.articles || [];
    }

    if (tab === 'innovation') {
      this.originalData = this.researchData.innovations || [];
    }

    this.filteredData = [...this.originalData];
    this.totalItems = this.filteredData.length;

    this.updatePagination();
  }

  // Education
  save() {
    Swal.fire({
      icon: 'question',
      title: 'ยืนยันการบันทึกข้อมูล',
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (!result.isConfirmed) return;

      const payload = { ...this.educationData };
      const request$ = this.service.updateEducation(payload);

      request$.subscribe({
        next: () => {
          this.handleSaveSuccess();
        },
        error: () => Swal.fire('ผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error'),
      });
    });
  }

  loadEducation() {
    this.serviceEducation.getEducation().subscribe({
      next: (res) => {
        const data = res.data.education_info;
        if (data.date_graduation) {
          data.date_graduation = this.convertToISO(data.date_graduation);
        }

        if (data.date_enrollment) {
          data.date_enrollment = this.convertToISO(data.date_enrollment);
        }

        this.educationData = data;
      },
      error: (err) => console.error(err),
    });
  }

  openEditModal(data: EducationInfo) {
    this.isEditMode = true;
    this.educationData = { ...data };
    this.isModalOpen = true;
  }

  filteredQualification() {
    return this.qualifications.filter((q) =>
      q.includes(this.searchQualifications)
    );
  }

  @HostListener('document:click')
  closeAll() {
    this.openDropdown = null;
  }

  filteredEducationLevel() {
    return this.education.filter((e) => e.includes(this.searchEducationLevel));
  }

  filteredMajor() {
    return this.majors.filter((m) => m.includes(this.searchMajors));
  }

  toggle(el: string, event: MouseEvent) {
    event.stopPropagation();
    this.openDropdown = this.openDropdown === el ? null : el;
  }

  isOpen(e: string) {
    return this.openDropdown === e;
  }

  private handleSaveSuccess() {
    Swal.fire({
      icon: 'success',
      title: this.isEditMode ? 'แก้ไขสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ',
      timer: 1500,
      showConfirmButton: false,
    }).then(() => {
      this.isModalOpen = false;
      // this.loadEducation();
      window.location.reload();
      this.resetForm();
    });
  }
  resetForm() {
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

  closeModal() {
    this.isModalOpen = false;
    this.loadEducation();
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

  private convertToISO(thaiDate: string): string {
    if (!thaiDate) return '';

    const months: any = {
      มกราคม: '01',
      กุมภาพันธ์: '02',
      มีนาคม: '03',
      เมษายน: '04',
      พฤษภาคม: '05',
      มิถุนายน: '06',
      กรกฎาคม: '07',
      สิงหาคม: '08',
      กันยายน: '09',
      ตุลาคม: '10',
      พฤศจิกายน: '11',
      ธันวาคม: '12',
    };

    const parts = thaiDate.split(' ');
    const day = parts[0].padStart(2, '0');
    const month = months[parts[1]];
    const year = (parseInt(parts[2], 10) - 543).toString(); // แปลง พ.ศ. → ค.ศ.

    return `${year}-${month}-${day}`;
  }

  tabs: { key: ResearchTab; label: string; icon: string }[] = [
    { key: 'project', label: 'งานวิจัย', icon: 'bi-journal-text' },
    { key: 'article', label: 'บทความวิชาการ', icon: 'bi-file-earmark-text' },
    { key: 'innovation', label: 'นวัตกรรมสิ่งประดิษฐ์', icon: 'bi-award' },
  ];

  deleteProject(id: number) {
    Swal.fire({
      title: 'ต้องการลบข้อมูลใช่ไหม?',
      text: 'ข้อมูลจะไม่สามารถกู้้ต้องได้',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ใช่',
      cancelButtonText: 'ไม่',
    }).then((result) => {
      if (result.isConfirmed) {
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
          error: (err) => console.error(err),
        });
      }
    });
  }

  saveAvatar() {
    if (!this.selectedFile) return;

    this.service.updateAvatar(this.selectedFile).subscribe({
      next: (res) => {
        Swal.fire({
          icon: 'success',
          title: 'อัปโหลดสำเร็จ',
          showConfirmButton: false,
          timer: 1200,
        }).then(() => {
          window.location.reload();
        });
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
}
