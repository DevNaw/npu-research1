import { Component, OnInit } from '@angular/core';
import {
  ApexChart,
  ApexNonAxisChartSeries,
  ApexResponsive,
} from 'ng-apexcharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  responsive: ApexResponsive[];
};

@Component({
  selector: 'app-test',
  standalone: false,
  templateUrl: './test.component.html',
  styleUrl: './test.component.css',
})
export class TestComponent implements OnInit {
  // ===== Mock Data =====
  reportData = [
    { category: 'คณะวิทยาศาสตร์', count: 12 },
    { category: 'คณะวิศวกรรมศาสตร์', count: 8 },
    { category: 'คณะเกษตรและเทคโนโลยี', count: 5 },
  ];

  total = 0;

  // ===== Chart =====
  chartOptions!: ChartOptions;

  ngOnInit(): void {
    this.total = this.reportData.reduce((s, i) => s + i.count, 0);

    this.chartOptions = {
      series: this.reportData.map(i => i.count),
      chart: {
        type: 'donut',
        height: 320,
      },
      labels: this.reportData.map(i => i.category),
      responsive: [
        {
          breakpoint: 640,
          options: {
            chart: {
              height: 280,
            },
            legend: {
              position: 'bottom',
            },
          },
        },
      ],
    };
  }

  getPercent(count: number): string {
    return ((count / this.total) * 100).toFixed(0);
  }

  exportExcel() {
    const worksheetData = this.reportData.map(item => ({
      'หน่วยงาน': item.category,
      'จำนวน': item.count,
      'เปอร์เซ็นต์': `${this.getPercent(item.count)}%`,
    }));
  
    const worksheet: XLSX.WorkSheet =
      XLSX.utils.json_to_sheet(worksheetData);
  
    const workbook: XLSX.WorkBook = {
      Sheets: { 'รายงาน': worksheet },
      SheetNames: ['รายงาน'],
    };
  
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
  
    const blob = new Blob(
      [excelBuffer],
      { type: 'application/octet-stream' }
    );
  
    saveAs(blob, 'report-summary.xlsx');
  }

  exportPDF() {
    const doc = new jsPDF('p', 'mm', 'a4');
  
    doc.setFontSize(16);
    doc.text('รายงานสรุปข้อมูล', 14, 15);
  
    autoTable(doc, {
      startY: 25,
      head: [['หน่วยงาน', 'จำนวน', 'เปอร์เซ็นต์']],
      body: this.reportData.map(item => [
        item.category,
        item.count,
        `${this.getPercent(item.count)}%`
      ]),
    });
  
    doc.save('report-summary.pdf');
  }
  
}
