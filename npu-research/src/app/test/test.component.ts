import { Component, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CanvasJS } from '@canvasjs/angular-charts';
import { CanvasJSChart } from '@canvasjs/angular-charts';

CanvasJS.addColorSet('customColorSet', [
  '#038FFB', // น้ำเงิน
  '#06E396', // เขียว
  '#FEB119', // ส้ม
  '#FF4560', // แดง
  '#775DD0', // ม่วง
  '#00E396', // เขียวสด
  '#0090FF', // ฟ้า
  '#FF66C4', // ชมพู
  '#00B8D9', // ฟ้าน้ำทะเล
  '#FFB800', // เหลืองเข้ม
  '#4CAF50', // เขียวธรรมชาติ
  '#2196F3', // น้ำเงินอ่อน
  '#9C27B0', // ม่วงเข้ม
  '#FF5722', // ส้มแดง
  '#3F51B5', // น้ำเงินม่วง
  '#8BC34A', // เขียวอ่อน
  '#FFC107', // เหลืองทอง
  '#E91E63', // ชมพูเข้ม
  '#673AB7', // ม่วง deep
  '#03A9F4', // ฟ้าใส
  '#CDDC39', // เขียวมะนาว
  '#FF9800', // ส้มสด
  '#F44336', // แดงสด
  '#607D8B', // เทาน้ำเงิน
  '#00BCD4', // cyan
]);

@Component({
  selector: 'app-test',
  standalone: false,
  templateUrl: './test.component.html',
  styleUrl: './test.component.css',
})
export class TestComponent {

  // @ViewChild(CanvasJSChart) chart: any;
  //   openDropdown: string | null = null;
  //   isSearched = false;
  
  //   selectedType: string | null = null;
  //   selectedSubType: string | null = null;
  //   selectedMajor: MajorSubjectArea | null = null;
  
  //   selectedYear = '';
  //   researchTitle = '';
  //   searchSubType = '';
  //   searchText = '';
  //   researchItems = '';
  
  //   searchFaculitie = '';
  //   searchType = '';
  //   facultySearch: string = '';
  
  //   searchAgency: string = '';
  //   selectedAgency: Organization | null = null;
  //   subjectAre: MajorSubjectArea | null = null;
  
  //   date_from?: Date;
  //   date_to?: Date;
  
  //   fundingExternal = false;
  //   fundingInternal = false;
  //   selectedFunding: 'แหล่งทุนภายใน' | 'แหล่งทุนภายนอก' | null = null;
  
  //   researches: Research[] = [];
  
  //   loading = false;
  //   error: string | null = null;
  
  //   publications: DataPerformance = {
  //     research: [],
  //     article: [],
  //     innovation: [],
  //   };
  
  //   faculties = [
  //     'คณะวิศวกรรมศาสตร์',
  //     'คณะวิทยาศาสตร์',
  //     'คณะครุศาสตร์',
  //     'คณะบริหารธุรกิจ',
  //     'คณะเทคโนโลยีสารสนเทศ',
  //     'คณะเทคโนโลยีสารสนเทศ',
  //     'คณะเทคโนโลยีสารสนเทศ',
  //     'คณะเทคโนโลยีสารสนเทศ',
  //   ];
  
  //   agency = [
  //     'คณะวิทยาศาสตร์',
  //     'คณะวิศวกรรมศาสตร์',
  //     'คณะเทคโนโลยีสารสนเทศ',
  //     'คณะบริหารธุรกิจ',
  //     'คณะมนุษยศาสตร์และสังคมศาสตร์',
  //     'คณะศึกษาศาสตร์',
  //     'คณะสาธารณสุขศาสตร์',
  //     'คณะพยาบาลศาสตร์',
  //     'คณะเกษตรศาสตร์',
  //     'คณะนิติศาสตร์',
  //     'บัณฑิตวิทยาลัย',
  //     'สำนักวิจัยและพัฒนา',
  //     'สถาบันวิจัยและนวัตกรรม',
  //   ];
  
