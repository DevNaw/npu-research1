import { Component } from '@angular/core';
import { BarSummary, ResearchItem, ResearchProfileData } from '../../models/get-profile-by-id.model';
import { ProfileService } from '../../services/profile.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ApexNonAxisChartSeries, ApexChart, ApexResponsive, ApexLegend, ApexDataLabels, ApexPlotOptions, ApexAxisChartSeries, ApexYAxis, ApexXAxis, ApexFill, ApexTooltip, ApexStroke } from 'ng-apexcharts';

export type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  responsive: ApexResponsive[];
  legend: ApexLegend;
  dataLabels: ApexDataLabels;
  plotOptions: ApexPlotOptions;
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
    pieChartOptions!: Partial<PieChartOptions>;
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
    this.pieChartOptions = {
      series: [44, 55, 13],
      chart: {
        type: 'pie',
        width: 200,
      },
      labels: ['โครงการวิจัย', 'บทความ', 'นวัตกรรม'],
      legend: {
        show: false,
      },
      dataLabels: {
        enabled: true,
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 250,
            },
            legend: {
              show: false,
            },
          },
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
  }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (id) {
        this.loadDataById(+id);
      }
    });
  }

  loadDataById(id: number) {
    this.service.getProfileById(id).subscribe({
      next: (res) => {
        this.profileDataById = res.data;
        this.barSummary = res.data.bar;
        this.researchData = res.data.researchs;

        this.changeTab('project');
        this.updateCharts();
        console.log(this.profileDataById);
        
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
    this.pieChartOptions = {
      ...this.pieChartOptions,
      series: [
        projectData.reduce((a, b) => a + b, 0),
        articleData.reduce((a, b) => a + b, 0),
        innovationData.reduce((a, b) => a + b, 0),
      ],
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
}
