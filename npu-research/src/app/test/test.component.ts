import { Component, OnInit } from '@angular/core';
import { MainComponent } from '../shared/layouts/main/main.component';
import { Color, ScaleType } from '@swimlane/ngx-charts';



@Component({
  selector: 'app-test',
  standalone: false,
  templateUrl: './test.component.html',
  styleUrl: './test.component.css',
})
export class TestComponent implements OnInit {
  data = [
    { name: 'Aasdfasdfas', value: 44 },
    { name: 'B', value: 55 },
    { name: 'C', value: 13 },
    { name: 'D', value: 33 }
  ];
  customTooltip = (model: any) => {
    return `${model.name}: ${model.value} รายการ`;
  };

  colorScheme: Color = {
    name: 'customScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#facc15', '#4ade80', '#60a5fa', '#f87171']
  };

  ngOnInit(): void {
    MainComponent.showLoading();
    Promise.all([
      new Promise(resolve => setTimeout(resolve, 1000))
    ]).then(() => {
      MainComponent.hideLoading();
    });
  }

  chartOptions = {
    series: [44, 55, 13, 33],
    chart: {
      type: 'donut',
      height: 350,
    },
    labels: ['Category A', 'Category B', 'Category C', 'Category D'],
    colors: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'],
    tooltip: {
      enabled: true, // ✅ tooltip ทำงานได้ปกติ
    },
    legend: {
      position: 'bottom',
    },
  };
}