  //   typeList = ['โครงการวิจัย', 'บทความ', 'วารสาร', 'นวัตกรรมสิ่งประดิษฐ์'];
  
  //   subTypeMap: any = {
  //     โครงการวิจัย: [],
  //     บทความ: ['ประชุมวิชาการระดับชาติ', 'ประชุมวิชาการระดับนานาชาติ'],
  //     วารสาร: ['วารสารในประเทศ', 'วารสารต่างประเทศ'],
  //     นวัตกรรมสิ่งประดิษฐ์: [], // ไม่มีตัวเลือกย่อย
  //   };
  
  //   dateRange: {
  //     start: Date | null;
  //     end: Date | null;
  //   } = {
  //     start: null,
  //     end: null,
  //   };
  
  //   /** ===== FILTERED (ตาราง + กราฟใช้ชุดนี้) ===== */
  //   filteredResearchers: ResearchItem[] = [];
  //   paginationData: ResearchItem[] = [];
  
  //   pageSize = 10;
  //   currentPage = 1;
  
  //   /** ===== DONUT CHART ===== */
  //   donutLabels: string[] = [];
  //   donutSeries: number[] = [];
  //   totalResearchers = 0;
  
  //   chartOptions: any;
  
  //   donutChart = {
  //     type: 'donut' as const,
  //     height: 300,
  //   };
  
  //   donutLegend = {
  //     position: 'bottom' as const,
  //     show: false,
  //   };
  
  //   typeMap: any = {
  //     โครงการวิจัย: 'project',
  //     บทความ: 'article',
  //     วารสาร: 'research',
  //     นวัตกรรมสิ่งประดิษฐ์: 'innovation',
  //   };
  
  //   fundingMap: any = {
  //     internal: 'internal',
  //     external: 'external',
  //   };
  
  //   searchMajor: string = '';
  //   searchSub: string = '';
  //   activeMajor: MajorSubjectArea | null = null;
  //   selectedSub: SubSubjectArea | null = null;
  //   selectedFaculty: string = '';
  //   activeDropdown: string | null = null;
  //   filteredMajors: MajorSubjectArea[] = [];
  
  //   subOrgan: MajorSubjectArea[] = [];
  //   organizations: Organization[] = [];
  
  //   searchResults: ResearchItem[] = [];
  //   allTableData: ResearchItem[] = [];
  
  //   constructor(
  //     private router: Router,
  //     private authService: AuthService,
  //     private service: SearchService
  //   ) {
  //     this.chartOptions = {
  //       colorSet: 'customColorSet',
  //       animationEnabled: true,
  //       data: [
  //         {
  //           type: 'doughnut',
  //           yValueFormatString: '#,##0',
  //           indexLabel: '{name} ({y})',
  //           dataPoints: [],
  //         },
  //       ],
  //     };
  //   }
  
  //   ngOnInit() {
  //     MainComponent.showLoading();
  //     Promise.all([
  //       this.loadSubOrgan(),
  //       new Promise((resolve) => setTimeout(resolve, 1000)),
  //     ]).then(() => MainComponent.hideLoading());
  //   }
  
  //   // ======= Load SubArea Organization && Load Researchs =======
  //   loadSubOrgan(): void {
  //     this.service.getData().subscribe({
  //       next: (res) => {
  //         this.subOrgan = res.data.oecd;
  //         this.organizations = res.data.organizations;
  //       },
  //     });
  //   }
  
  //   prepareDonut() {
  //     type ResearchType = 'project' | 'article' | 'innovation';
    
  //     const map: Record<ResearchType, number> = {
  //       project: 0,
  //       article: 0,
  //       innovation: 0,
  //     };
    
  //     this.filteredResearchers.forEach((r) => {
  //       const type = r.type as ResearchType;
    
  //       if (map[type] !== undefined) {
  //         map[type]++;
  //       }
  //     });
    
