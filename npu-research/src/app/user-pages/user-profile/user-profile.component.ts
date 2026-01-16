import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import {
  DataPerformance,
  DataPerformanceItem,
  Address,
} from '../../models/data-performance.model';

@Component({
  selector: 'app-user-profile',
  standalone: false,
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css',
})
export class UserProfileComponent implements OnInit {
  trainings: any[] = []; // ถ้าไม่มีข้อมูล
  address: Address = {};
  isEditModalOpen = false;
  editData: any = {};

  pageSize = 10;
  currentPage = 1;
  searchText = '';
  selectedTab: keyof DataPerformance = 'research';

  data: DataPerformance = {
    research: [
      {
        id: 1,
        title: 'การศึกษาระบบการจัดการน้ำของชุมชนในภาคตะวันออกเฉียงเหนือ',
        date: '20 ก.ค. 2562 เวลา 20:09:43 น.',
      },
      {
        id: 2,
        title: 'การพัฒนาระบบสารสนเทศเพื่อบริหารจัดการงานวิจัยในสถาบันอุดมศึกษา',
        date: '12 ม.ค. 2563 เวลา 10:15:02 น.',
      },
      {
        id: 3,
        title:
          'การวิเคราะห์ผลกระทบของการเปลี่ยนแปลงสภาพภูมิอากาศต่อผลผลิตทางการเกษตร',
        date: '5 มี.ค. 2564 เวลา 14:42:10 น.',
      },
      {
        id: 4,
        title: 'การประยุกต์ใช้ปัญญาประดิษฐ์ในการพยากรณ์โรคพืช',
        date: '18 ส.ค. 2564 เวลา 09:30:55 น.',
      },
    ],

    article: [],

    innovation: [
      {
        id: 201,
        title: 'ระบบตรวจวัดคุณภาพน้ำอัจฉริยะด้วย IoT',
        date: '25 ก.ย. 2565 เวลา 13:45:09 น.',
      },
      {
        id: 202,
        title: 'แอปพลิเคชันติดตามสุขภาพสำหรับผู้สูงอายุ',
        date: '10 พ.ย. 2565 เวลา 17:22:18 น.',
      },
      {
        id: 203,
        title: 'แพลตฟอร์มบริหารจัดการพลังงานไฟฟ้าในอาคารอัจฉริยะ',
        date: '3 เม.ย. 2566 เวลา 09:10:47 น.',
      },
    ],
  };

  filteredData: DataPerformanceItem[] = [];
  paginationData: DataPerformanceItem[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.filteredData = [...this.data[this.selectedTab]];
    this.updatePagination();
  }

  onSearch(): void {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredData = this.data[this.selectedTab].filter(
      (item) =>
        item.title.toLowerCase().includes(keyword) ||
        item.date.toLowerCase().includes(keyword)
    );

    this.currentPage = 1;
    this.updatePagination();
  }

  editItem(id: number) {
    let route = '';
  
    switch (this.selectedTab) {
      case 'research':
        route = '/user-add-research';
        break;
  
      case 'article':
        route = '/user-add-article';
        break;
  
      case 'innovation':
        route = '/user-add-innovation';
        break;
    }
  
    this.router.navigate([route, id]);
  }
  

  deleteItem(id: number) {
    Swal.fire({
      title: 'ยืนยันการลบ',
      text: 'คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้ ?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'ลบข้อมูล',
      cancelButtonText: 'ยกเลิก',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        // 🔥 ลบจาก data หลัก
        this.data[this.selectedTab] = this.data[this.selectedTab].filter(
          (item) => item.id !== id
        );

        // 🔁 ลบจาก filteredData (กรณีมี search)
        this.filteredData = this.filteredData.filter((item) => item.id !== id);

        // ⚠️ ปรับ currentPage ถ้าลบจนหน้าว่าง
        const maxPage = Math.ceil(this.filteredData.length / this.pageSize);
        if (this.currentPage > maxPage && this.currentPage > 1) {
          this.currentPage--;
        }

        // 🔄 อัปเดต pagination
        this.updatePagination();

        // ✅ แจ้งผลลัพธ์
        Swal.fire({
          title: 'ลบสำเร็จ',
          text: 'ข้อมูลถูกลบเรียบร้อยแล้ว',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  }

  changeTab(tab: keyof DataPerformance): void {
    this.selectedTab = tab;
    this.searchText = '';
    this.currentPage = 1;

    this.filteredData = [...this.data[tab]];
    this.updatePagination();
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
    this.router.navigateByUrl('/user-edit-profile');
  }

  goToEditStudy() {
    this.router.navigateByUrl('/user-edit-study');
  }

  goToEditTraning() {
    this.router.navigateByUrl('/user-edit-traning');
  }

  goToEditAddress() {
    this.router.navigateByUrl('/user-edit-address');
  }

  viewItem(id: number) {
    this.router.navigate(['/performance', this.selectedTab, id]);
  }
  
}
