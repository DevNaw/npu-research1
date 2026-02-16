import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import {
  Responsibility,
  ResponsibilityRole,
  InternalPerson,
  ExternalPerson,
} from '../../models/add.research.model';

import { ResearchData } from '../../models/research.model';
import { ResearchService } from '../../services/research.service';
import { ArticleForm, Major, SubArea } from '../../models/subject.model';
import { Researcher } from '../../models/researchers.model';

@Component({
  selector: 'app-user-add-research',
  standalone: false,
  templateUrl: './user-add-research.component.html',
  styleUrl: './user-add-research.component.css',
})
export class UserAddResearchComponent {
  openDropdown: string | null = null;
  isEdit = false;
  researchId?: number;

  researchers: Researcher[] = [];
  filteredResearchers: Researcher[] = [];

  reportFileName = '';
  selectedFileName = '';
  selectedMajor: Major | null = null;
  searchMajor = '';
  searchSub = '';
  selectedSub: SubArea | null = null;

  activeDropdown: string | null = null;

  isResponsibilityOpen = false;
  openInternalIndex: number | null = null;
  openExternalIndex: number | null = null;
  openStatus: number | null = null;

  activeMajor: Major | null = null;
  activeRowIndex: number | null = null;

  research: ArticleForm = {
    responsibility: '',
    type: '',
    database_types: '',
    quality: '',
    major_id: null,
    sub_id: null,
  }

  researchData: ResearchData = {
    id: 0,
    title_th: '',
    title_en: '',
    abstract: '',
    year: '',
    published_date: '',
    call_other: '',
    image: null,
    source_funds: '',
    name_funding: '',
    budget_amount: '',
    budget: '',
    year_received_budget: '',
    research_area: '',
    usable_area: '',
    start_date: '',
    end_date: '',
    internal_members: [],
    external_members: [],
    full_report: null,
    contract_file: null,
  };

  rows = [
    {
      name: '',
      responsibility: '',
      organization: '',
    },
  ];

  rows2 = [
    {
      id: Date.now(),
      name: '',
      responsibility: '',
    },
  ];

  internalPeople: InternalPerson[] = [];
  externalPeople: ExternalPerson[] = [];

  responsibilityRoles: ResponsibilityRole[] = [
    'ที่ปรึกษา',
    'ผู้เชี่ยวชาญ',
    'กรรมการ',
  ];

  isResponsibility = false;
  isResponsibilityOfInternal = false;
  isResponsibilityOfExternal = false;

  major: Major[] = [];

  fundType: string = '';
  fundName: string = '';

  internalFunds: string[] = [
    'งบประมาณมหาวิทยาลัย',
    'กองทุนวิจัยมหาวิทยาลัย',
    'คณะ/วิทยาลัย',
  ];

  externalFunds: string[] = [
    'สำนักงานการวิจัยแห่งชาติ (วช.)',
    'สกสว.',
    'กระทรวงการอุดมศึกษา',
    'หน่วยงานเอกชน',
  ];

  internalMembers = [
    {
      name: '',
      organization: '',
    },
  ];
  externalMembers = [
    {
      name: '',
      organization: '',
      role: '',
    },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private researchService: ResearchService
  ) {}

