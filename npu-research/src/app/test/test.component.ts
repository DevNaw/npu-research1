import { Component, OnInit } from '@angular/core';
import { MainComponent } from '../shared/layouts/main/main.component';
import {
  AgChartOptions,
  ModuleRegistry,
  AllCommunityModule,
} from "ag-charts-community";

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-test',
  standalone: false,
  templateUrl: './test.component.html',
  styleUrl: './test.component.css',
})
export class TestComponent implements OnInit {
  data = [
    { asset: "Stocks", amount: 60000 },
    { asset: "Bonds", amount: 40000 },
    { asset: "Cash", amount: 7000 },
    { asset: "Real Estate", amount: 5000 },
    { asset: "Commodities", amount: 3000 },
  ];

  options: AgChartOptions;

  ngOnInit(): void {
    MainComponent.showLoading();
    Promise.all([
      new Promise(resolve => setTimeout(resolve, 1000))
    ]).then(() => {
      MainComponent.hideLoading();
    });
  }

  constructor() {
    this.options = {
      data: this.data,
      title: {
        text: "Portfolio Composition",
      },
      series: [
        {
          type: "donut",
          calloutLabelKey: "asset",
          angleKey: "amount",
        },
      ],
    };
  }
}