  //     this.chartOptions = {
  //       colorSet: 'customColorSet',
  //       animationEnabled: true,
  //       data: [
  //         {
  //           type: 'doughnut',
  //           yValueFormatString: '#,##0',
  //           indexLabel: '{name} ({y})',
  //           dataPoints: [
  //             { name: 'โครงการวิจัย', y: map.project },
  //             { name: 'บทความ', y: map.article },
  //             { name: 'นวัตกรรม', y: map.innovation },
  //           ],
  //         },
  //       ],
  //     };
    
  //     if (this.chart) {
  //       this.chart.render();
  //     }
  //   }
  
  //   toggleDropdown(name: string, event: MouseEvent) {
  //     event.stopPropagation();
  //     this.activeDropdown = this.activeDropdown === name ? null : name;
  //     this.openDropdown = this.openDropdown === name ? null : name;
  //   }
  
  //   isOpen(name: string): boolean {
  //     return this.openDropdown === name;
  //   }
  
  //   @HostListener('document:click')
  //   closeAll() {
  //     this.openDropdown = null;
  //     this.activeDropdown = null;
  //   }
  
  //   selectFaculities(f: string) {
  //     this.selectedFaculty = f;
  //     this.openDropdown = null;
  //     this.searchFaculitie = '';
  //   }
  
  //   selectType(t: string) {
  //     this.selectedType = t;
  //     this.selectedSubType = null;
  //     this.searchType = '';
  //     this.searchSubType = '';
  
  //     this.openDropdown = null;
  
  //     if (this.subTypeMap[t] && this.subTypeMap[t].length > 0) {
  //       setTimeout(() => {
  //         this.openDropdown = 'subType';
  //       }, 0);
  //     }
  //   }
  
  //   selectSubType(st: string) {
  //     this.selectedSubType = st;
  //     this.searchSubType = '';
  //     this.openDropdown = null;
  //   }
  
  //   selectMajor(m: MajorSubjectArea) {
  //     this.selectedMajor = m;
  //     this.activeDropdown = null;
  //     this.searchMajor = '';
  //   }
  
  
  //   selectAgency(agency: Organization) {
  //     this.selectedAgency = agency;
  //     this.searchAgency = '';
  //     this.activeDropdown = null;
  //   }
  
  //   filteredAgency(): Organization[] {
  //     if (!this.searchAgency) return this.organizations;
  
  //     return this.organizations.filter((o) =>
  //       o.faculty.toLowerCase().includes(this.searchAgency.toLowerCase())
  //     );
  //   }
  
  //   filteredMajor(): MajorSubjectArea[] {
  //     if (!this.searchMajor) return this.subOrgan;
  
  //     const keyword = this.searchMajor.toLowerCase();
  //     return this.subOrgan.filter((m) =>
  //       m.name_th.toLowerCase().includes(keyword)
  //     );
  //   }
  
  //   filteredSubs() {
  //     if (!this.selectedMajor) return [];
  
  //     return (this.selectedMajor.children || []).filter((s: SubSubjectArea) =>
  //       (s.name_th || '')
  //         .toLowerCase()
  //         .includes((this.searchSub || '').toLowerCase())
  //     );
  //   }
  
  //   filteredSubSubs() {
  //     if (!this.selectedSub) return [];
  
  //     return (this.selectedSub.children || []).filter((ss: Child) =>
  //       (ss.name_th || '')
  //         .toLowerCase()
  //         .includes((this.searchSubSub || '').toLowerCase())
  //     );
  //   }
  
  //   filteredFaculties(): string[] {
  //     if (!this.searchFaculitie) return this.faculties;
  
  //     return this.faculties.filter((f) =>
  //       f.toLowerCase().includes(this.searchFaculitie.toLowerCase())
  //     );
  //   }
  
