import { Component } from '@angular/core';
import {
  DashboardData,
  Statistic,
  StatisticResearcher,
  TopResearcher,
} from '../../models/report.model';
import { ReportService } from '../../services/report.service';
import { MainComponent } from '../../shared/layouts/main/main.component';
import {
  ApexChart,
  ApexLegend,
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexDataLabels,
} from 'ng-apexcharts';

export type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
  responsive: ApexResponsive[];
};

@Component({
  selector: 'app-report',
  standalone: false,
  templateUrl: './report.component.html',
  styleUrl: './report.component.css',
})
export class ReportComponent {
  data!: DashboardData;
  statistic: Statistic | undefined;
  topResearcher: TopResearcher[] = [];
  hasDonutData = false;
  donutSeries: number[] = [];
  donutLabels: string[] = [];
  stat: any = {};
  statistic_researcher: StatisticResearcher | undefined;

  // ===== Donut Chart (พื้นหลังเข้ม) =====
  donutChart: ApexChart = {
    type: 'donut',
    height: 320,
    foreColor: '#ffffff', // ← ตัวหนังสือทั้งหมดใน chart เป็นสีขาว
  };

  donutLegend: ApexLegend = {
    show: true,
    position: 'bottom',
    horizontalAlign: 'center',
    fontSize: '13px',
    fontWeight: 500,
    labels: {
      colors: '#ffffff',
      useSeriesColors: false,
    },
    markers: {
      // @ts-ignore
      width: 12,
      height: 12,
      strokeWidth: 0,
    },
    itemMargin: {
      horizontal: 8,
      vertical: 4,
    },
  };

  // ===== Pie Chart (พื้นหลังขาว) =====
  pieChartOptions: Partial<PieChartOptions> = {
    series: [],
    chart: {
      type: 'pie',
      height: 320,
      foreColor: '#394250', // pie อยู่บนพื้นขาว ใช้สีเข้ม
    },
    labels: [],
    legend: {
      show: true,
      position: 'bottom',
      labels: {
        colors: '#394250',
        useSeriesColors: false,
      },
    },
    dataLabels: {
      enabled: true,
      style: {
        fontSize: '12px',
        fontWeight: 600,
        colors: ['#ffffff'],
      },
    },
    responsive: [
      {
        breakpoint: 1024,
        options: {
          chart: { height: 300 },
          legend: { show: false },
          dataLabels: { enabled: true },
        },
      },
      {
        breakpoint: 768,
        options: {
          chart: { height: 260 },
          legend: { show: false },
          dataLabels: { enabled: true },
        },
      },
    ],
  };

  constructor(private service: ReportService) {}

  ngOnInit(): void {
    MainComponent.showLoading();
    Promise.all([
      this.loadDashboard(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).then(() => MainComponent.hideLoading());
  }

  loadDashboard() {
    this.service.getData().subscribe((res) => {
      this.data = res.data;
      this.statistic = this.data.statistic;
      this.topResearcher = this.data.top_researcher;
      this.stat = res.data.statistic;
      this.statistic_researcher = this.data.statistic_researcher;

      this.prepareDonutChart();
      this.preparePieChart();
    });
  }

  prepareDonutChart() {
    if (!this.data?.graph_research) return;

    const filtered = this.data.graph_research.filter((i) => i.count > 0);

    this.donutSeries = filtered.map((i) => i.count);
    this.donutLabels = filtered.map((i) => i.label);
    this.hasDonutData = this.donutSeries.length > 0;

    // 🎯 สร้าง array สีขาวตามจำนวน labels (จุดสำคัญที่ทำให้สีขาวทำงาน)
    this.donutLegend = {
      ...this.donutLegend,
      labels: {
        colors: filtered.map(() => '#ffffff'),
        useSeriesColors: false,
      },
    };
  }

  preparePieChart() {
    if (!this.data?.graph_oecd) return;

    const filtered = this.data.graph_oecd
      .filter((i) => i.count > 0)
      .sort((a, b) => b.count - a.count);

    const top = filtered.slice(0, 10);
    const others = filtered.slice(10);
    const otherCount = others.reduce((sum, i) => sum + i.count, 0);
    const labels = top.map((i) => i.oecd_name);
    const series = top.map((i) => i.count);

    if (otherCount > 0) {
      labels.push('Other');
      series.push(otherCount);
    }

    this.pieChartOptions = {
      ...this.pieChartOptions,
      labels: labels,
      series: series,
    };
  }
}