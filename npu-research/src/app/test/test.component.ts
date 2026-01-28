import { Component, OnInit, ViewChild } from '@angular/core';
import { ChartComponent } from "ng-apexcharts";
import {
  ApexChart,
  ApexNonAxisChartSeries,
  ApexAxisChartSeries,
  ApexXAxis,
  ApexLegend
} from 'ng-apexcharts';

@Component({
  selector: 'app-test',
  standalone: false,
  templateUrl: './test.component.html',
  styleUrl: './test.component.css',
})
export class TestComponent {
  lastUpdated = this.getLastUpdatedText();

  /* ===== Colors ===== */
  colors = ['#6366F1', '#22C55E', '#F59E0B', '#EF4444', '#3B82F6'];

  /* ===== Donut Chart ===== */
  facultySeries: ApexNonAxisChartSeries = [120, 80, 60, 40, 20];
  facultyLabels = [
    'คณะวิทยาศาสตร์',
    'คณะครุศาสตร์',
    'คณะวิศวกรรมศาสตร์',
    'คณะเกษตรและเทคโนโลยี',
    'อื่น ๆ'
  ];

  donutChart: ApexChart = {
    type: 'donut',
    height: 360
  };

  legend: ApexLegend = {
    position: 'right',
    fontSize: '16px',
    fontFamily: 'TH K2D July8'
  };

  /* ===== Bar Chart ===== */
  typeSeries: ApexAxisChartSeries = [
    {
      name: 'จำนวนผลงาน',
      data: [320, 215, 48]
    }
  ];

  typeXAxis: ApexXAxis = {
    categories: ['โครงการวิจัย', 'บทความ', 'นวัตกรรม']
  };

  barChart: ApexChart = {
    type: 'bar',
    height: 350
  };

  /* ===== Line Chart ===== */
  yearSeries: ApexAxisChartSeries = [
    {
      name: 'ผลงานวิจัย',
      data: [120, 150, 180, 220, 320]
    }
  ];

  yearXAxis: ApexXAxis = {
    categories: ['2564', '2565', '2566', '2567', '2568']
  };

  lineChart: ApexChart = {
    type: 'line',
    height: 350
  };

  /* ===== Utils ===== */
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
}