  ngOnInit() {
    this.loadSubjectAreas();
    this.loadResearcherData();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (id) {
        this.isEdit = true;
        this.researchId = +id;
        this.loadResearchData(this.researchId);
      } else {
        this.isEdit = false;
      }
    });

    this.addInternal();
    this.addExternal();
  }

  loadSubjectAreas() {
    this.researchService.getSubjectArea().subscribe({
      next: (res) => {
        this.major = res.data.subject_areas;
      },
      error: (err) => {
        console.error('โหลด Subject Area ไม่สำเร็จ', err);
      }
    });
  }

  loadResearcherData() {
    this.researchService.getResearchers().subscribe({
      next: (res) => {
        this.researchers = res.data.$researchers ?? [];
        this.filteredResearchers = this.researchers;
      }
    })
  }

  submit() {
  }

  loadResearchData(id: number) {
    console.log('แก้ไขงานวิจัย ID:', id);
  }

  addInternal() {
    this.internalMembers.push({
      name: '',
      organization: '',
    });
  }

  addExternal() {
    this.externalMembers.push({
      name: '',
      organization: '',
      role: '',
    });
  }

  removeInternal(index: number) {
    if (this.internalPeople.length > 1) {
      this.internalPeople.splice(index, 1);
    }
  }

  selectInternalRole(role: string, member: any) {
    member.organization = role;
    this.openInternalIndex = null;
  }

  selectExternalRole(role: string, member: any) {
    member.organization = role;
    this.openExternalIndex = null;
  }

  toggleInternal(index: number, event: Event) {
    event.stopPropagation();
    this.activeDropdown = 'internal';
    this.openInternalIndex = this.openInternalIndex === index ? null : index;
  }

  toggleExternal(index: number, event: Event) {
    event.stopPropagation();
    this.activeDropdown = 'external';
    this.openExternalIndex = this.openExternalIndex === index ? null : index;
  }

  toggle(type: string, event: MouseEvent) {
    event.stopPropagation();
    this.openDropdown = this.openDropdown === type ? null : type;
  }

  addRow(){
    this.rows = [
      ...this.rows,
      {
        name: '',
        responsibility: '',
        organization: '',
      },
    ];
  }

  removeRow(index: number) {
    // กันไม่ให้ลบแถวสุดท้าย
    if (this.rows.length > 1) {
      this.rows.splice(index, 1);
    }
  }

  addRow2() {
    this.rows2.push({id: Date.now()+ Math.random(), name: '', responsibility: '' });
  }

  removeRow2(index: number) {
    // กันไม่ให้ลบแถวสุดท้าย
    if (this.rows2.length > 1) {
      this.rows2.splice(index, 1);
    }
  }

  trackByIndex(index: number) {
    return index;
  }

  selectedFile: File | null = null;

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
    }
  }

  reportFile: File | null = null;

  onReportFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.reportFile = input.files[0];
      this.reportFileName = this.reportFile.name;
    }
  }

  toggleDropdown(type: string, event: Event): void {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === type ? null : type;
  }

  toggleMajor(major: Major, event: Event) {
    event.stopPropagation();
    
    if (this.activeMajor?.major_id === major.major_id) {
      this.activeMajor = null;
    } else {
      this.activeMajor = major;
    }
  }

  toggleStatus(event: Event) {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === 'status' ? null : 'status';
  }

  selectStatus(status: string) {
    // this.researchData.status = status;
    this.activeDropdown = null;
  }

  toggleResponsibility(event: Event) {
    event.stopPropagation();
    this.activeDropdown =
      this.activeDropdown === 'responsibility' ? null : 'responsibility';
  }

  selectResponsibility(value: string) {
    // this.researchData.responsibility = value;
    this.activeDropdown = null;
  }

  @HostListener('document:click')
  closeAllDropdowns() {
    this.activeDropdown = null;
    this.openInternalIndex = null;
  }

  onDocumentClick() {
    this.isResponsibility = false;
  }

  selectMajor(m: Major) {
    this.selectedMajor = m;
    this.openDropdown = null;
    this.searchMajor = '';
  }

  selectSub(sub: SubArea) {
    this.selectedSub = sub;
    this.activeDropdown = null;
    this.activeMajor = null;

    this.research.major_id = sub.major_id;
    this.research.sub_id = sub.sub_id;
  }

  filteredSub() {
    if (!this.selectedMajor) return [];

    return this.selectedMajor.children.filter((s) =>
    s.name_en.toLowerCase().includes(this.searchSub.toLowerCase()));
  }

  filteredMajor(): Major[] {
    if (!this.searchMajor) return this.major;

    return this.major.filter((m) =>
      m.name_en.toLowerCase().includes(this.searchMajor.toLowerCase())
    );
  }

  goToResearchDetail(type: string, id: number | string) {
    const role = localStorage.getItem('role');

    const base = role === 'admin' ? '/admin/performance' : '/user/performance';

    this.router.navigate([base, type, id]);
  }

  // ===== dropdown control =====
  toggleFunding(event: MouseEvent) {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === 'funding' ? null : 'funding';
  }

  toggleNameFunding(event: MouseEvent) {
    event.stopPropagation();
    this.activeDropdown =
      this.activeDropdown === 'fundName' ? null : 'fundName';
  }

  // ===== select funding =====
  selectFunding(type: string) {
    // this.researchData.funding = type;
    this.fundName = ''; // reset ชื่อแหล่งทุน
    this.activeDropdown = null;
  }

  // ===== select fund name =====
  selectFundName(name: string) {
    this.fundName = name;
    this.activeDropdown = null;
  }

  selectResearcher(r: Researcher, j: any) {
    j.name = r.full_name;
    j.user_id = r.user_id;

    this.activeRowIndex = null;
  }

  onFocus(index: any) {
    this.activeRowIndex = index.id;
    this.filteredResearchers = this.researchers;
  }

  onSearch(value: string) {
    if (!value) {
      this.filteredResearchers = this.researchers;
      return;
    }
    this.filteredResearchers = this.researchers.filter((r) =>
    r.full_name?.toLowerCase().includes(value.toLowerCase()));
  }

  isFirstAuthorTaken(currentRow?: any): boolean {
    if (
      this.research?.responsibility === 'First Author (ผู้ประพันธ์อันดับแรก)'
    ) {
      return true;
    }

    const allRows = [...this.rows2, ...this.rows];

    return allRows.some(
      (row) =>
        row !== currentRow &&
        row.responsibility === 'First Author (ผู้ประพันธ์อันดับแรก)'
    );
  }

  selectRowResponsibility(row: any, value: string) {
    if ( value === 'First Author (ผู้ประพันธ์อันดับแรก)' && this.isFirstAuthorTaken(row)) {
      return;
    }

    row.responsibility = value;
    this.activeDropdown = null;
  }
}
