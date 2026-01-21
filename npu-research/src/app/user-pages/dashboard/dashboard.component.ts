import { Component, OnInit } from '@angular/core';
import {
  ApexChart,
  ApexDataLabels,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexPlotOptions,
  ApexResponsive,
} from 'ng-apexcharts';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Router } from '@angular/router';
import {
  DataPerformance,
  DataPerformanceItem,
} from '../../models/dashboard.model';
import { registerLocaleData } from '@angular/common';
import localeTh from '@angular/common/locales/th';

export interface PieChartConfig {
  title: string;
  subtitle: string;
  series: ApexNonAxisChartSeries;
  labels: string[];
  chart: ApexChart;
  legend: ApexLegend;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  responsive: ApexResponsive[];
  colors: string[];
}

interface News {
  title: string;
  summary: string;
  imageUrl: string;
  link: string;
}

interface Publication {
  id: number;
  title: string;
  researchers: string;
  journal: string;
  publishDate: string;
  year: number;
}
registerLocaleData(localeTh);

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class UserDashboardComponent implements OnInit {
  
  today: Date = new Date();

  pageSize = 10;
  currentPage = 1;
  searchText = '';
  selectedTab: keyof DataPerformance = 'research';

  series: ApexNonAxisChartSeries = [
    18.2, 12.5, 10.8, 8.6, 7.4, 6.2, 5.5, 4.8, 4.1, 3.7, 3.2, 2.8, 2.4, 2.1,
    1.9, 1.6, 1.3, 1.1, 0.9, 0.8, 0.7,
  ];

  colors: string[] = [
    '#4C78A8', // น้ำเงิน
    '#72B7B2', // เขียวอมฟ้า
    '#F58518', // ส้ม
    '#E45756', // แดงหม่น
    '#54A24B', // เขียว
    '#B279A2', // ม่วงหม่น
    '#9C755F', // น้ำตาล
    '#BAB0AC', // เทา
    '#A0CBE8', // ฟ้าอ่อน
    '#FF9DA6', // ชมพูอ่อน

    '#1F77B4', // น้ำเงินเข้ม
    '#AEC7E8', // ฟ้าเทา
    '#2CA02C', // เขียวเข้ม
    '#98DF8A', // เขียวอ่อน
    '#FFBB78', // ส้มอ่อน
    '#C49C94', // น้ำตาลอ่อน
    '#9467BD', // ม่วง
    '#C5B0D5', // ม่วงอ่อน
    '#7F7F7F', // เทาเข้ม
    '#BCBD22', // เขียวเหลือง
    '#17BECF', // ฟ้าอมเขียว
    '#FF7F0E', // ส้มเข้ม
    '#FFBBE6', // ชมพูอ่อนมาก
  ];

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

  charts: PieChartConfig[] = [
    {
      title: 'กราฟสรุปจำนวนโครงการวิจัย จำแนกตามหน่วยงาน',
      subtitle: this.getLastUpdatedText(),
      series: this.series,
      labels: [
        'คณะเกษตรและเทคโนโลยี',
        'คณะครุศาสตร์',
        'คณะเทคโนโลยีอุตสาหกรรม',
        'คณะวิทยาการจัดการและเทคโนโลยีสารสนเทศ',
        'คณะวิทยาศาสตร์',
        'คณะวิศวกรรมศาสตร์',
        'คณะศิลปกรรมศาสตร์และวิทยาศาสตร์',
        'โรงเรียนสาธิตแห่งมหาวิทยาลัยนครพนม พนมพิทยพัฒน์',
        'วิทยาลัยการท่องเที่ยวและอุตสาหกรรมบริการ',
        'วิทยาลัยการบิน การศึกษา และวิจัยนานาชาติ',
        'วิทยาลัยเทคโนโลยีอุตสาหกรรมศรีสงคราม',
        'วิทยาลัยธาตุพนม',
        'วิทยาลัยนาหว้า',
        'วิทยาลัยพยาบาลบรมราชชนนีนครพนม',
        'ศูนย์การศึกษามหาวิทยาลัยนครพนม ณ กรุงเทพมหานคร',
        'สถาบันวิจัยและพัฒนา',
        'สำนักงานอธิการบดี',
        'สำนักงานอธิการบดี-กองกลาง',
        'สำนักงานอธิการบดี-กองบริหารวิชาการ',
        'สำนักงานอธิการบดี-กองพัฒนานักศึกษา',
        'สำนักวิทยบริการ',
      ],
      chart: {
        type: 'donut',
        height: 540,
        width: '100%',
        animations: {
          enabled: true,
        },
      },
      legend: {
        position: 'right',
        fontFamily: 'TH K2D July8',
        fontSize: '20px',
      },
      plotOptions: {
        pie: {
          donut: {
            size: '40%',
          },
          dataLabels: {
            offset: 12, // ⬅ ดัน label ออกนอกวง
            minAngleToShowLabel: 10,
          },
        },
      },
      dataLabels: {
        enabled: true,
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
      colors: this.colors,
    },
    {
      title: 'กราฟสรุปจำนวนบทความ จำแนกตามหน่วยงาน',
      subtitle: this.getLastUpdatedText(),
      series: [
        124, 611, 505, 225, 382, 206, 560, 5, 17, 80, 43, 184, 309, 28, 322, 18,
        4, 59, 5, 12, 8, 1, 16, 2,
      ],
      labels: [
        'คณะเกษตรและเทคโนโลยี',
        'คณะครุศาสตร์',
        'คณะเทคโนโลยีอุตสาหกรรม',
        'คณะวิทยาการจัดการและเทคโนโลยีสารสนเทศ',
        'คณะวิทยาศาสตร์',
        'คณะวิศวกรรมศาสตร์',
        'คณะศิลปกรรมศาสตร์และวิทยาศาสตร์',
        'งานวิชาศึกษาทั่วไป',
        'โรงเรียนสาธิตแห่งมหาวิทยาลัยนครพนม พนมพิทยพัฒน์',
        'วิทยาลัยการท่องเที่ยวและอุตสาหกรรมบริการ',
        'วิทยาลัยการบิน การศึกษา และวิจัยนานาชาติ',
        'วิทยาลัยเทคโนโลยีอุตสาหกรรมศรีสงคราม',
        'วิทยาลัยธาตุพนม',
        'วิทยาลัยนาหว้า',
        'วิทยาลัยพยาบาลบรมราชชนนีนครพนม',
        'ศูนย์การศึกษามหาวิทยาลัยนครพนม ณ กรุงเทพมหานคร',
        'สถาบันภาษา',
        'สถาบันวิจัยและพัฒนา',
        'สำนักงานอธิการบดี',
        'สำนักงานอธิการบดี-กองกลาง',
        'สำนักงานอธิการบดี-กองบริหารทรัพยากรบุคคล',
        'สำนักงานอธิการบดี-กองบริหารวิชาการ',
        'สำนักงานอธิการบดี-กองพัฒนานักศึกษา',
        'สำนักวิทยบริการ',
      ],
      chart: {
        type: 'donut',
        height: 540,
        width: '100%',
        animations: {
          enabled: true,
        },
      },
      legend: {
        position: 'right',
        fontFamily: 'TH K2D July8',
        fontSize: '20px',
      },
      plotOptions: {
        pie: {
          donut: {
            size: '40%',
          },
          dataLabels: {
            offset: 12, // ⬅ ดัน label ออกนอกวง
            minAngleToShowLabel: 10,
          },
        },
      },
      dataLabels: {
        enabled: true,
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
      colors: this.colors,
    },
    {
      title: 'กราฟสรุปจำนวนนวัตกรรมสิ่งประดิษฐ์ จำแนกตามหน่วยงาน',
      subtitle: this.getLastUpdatedText(),
      series: [3, 5, 9, 2, 3, 5, 2, 6, 5, 61, 31, 1, 42],
      labels: [
        'คณะเกษตรและเทคโนโลยี',
        'คณะครุศาสตร์',
        'คณะเทคโนโลยีอุตสาหกรรม',
        'คณะวิทยาการจัดการและเทคโนโลยีสารสนเทศ',
        'คณะวิทยาศาสตร์',
        'คณะวิศวกรรมศาสตร์',
        'คณะศิลปกรรมศาสตร์และวิทยาศาสตร์',
        'โรงเรียนสาธิตแห่งมหาวิทยาลัยนครพนม พนมพิทยพัฒน์',
        'วิทยาลัยเทคโนโลยีอุตสาหกรรมศรีสงคราม',
        'วิทยาลัยธาตุพนม',
        'วิทยาลัยนาหว้า',
        'วิทยาลัยพยาบาลบรมราชชนนีนครพนม',
        'สำนักงานอธิการบดี-กองกลาง',
      ],
      chart: {
        type: 'donut',
        height: 540,
        width: '100%',
        animations: {
          enabled: true,
        },
      },
      legend: {
        position: 'right',
        fontFamily: 'TH K2D July8',
        fontSize: '20px',
      },
      plotOptions: {
        pie: {
          donut: {
            size: '40%',
          },
          dataLabels: {
            offset: 12, // ⬅ ดัน label ออกนอกวง
            minAngleToShowLabel: 10,
          },
        },
      },
      dataLabels: {
        enabled: true,
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
      colors: this.colors,
    },
  ];

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

  newsList: News[] = [
    {
      title: 'มหาวิทยาลัยนครพนม เปิดรับข้อเสนอโครงการวิจัย ปี 2568',
      summary:
        'เปิดรับข้อเสนอโครงการวิจัยเพื่อขอรับทุนสนับสนุน ประจำปีงบประมาณ 2568',
      imageUrl: 'assets/news1.jpg',
      link: 'news/:id',
    },
    {
      title: 'ประกาศผลการพิจารณาทุนวิจัย รอบที่ 2',
      summary: 'ประกาศรายชื่อผู้ได้รับทุนวิจัย รอบที่ 2 ประจำปีงบประมาณ 2567',
      imageUrl: 'assets/news2.jpg',
      link: 'news/:id',
    },
    {
      title: 'ขอเชิญเข้าร่วมอบรมการเขียนบทความวิจัย',
      summary: 'อบรมการเขียนบทความวิจัยเพื่อตีพิมพ์ในวารสารระดับนานาชาติ',
      imageUrl: 'assets/news.jpeg',
      link: 'news/:id',
    },
  ];

  publications: DataPerformance = {
    research: [
      {
        id: 1,
        title: 'การพัฒนาระบบฐานข้อมูลวิจัย',
        researchers: 'ดร.เศริยา มั่งมี',
        date: '30 มิ.ย. 2567',
        year: 2567,
      },
      {
        id: 2,
        title: 'ผลกระทบของการเปลี่ยนแปลงสภาพภูมิอากาศต่อการเกษตร',
        researchers: 'ผศ.สมชาย ใจดีผศ.สมชาย ใจดีผศ.สมชาย ใจดีผศ.สมชาย ใจดี',
        date: '15 มี.ค. 2567',
        year: 2567,
      },
      {
        id: 3,
        title: 'นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์',
        researchers: 'ดร.สมหญิง แก้วใส',
        date: '10 ก.พ. 2567',
        year: 2567,
      },
      {
        id: 4,
        title: 'นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์',
        researchers: 'ดร.สมหญิง แก้วใส',
        date: '10 ก.พ. 2567',
        year: 2567,
      },
    ],
    article: [
      {
        id: 5,
        title: 'นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์',
        researchers: 'ดร.สมหญิง แก้วใส',
        date: '10 ก.พ. 2567',
        year: 2567,
      },
      {
        id: 6,
        title:
          'นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์',
        researchers: 'ดร.สมหญิง แก้วใส',
        date: '10 ก.พ. 2567',
        year: 2567,
      },
      {
        id: 7,
        title: 'นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์',
        researchers: 'ดร.สมหญิง แก้วใส',
        date: '10 ก.พ. 2567',
        year: 2567,
      },
      {
        id: 8,
        title: 'นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์',
        researchers: 'ดร.สมหญิง แก้วใส',
        date: '10 ก.พ. 2567',
        year: 2567,
      },
    ],
    innovation: [
      {
        id: 9,
        title: 'นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์',
        researchers: 'ดร.สมหญิง แก้วใส',
        date: '10 ก.พ. 2567',
        year: 2567,
      },
      {
        id: 10,
        title: 'นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์',
        researchers: 'ดร.สมหญิง แก้วใส',
        date: '10 ก.พ. 2567',
        year: 2567,
      },
      {
        id: 11,
        title: 'นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์',
        researchers: 'ดร.สมหญิง แก้วใส',
        date: '10 ก.พ. 2567',
        year: 2567,
      },
      {
        id: 12,
        title: 'นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์',
        researchers: 'ดร.สมหญิง แก้วใส',
        date: '10 ก.พ. 2567',
        year: 2567,
      },
      {
        id: 13,
        title:
          'นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์',
        researchers: 'ดร.สมหญิง แก้วใส',
        date: '10 ก.พ. 2567',
        year: 2567,
      },
    ],
  };

  constructor(private router: Router) {}

  filteredResearch: DataPerformanceItem[] = [];
  paginatedPublications: DataPerformanceItem[] = [];

  ngOnInit(): void {
    this.filteredResearch = [...this.publications[this.selectedTab]];
    this.updatePagination();
  }
  onSearch() {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredResearch = this.publications[this.selectedTab].filter(
      (p) =>
        p.title.toLowerCase().includes(keyword) ||
        p.researchers.toLowerCase().includes(keyword) ||
        p.year.toString().includes(keyword)
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
    if (page === this.currentPage) return;

    this.currentPage = page;
    this.updatePagination();
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  
  

  get totalPages(): number {
    return Math.ceil(this.publications[this.selectedTab].length / this.pageSize);
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
    this.router.navigate(['/performance', this.selectedTab, id]);
  }

  changeTab(tab: keyof DataPerformance): void {
    this.selectedTab = tab;
    this.searchText = '';
    this.currentPage = 1;

    this.filteredResearch = [...this.publications[tab]];
    this.updatePagination();
  }
}