  //   filteredType() {
  //     return this.typeList.filter((t) =>
  //       t.toLowerCase().includes(this.searchType.toLowerCase())
  //     );
  //   }
  
  //   filteredSubType() {
  //     if (!this.selectedType) return [];
  //     return this.subTypeMap[this.selectedType].filter((st: string) =>
  //       st.toLowerCase().includes(this.searchSubType.toLowerCase())
  //     );
  //   }
  
    
  
  //   goToResearch(id: number, type: 'ARTICLE' | 'PROJECT' | 'INNOVATION') {
  //     const routeMap: any = {
  //       PROJECT: 'project',
  //       ARTICLE: 'article',
  //       INNOVATION: 'innovation',
  //     };
  
  //     const mappedType = routeMap[type];
  
  //     let basePath = '/performance';
  
  //     if (this.authService.isLoggedIn()) {
  //       basePath = this.authService.isAdmin()
  //         ? '/admin/performance-by-departmaent'
  //         : '/user/performance-by-departmaent';
  //     }
  
  //     this.router.navigate([basePath, mappedType, id]);
  //   }
  
  //   get displayRange(): string {
  //     if (!this.date_from || !this.date_to) return '';
  
  //     const format = (d: Date) =>
  //       `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
  
  //     return `${format(this.date_from)} - ${format(this.date_to)}`;
  //   }
  
  //   format(date: Date): string {
  //     return date.toLocaleDateString('en-GB');
  //   }
  
  //   onPickerClose() {
  //     if (this.date_from && !this.date_to) {
  //       this.date_to = this.date_from;
  //     }
  //   }
  
  //   onSearch(): void {
  //     const keyword = this.searchText?.trim().toLowerCase();
    
  //     if (!keyword) {
  //       this.filteredResearchers = [...this.allTableData];
  //     } else {
  //       this.filteredResearchers = this.allTableData.filter((item: any) => {
  //         return (
  //           item.title_th?.toLowerCase().includes(keyword) ||
  //           item.title_en?.toLowerCase().includes(keyword) ||
  //           item.own?.name?.toLowerCase().includes(keyword) ||
  //           item.type?.toLowerCase().includes(keyword)
  //         );
  //       });
  //     }
    
  //     this.currentPage = 1;
  //     this.updatePagination();
  //   }
  
  //   updatePagination(): void {
  //     const start = (this.currentPage - 1) * this.pageSize;
  //     const end = start + this.pageSize;
  
  //     this.paginationData = this.filteredResearchers.slice(start, end);
  //   }
  
  //   changePage(page: number) {
  //     if (page < 1 || page > this.totalPages) return;
  //     if (page === this.currentPage) return;
  
  //     this.currentPage = page;
  //     this.updatePagination();
  //   }
  
  //   get totalPages(): number {
  //     return Math.ceil(this.filteredResearchers.length / this.pageSize);
  //   }
  //   get totalItems(): number {
  //     return this.filteredResearchers.length;
  //   }
  //   get pages(): number[] {
  //     return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  //   }
  
  //   formatThaiDate(date: Date): string {
  //     const d = new Date(date);
  //     const day = d.getDate();
  //     const month = d.toLocaleDateString('th-TH', { month: 'long' });
  //     const year = d.getFullYear() + 543;
  
  //     return `${day} ${month} ${year}`;
  //   }
  
  //   search() {
  //     const payload: SearchResearchRequest = {};
  
  //     if (this.researchItems?.trim()) {
  //       payload.q = this.researchItems.trim();
  //     }
  
  //     if (this.selectedType) {
  //       payload.type = this.mapTypeToApi(this.selectedType);
  //     }
  
  //     if (this.selectedAgency?.id) {
  //       payload.org_id = this.selectedAgency.id;
  //     }
  
  //     if (this.selectedFunding) {
  //       payload.funding = this.selectedFunding;
  //     }
  
  //     if (this.selectedSub?.sub_id) {
  //       payload.subject_area_id = this.selectedSub.sub_id;
  //     }
  
