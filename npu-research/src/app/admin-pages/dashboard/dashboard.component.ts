import { Component, ViewChild } from '@angular/core';
import { BarSummary, ResearchItem, ResearchProfileData } from '../../models/get-profile-by-id.model';
import { ProfileService } from '../../services/profile.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApexNonAxisChartSeries, ApexChart, ApexResponsive, ApexLegend, ApexDataLabels, ApexPlotOptions, ApexAxisChartSeries, ApexYAxis, ApexXAxis, ApexFill, ApexTooltip, ApexStroke, ChartComponent, ApexMarkers } from 'ng-apexcharts';
import { MainComponent } from '../../shared/layouts/main/main.component';

export type RadarChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  fill: ApexFill;
  stroke: ApexStroke;
  markers: ApexMarkers;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;
  plotOptions?: ApexPlotOptions;
  yaxis?: ApexYAxis;
  tooltip?: ApexTooltip;
  colors?: string[];
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

type ResearchTab = 'project' | 'article' | 'innovation';

@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {
  @ViewChild('chart') chart!: ChartComponent;
  chartOptions: any;
  fullLabels: string[] = [];
  fullLabelsSub: string[] = [];
  radarData: any;

  profileDataById: ResearchProfileData | null = null;
  isPersonalOpen = true;
  isWorkOpen = false;
  isEducation = false;
  isTraining = false;
  isAddress = false;
  isOwner = false;
  trainings: any[] = [];
  selectedTab: ResearchTab = 'project';
  searchText = '';
  paginationData: ResearchItem[] = [];
  currentPage = 1;
  pageSize = 10;
  isModalOpen = false;
  isEditMode = false;
  searchEducationLevel = '';
  searchMajors = '';
  searchQualifications = '';

  educationData: any = {
    highest_education: '',
    field_of_study: '',
    qualification: '',
    gpa: '',
    institution: '',
    date_enrollment: '',
    date_graduation: '',
  };

  researchData: any = {
    projects: [],
    articles: [],
    innovations: [],
  };

   /* ===== Charts ===== */
    radarChartOptions!: Partial<RadarChartOptions>;
    radarChartOptionsSub!: Partial<RadarChartOptions>;
    barChartOptions!: Partial<BarChartOptions>;
    barSummary: BarSummary[] = [];

      researchList: ResearchItem[] = [];
      originalData: ResearchItem[] = [];

      totalItems: number = 0;
      
        filteredData: ResearchItem[] = [];

  constructor(
    private service: ProfileService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.chartOptions = {
      colorSet: 'customColorSet',
      animationEnabled: true,
      data: [
        {
          type: 'doughnut',
          yValueFormatString: '#,##0',
          indexLabel: '{name} ({y})',
          dataPoints: [],
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

    this.radarChartOptions = {
      series: [
        {
          name: 'จำนวนงานวิจัย',
          data: [],
        },
      ],
      chart: {
        type: 'radar',
        height: 300,
        width: '100%',
        toolbar: { show: false },
        foreColor: '#394250',
      },
      labels: [],
      fill: {
        opacity: 0.3,
      },
      stroke: {
        width: 2,
        colors: ['#038FFB'],
      },
      markers: {
        size: 4,
        colors: ['#038FFB'],
        strokeColors: '#394250',
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ['#394250'],
        },
      },

      plotOptions: {
        radar: {
          size: 120,
          polygons: {
            strokeColors: '#e5e7eb',
            fill: {
              colors: ['transparent'],
            },
          },
        },
      },

      yaxis: {
        labels: {
          style: {
            colors: '#394250',
          },
        },
      },

      xaxis: {
        labels: {
          style: {
            colors: '#394250',
          },
        },
      },

      tooltip: {
        theme: 'dark',
        custom: ({ series, seriesIndex, dataPointIndex }) => {
          const fullLabel = this.fullLabels[dataPointIndex]; // ⭐ ตัวจริง
          const value = series[seriesIndex][dataPointIndex];
      
          return  `<div style="padding:8px 12px; background:#333; color:#fff; border-radius:6px;">
        <div style="font-weight:600; margin-bottom:4px;">${fullLabel}</div>
        <hr style="border-color:#555; margin:4px 0;">
        <div style="display:flex; justify-content:space-around; align-items:center; gap:6px;">
          <span style="width:10px; height:10px; border-radius:50%; background:#038FFB; display:inline-block;"></span>
          <span>จำนวน: ${value}</span>
        </div>
      </div>`;
        }
      },
    };

    this.radarChartOptionsSub = {
      series: [
        {
          name: 'จำนวนงานวิจัย',
          data: [],
          color: '#FF4560',
        },
      ],
      chart: {
        type: 'radar',
        height: 300,
        width: '100%',
        toolbar: { show: false },
        foreColor: '#394250',
      },
      labels: [],
      fill: {
        opacity: 0.3,
        colors: ['#FF4560'],
      },
      stroke: {
        width: 2,
        colors: ['#FF4560'],
      },
      markers: {
        size: 4,
        colors: ['#FF4560'],
        strokeColors: '#ffffff',
      },
      dataLabels: {
        enabled: true,
        style: {
          colors: ['#394250'],
        },
      },

      plotOptions: {
        radar: {
          size: 120,
          polygons: {
            strokeColors: '#e5e7eb',
            fill: {
              colors: ['transparent'],
            },
          },
        },
      },

      yaxis: {
        labels: {
          style: {
            colors: '#394250',
          },
        },
      },

      xaxis: {
        labels: {
          style: {
            colors: '#394250',
          },
        },
      },

      tooltip: {
        theme: 'dark',
        custom: ({ series, seriesIndex, dataPointIndex }) => {
          const fullLabelsSub = this.fullLabelsSub[dataPointIndex]; // ⭐ ตัวจริง
          const value = series[seriesIndex][dataPointIndex];
      
          return  `<div style="padding:8px 12px; background:#333; color:#fff; border-radius:6px;">
        <div style="font-weight:600; margin-bottom:4px;">${fullLabelsSub}</div>
        <hr style="border-color:#555; margin:4px 0;">
        <div style="display:flex; justify-content:space-around; align-items:center; gap:6px;">
          <span style="width:10px; height:10px; border-radius:50%; background:#FF4560; display:inline-block;"></span>
          <span>จำนวน: ${value}</span>
        </div>
      </div>`;
        }
      },
    };
  }

  ngOnInit() {
    MainComponent.showLoading();
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (id) {
        this.loadDataById(+id);
      }
      MainComponent.hideLoading();
    });
  }

  loadDataById(id: number) {
    this.service.getProfileById(id).subscribe({
      next: (res) => {
        this.profileDataById = res.data;
        this.barSummary = res.data.bar;
        this.researchData = res.data.researchs;
        this.radarData = res.data.radar;

        this.changeTab('project');
        this.updateCharts();
        
      },
      error: (err) => console.error(err),
    });
  }

  goToEditProfile() {}

  goToEditWork() {}

  goToEditTraning() {}

  openEditModal() {}

  changeTab(tab: ResearchTab): void {
    this.selectedTab = tab;
    this.searchText = '';
    this.currentPage = 1;
  
    if (!this.researchData) return;
  
    if (tab === 'project') {
      this.originalData = this.researchData.projects || [];
    }
  
    if (tab === 'article') {
      this.originalData = this.researchData.articles || [];
    }
  
    if (tab === 'innovation') {
      this.originalData = this.researchData.innovations || [];
    }
  
    this.filteredData = [...this.originalData];
    this.totalItems = this.filteredData.length;
  
    this.updatePagination(); // 🔥 
  }

  onSearch() {}
  
  viewItem(id: number) {
    this.router.navigate(['/performance-public', this.selectedTab, id]);
  }

  editItem(id: number) {}

  deleteItem(id: number) {}

  closeModal() {}

  toggle(name: string, event: MouseEvent) {
    event.stopPropagation();
  }

  isOpen(name: string) {
  }

  filteredEducationLevel(): void {}

  selectEducationLevel(e: string) {}
  filteredMajor(): void {}
  selectMajor(m: string) {}
  filteredQualification(): void {}
  selectQualification(q: string) {}

  save() {}

  updateCharts(): void {
    if (!this.barSummary.length) return;
  
    const sorted = [...this.barSummary].sort((a, b) => a.year - b.year);
  
    const years = sorted.map(i => i.year.toString());
    const projectData = sorted.map(i => i.project_count);
    const articleData = sorted.map(i => i.article_count);
    const innovationData = sorted.map(i => i.innovation_count);
  
    // ===== BAR =====
    this.barChartOptions = {
      ...this.barChartOptions,
      series: [
        { name: 'โครงการวิจัย', data: projectData },
        { name: 'บทความ', data: articleData },
        { name: 'นวัตกรรม', data: innovationData },
      ],
      xaxis: { categories: years },
    };
  
    // ===== PIE (รวมทั้งหมดทุกปี) =====
    this.chartOptions = {
      ...this.chartOptions,
      data: [
        {
          ...this.chartOptions.data[0],
          dataPoints: [
            { name: 'โครงการวิจัย', y: projectData.reduce((a, b) => a + b, 0) },
            { name: 'บทความ', y: articleData.reduce((a, b) => a + b, 0) },
            { name: 'นวัตกรรม', y: innovationData.reduce((a, b) => a + b, 0) },
          ],
        },
      ],
    }

    const tabIndex =
      this.selectedTab === 'project'
        ? 0
        : this.selectedTab === 'article'
        ? 1
        : 2;

    this.fullLabels = this.radarData?.major?.labels || [];
    this.fullLabelsSub = this.radarData?.sub?.labels || [];
    
    
    const labels = (this.radarData?.major?.labels || []).map((label: any) =>
      this.shortLabel(label)
    );

    const values = [
      ...(this.radarData?.major?.datasets[tabIndex]?.data || []),
    ];

    const labelsSub = 
      (this.radarData?.sub?.labels || [])
      .map((label: any) => this.shortLabel(label));

    const valuesSub = [
      ...(this.radarData?.sub?.datasets[tabIndex]?.data || []),
    ];

    this.radarChartOptions = {
      ...this.radarChartOptions,
      series: [
        {
          name: this.tabs.find((t) => t.key === this.selectedTab)?.label || '',
          data: values,
        },
      ],
      labels: labels,
      xaxis: { categories: labels },
    };

    this.radarChartOptionsSub = {
      ...this.radarChartOptionsSub,
      series: [
        {
          name: this.tabs.find((t) => t.key === this.selectedTab)?.label || '',
          data: valuesSub,
        },
      ],
      labels: labelsSub,
      xaxis: { categories: labelsSub },
    };
  }

  tabs: { key: ResearchTab; label: string; icon: string }[] = [
    { key: 'project', label: 'งานวิจัย', icon: 'bi-journal-text' },
    { key: 'article', label: 'บทความวิชาการ', icon: 'bi-file-earmark-text' },
    { key: 'innovation', label: 'นวัตกรรมสิ่งประดิษฐ์', icon: 'bi-award' },
  ];

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginationData = this.filteredData.slice(start, end);
  }

  getChartInstance(chart: any) {
    this.chart = chart;
  }

  shortLabel(fullLabel: any) {
    const maxLength = 12;
    const shortLabel =
      fullLabel.length > maxLength
        ? fullLabel.slice(0, maxLength) + '...'
        : fullLabel;

    return shortLabel;
  }
}
