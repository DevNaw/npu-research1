import { Component, ViewChild, ElementRef, OnInit, HostListener } from '@angular/core';
import { MainComponent } from '../shared/layouts/main/main.component';
import { Chart, ArcElement, Tooltip, Legend, PieController } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ChartData } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend, ChartDataLabels, PieController);

@Component({
  selector: 'app-test',
  standalone: false,
  templateUrl: './test.component.html',
  styleUrl: './test.component.css',
})
export class TestComponent implements OnInit {
  @ViewChild('myChart') chartRef!: ElementRef;

  chart: any;

  // ✅ mock data ของคุณ
  mockGraph = [
    { oecd_name: 'พืชสวน', count: 5 },
    { oecd_name: 'เคมีอิเล็กทรอนิกส์', count: 3 },
    { oecd_name: 'จริยธรรม', count: 2 },
    { oecd_name: 'การทำฟาร์มชีวภาพ', count: 4 },
    { oecd_name: 'ทฤษฎีทางคณิตศาสตร์', count: 1 }
  ];

  ngOnInit() {
   MainComponent.showLoading();
    Promise.all([
      new Promise(resolve => setTimeout(resolve, 1000))
    ]).then(() => {
      this.renderChart();
      MainComponent.hideLoading();
    });
  }

  // 🔥 plugin เส้นชี้ (สำคัญ)
  calloutLinePlugin = {
    id: 'calloutLine',
    afterDatasetsDraw: (chart: any) => {
      const { ctx } = chart;
  
      chart.getDatasetMeta(0).data.forEach((arc: any) => {
        const { x, y } = arc.tooltipPosition();
        const angle = (arc.startAngle + arc.endAngle) / 2;
  
        const r = 30;
        const labelOffset = 40;
        const extra = 20;
  
        const x1 = x + Math.cos(angle) * r;
        const y1 = y + Math.sin(angle) * r;
  
        const isRight = Math.cos(angle) >= 0;
  
        const x2 = x1 + (isRight ? labelOffset + extra : -(labelOffset + extra));
        const y2 = y1;
  
        ctx.save();
        ctx.strokeStyle = '#aaa';
        ctx.lineWidth = 1;
  
        // เส้นเฉียง
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x1, y1);
        ctx.stroke();
  
        // เส้นนอน (ยาวพอถึง label)
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
  
        ctx.restore();
      });
    }
  };

  renderChart() {
    const ctx = this.chartRef.nativeElement;

    const labels = this.mockGraph.map(g => g.oecd_name);
    const values = this.mockGraph.map(g => g.count);

    const total = values.reduce((a, b) => a + b, 0);

    this.chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: [
            '#038FFB',
            '#06E396',
            '#FEB119',
            '#FF4560',
            '#775DD0'
          ]
        }]
      },
      options: {
        responsive: true,
        layout: {
          padding: 40
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true
          },
          datalabels: {
            color: '#fff',
            formatter: (value: any, ctx: any) => {
              const label = ctx.chart.data.labels[ctx.dataIndex];
              return `${label}: ${value}%`;
            },
            anchor: 'end',
            align: (ctx: any) => {
              const meta = ctx.chart.getDatasetMeta(ctx.datasetIndex);
              const arc = meta.data[ctx.dataIndex];
            
              if (!arc) return 'center'; // กัน error
            
              const angle = (arc.startAngle + arc.endAngle) / 2;
            
              return Math.cos(angle) >= 0 ? 'right' : 'left';
            },
            offset: 40 // 🔥 ต้อง sync กับ plugin
          }
        }
      },
      plugins: [this.calloutLinePlugin] // 🔥 เส้นชี้
    });
  }
}
