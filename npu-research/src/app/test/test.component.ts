import { Component } from '@angular/core';
// donut-chart.component.ts
import {
  ApexChart,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexLegend,
  ApexDataLabels,
  ApexPlotOptions,
  ApexStroke,
  ApexTooltip,
} from 'ng-apexcharts';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  responsive: ApexResponsive[];
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
};

@Component({
  selector: 'app-test',
  standalone: false,
  templateUrl: './test.component.html',
  styleUrl: './test.component.css',
})
export class TestComponent {
  series: ApexNonAxisChartSeries = [
    18.2, 12.5, 10.8, 8.6, 7.4, 6.2, 5.5, 4.8, 4.1, 3.7, 3.2, 2.8, 2.4, 2.1,
    1.9, 1.6, 1.3, 1.1, 0.9, 0.8, 0.7,
  ];

  chart: ApexChart = {
    type: 'donut',
    height: 420,
    width: '1000',
    animations: {
      enabled: true,
    },
  };

  labels: string[] = [
    'คณะเกษตรและเทคโนโลยี',
    'คณะครุศาสตร์',
    'คณะเทคโนโลยีอุตสาหกรรม',
    'คณะวิทยาการจัดการและเทคโนโลยีสารสนเทศ',
    'คณะวิทยาศาสตร์',
    'คณะวิศวกรรมศาสตร์',
    'คณะศิลปกรรมศาสตร์และวิทยาศาสตร์',
    'โรงเรียนสาธิตแห่งมหาวิทยาลัยนครพนม',
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
  ];

  legend: ApexLegend = {
    position: 'right',
  };

  plotOptions: ApexPlotOptions = {
    pie: {
      donut: {
        size: '40%',
      },
      dataLabels: {
        offset: 40, // ⬅ ดัน label ออกนอกวง
        minAngleToShowLabel: 1,
      },
    },
  };

  dataLabels: ApexDataLabels = {
    enabled: true,
    formatter: (val: number, opts) =>
      `${opts.w.globals.labels[opts.seriesIndex]} ${val.toFixed(1)}%`,

    style: {
      fontSize: '8px',
      fontWeight: 80,
    },
    background: {
      enabled: true,
      foreColor: '#000000',
      padding: 2,
      borderRadius: 2,
    },
    dropShadow: {
      enabled: true,
    },
  };

  stroke: ApexStroke = {
    show: true,
    width: 1,
    colors: ['#ffffff'],
  };

  responsive: ApexResponsive[] = [
    {
      breakpoint: 768,
      options: {
        legend: {
          position: 'bottom',
        },
      },
    },
  ];

  tooltip: ApexTooltip = {
    y: {
      formatter: (val: number) => `${val.toFixed(2)}%`,
    },
  };

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
      scale: 2,           // ⬅ เพิ่มความคม
      useCORS: true,
      backgroundColor: '#ffffff'
    }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight =
        (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(
        imgData,
        'PNG',
        10,
        10,
        pdfWidth - 20,
        pdfHeight
      );

      pdf.save('research-chart.pdf');
    });
  }
}