  //     if (this.date_from) {
  //       payload.year = this.date_from.getFullYear();
  //     }
  
  //     if (this.date_from) {
  //       payload.date_from = this.formatDateForApi(this.date_from);
  //     }
  
  //     if (this.date_to) {
  //       payload.date_to = this.formatDateForApi(this.date_to);
  //     }
  
  //     this.loading = true;
  
  //     this.service.searchData(payload).subscribe({
  //       next: (res) => {
  //         this.isSearched = true;
      
  //         const data = res.data;
  //         console.log(data);
      
  //         this.searchResults = data.result;
  //         this.allTableData = [...data.result];
  //         this.filteredResearchers = data.result;
      
  //         // ✅ ใช้ data.graph สร้าง chart
  //         this.chartOptions = {
  //           colorSet: 'customColorSet',
  //           animationEnabled: true,
  //           data: [
  //             {
  //               type: 'doughnut',
  //               yValueFormatString: '#,##0',
  //               indexLabel: '{name} ({y})',
  //               dataPoints: data.graph.map((g: any) => ({
  //                 name: g.oecd_name,
  //                 y: g.count,
  //               })),
  //             },
  //           ],
  //         };
      
  //         this.donutSeries = data.graph.map((g) => g.count);
  //         this.donutLabels = data.graph.map((g) => g.oecd_name);
  //         this.totalResearchers = data.total;
      
  //         // 🔥 render
  //         if (this.chart) {
  //           this.chart.render();
  //         }
      
  //         this.currentPage = 1;
  //         this.updatePagination();
  //       },
  //     });
  //   }
  
  //   formatDateForApi(date: Date): string {
  //     const yyyy = date.getFullYear();
  //     const mm = String(date.getMonth() + 1).padStart(2, '0');
  //     const dd = String(date.getDate()).padStart(2, '0');
  
  //     return `${yyyy}-${mm}-${dd}`;
  //   }
  
  //   mapTypeToApi(type: string): 'ARTICLE' | 'PROJECT' | 'INNOVATION' {
  //     const map: any = {
  //       บทความ: 'ARTICLE',
  //       วารสาร: 'ARTICLE',
  //       โครงการวิจัย: 'PROJECT',
  //       นวัตกรรมสิ่งประดิษฐ์: 'INNOVATION',
  //     };
  
  //     return map[type];
  //   }
  
  //   trackById(index: number, item: any): number {
  //     return item.id;
  //   }
  
  //   // SUB
  //   selectSub(sub: SubSubjectArea): void {
  //     this.selectedSub = sub;
  //     this.selectedFaculty = sub.name_th;
  
  //     const major = this.subOrgan.find((m) =>
  //       m.children.some((c) => c.sub_id === sub.sub_id)
  //     );
  
  //     if (major) {
  //       this.selectedMajor = major;
  //       this.activeMajor = major;
  //     }
  
  //     this.activeDropdown = null;
  //   }
  
  //   toggleMajor(major: MajorSubjectArea, event: Event): void {
  //     event.stopPropagation();
  
  //     this.activeMajor =
  //       this.activeMajor?.major_id === major.major_id ? null : major;
  //   }
  
  //   onSearchMajor(): void {
  //     const keyword = this.searchMajor.toLowerCase();
  
  //     this.filteredMajors = this.subOrgan.filter((m) =>
  //       m.name_th.toLowerCase().includes(keyword)
  //     );
  //   }
  
  //   getTypeLabel(type: 'ARTICLE' | 'PROJECT' | 'INNOVATION'): string {
  //     const map = {
  //       PROJECT: 'โครงการวิจัย',
  //       ARTICLE: 'บทความ / วารสาร',
  //       INNOVATION: 'นวัตกรรม',
  //     };
  
  //     return map[type] ?? '-';
  //   }
  
  //   getChartInstance(chart: any) {
  //     this.chart = chart;
  //   }
}
