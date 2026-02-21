import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';
import {
  DataPerformance,
  DataPerformanceItem,
  Address,
} from '../../models/data-performance.model';
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
import { UserProfileInfo } from '../../models/profiledetai.model';

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

@Component({
  selector: 'app-user-profile',
  standalone: false,
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;

  profileData?: UserProfileInfo;

  /* ===== Charts ===== */
  pieChartOptions!: Partial<PieChartOptions>;
  barChartOptions!: Partial<BarChartOptions>;

  /* ===== Table ===== */
  selectedTab: keyof DataPerformance = 'research';
  pageSize = 10;
  currentPage = 1;
  searchText = '';

  trainings: any[] = []; // ถ้าไม่มีข้อมูล
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

  // ตัวอย่างเงื่อนไข
  isOwner = this.currentUserId === this.profileUserId;

  totalItems: number = 0;

  filteredData: DataPerformanceItem[] = [];
  paginationData: DataPerformanceItem[] = [];

  constructor(private router: Router, private authService: AuthService, private service: ProfileService) {
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
    this.loadData();
    // this.currentUserId = 1;
    // this.profileUserId = 1;

    // this.isOwner = this.currentUserId === this.profileUserId;

    // this.filteredData = [...this.data[this.selectedTab]];
    // this.updatePagination();
  }

  // ============= Load Data ==============
  loadData(): void {
    this.service.getProfile().subscribe({
      next: (res) => {
        this.profileData = res.data.user;
console.log(res);

      }
    })
  }

  onSearch(): void {
    // const keyword = this.searchText.toLowerCase().trim();

    // this.filteredData = this.data[this.selectedTab].filter(
    //   (item) =>
    //     item.title.toLowerCase().includes(keyword) ||
    //     item.date.toLowerCase().includes(keyword)
    // );

    // this.currentPage = 1;
    // this.updatePagination();
  }

  editItem(id: number) {
    const isAdmin = this.authService.isAdmin();

    let base = isAdmin ? '/admin' : '/user';
    let route = '';

    switch (this.selectedTab) {
      case 'research':
        route = `${base}/edit-research/${id}`;
        break;

      case 'article':
        route = `${base}/edit-aticle/${id}`;
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

  deleteItem(id: number) {
    // Swal.fire({
    //   title: 'ยืนยันการลบ',
    //   text: 'คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้ ?',
    //   icon: 'warning',
    //   showCancelButton: true,
    //   confirmButtonColor: '#ef4444',
    //   cancelButtonColor: '#6b7280',
    //   confirmButtonText: 'ลบข้อมูล',
    //   cancelButtonText: 'ยกเลิก',
    //   reverseButtons: true,
    // }).then((result) => {
    //   if (result.isConfirmed) {
    //     // 🔥 ลบจาก data หลัก
    //     // this.data[this.selectedTab] = this.data[this.selectedTab].filter(
    //     //   (item) => item.id !== id
    //     );

    //     // 🔁 ลบจาก filteredData (กรณีมี search)
    //     this.filteredData = this.filteredData.filter((item) => item.id !== id);

    //     // ⚠️ ปรับ currentPage ถ้าลบจนหน้าว่าง
    //     const maxPage = Math.ceil(this.filteredData.length / this.pageSize);
    //     if (this.currentPage > maxPage && this.currentPage > 1) {
    //       this.currentPage--;
    //     }

    //     // 🔄 อัปเดต pagination
    //     this.updatePagination();

    //     // ✅ แจ้งผลลัพธ์
    //     Swal.fire({
    //       title: 'ลบสำเร็จ',
    //       text: 'ข้อมูลถูกลบเรียบร้อยแล้ว',
    //       icon: 'success',
    //       timer: 1500,
    //       showConfirmButton: false,
    //     });
    //   }
    // });
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
      this.router.navigate(['/admin/edit-profile', user.id]);
    } else {
      this.router.navigate(['/user/edit-profile', user.id]);
    }
  }

  goToEditWork() {
    const user = this.authService.getUserFromStorage();
    if (!user) return;

    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin/edit-work', user.id]);
    } else {
      this.router.navigate(['/user/edit-work', user.id]);
    }
  }

  goToEditStudy() {
    const user = this.authService.getUserFromStorage();
    if (!user) return;

    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin/edit-study', user.id]);
    } else {
      this.router.navigate(['/user/edit-study', user.id]);
    }
  }

  goToEditTraning() {
    const user = this.authService.getUserFromStorage();
    if (!user) return;

    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin/edit-traning', user.id]);
    } else {
      this.router.navigate(['/user/edit-traning', user.id]);
    }
  }

  goToEditAddress() {
    const user = this.authService.getUserFromStorage();

    if (!user) return;

    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin/edit-address', user.id]);
    } else {
      this.router.navigate(['/user/edit-address', user.id]);
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
    this.currentPage = 1; // reset กลับหน้าแรก
    this.updatePagination();
  }

  changeTab(tab: keyof DataPerformance): void {
    this.selectedTab = tab;
    this.searchText = '';
    this.currentPage = 1;
    // this.filteredData = [...this.data[tab]];
    this.updatePagination();
  }
}
