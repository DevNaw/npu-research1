import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

import { ResearchData } from '../../models/research.model';
import { ResearchService } from '../../services/research.service';
import { ArticleForm, Major, SubArea } from '../../models/subject.model';
import { Researcher } from '../../models/researchers.model';
import {
  ExternalMemberRow,
  InternalMemberRow,
} from '../../models/member.model';

const FIRST_AUTHOR = 'หัวหน้าโครงการ';

const DEFAULT_RESEARCH: ResearchData = {
  id: 0,
  title_th: '',
  title_en: '',
  abstract: '',
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
  status: '',
  responsibilities: '',
  subject_area_id: 0,
  internal_members: [{ user_id: 0, role: '', no: '' }],
  external_members: [{ full_name: '', role: '', organization: '', no: '' }],
  full_report: null,
  contract_file: null,
};

@Component({
  selector: 'app-user-add-research',
  standalone: false,
  templateUrl: './user-add-research.component.html',
  styleUrl: './user-add-research.component.css',
})
export class UserAddResearchComponent {
  isEdit = false;
  researchId?: number;

  researchers: Researcher[] = [];
  filteredResearchers: Researcher[] = [];

  reportFileName = '';
  selectedFileName = '';
  selectedMajor: Major | null = null;
  searchMajor = '';
  selectedSub: SubArea | null = null;

  activeDropdown: string | null = null;

  selectedFile: File | null = null;
  reportFile: File | null = null;

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
  };

  researchData: ResearchData = { ...DEFAULT_RESEARCH };

  internalRows: InternalMemberRow[] = [
    {
      id: 0,
      researcher_id: null,
      name: '',
      responsibilities: '',
    },
  ];

  externalRows: ExternalMemberRow[] = [
    {
      name: '',
      organization: '',
      responsibilities: '',
    },
  ];
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
  }
  // =========================== Load Data ===========================
  loadSubjectAreas(): void {
    this.researchService.getSubjectArea().subscribe({
      next: (res) => {
        this.major = res.data.subject_areas;
      },
      error: (err) => {
        console.error('โหลด Subject Area ไม่สำเร็จ', err);
      },
    });
  }

  loadResearcherData() {
    this.researchService.getResearchers().subscribe({
      next: (res) => {
        this.researchers = res.data.$researchers ?? [];
        this.filteredResearchers = this.researchers;
      },
      error: (err) => console.error('Failed to load researchers:', err),
    });
  }

  loadResearchData(id: number): void {
    this.researchService.getProjectById(id).subscribe({
      next: (res) => {
        const data = res.data.project;
        this.researchData = {
          ...this.researchData,
          ...data,
        };

        this.reportFileName = data.full_report_file_name ?? '';
        this.selectedFileName = data.contract_file_name ?? '';

        if (data.internal_members?.length) {
          this.internalRows = data.internal_members.map(
            (m: any, index: number) => ({
              id: index,
              researcher_id: m.user_id,
              name: m.full_name,
              responsibilities: m.role,
            })
          );
        }

        if (data.external_members?.length) {
          this.externalRows = data.external_members.map((m: any) => ({
            name: m.full_name,
            organization: m.organization,
            responsibilities: m.role,
          }));
        }

        if (this.researchData.subject_area_id) {
          for (const m of this.major) {
            const foundSub = m.children.find(
              (s) => s.sub_id === this.researchData.subject_area_id
            );
            if (foundSub) {
              this.selectedMajor = m;
              this.selectedSub = foundSub;
              break;
            }
          }
        }
      },
      error: (err) => console.error('Failed to load research data:', err),
    });
  }

  // =========================== Toggle Event Handlers ===========================
  toggle(type: string, event: MouseEvent) {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === type ? null : type;
  }

  toggleMajor(major: Major, event: Event): void {
    event.stopPropagation();

    this.activeMajor =
      this.activeMajor?.major_id === major.major_id ? null : major;
  }

  @HostListener('document:click')
  closeAllDropdowns() {
    this.activeDropdown = null;
    this.activeMajor = null;
    this.activeRowIndex = null;
  }

  // =========================== Select Value ===========================
  selectValue<K extends keyof ResearchData>(
    field: K,
    value: ResearchData[K]
  ): void {
    if (
      field === 'responsibilities' &&
      value === FIRST_AUTHOR &&
      this.isFirstAuthorTaken()
    ){return;}

    this.researchData[field] = value;

    if (field === 'source_funds') {
      this.researchData.name_funding = '';
    }
      
    this.activeDropdown = null;
  }

  selectSub(sub: SubArea) {
    this.selectedSub = sub;
    this.researchData.subject_area_id = sub.sub_id;
    this.activeDropdown = null;
    this.activeMajor = null;

    this.research.major_id = sub.major_id;
    this.research.sub_id = sub.sub_id;
  }

  selectResponsibility(row: any, value: string): void {
    if (value === FIRST_AUTHOR && this.isFirstAuthorTaken(row)) {
      return;
    }

    row.responsibilities = value;
    this.activeDropdown = null;
  }

  trackByIndex(index: number) {
    return index;
  }

  selectStatus(status: string) {
    this.researchData.status = status;
    this.activeDropdown = null;
  }

  // ============================ Filter ===========================
  filteredMajor(): Major[] {
    if (!this.searchMajor) return this.major;

    const keyword = this.searchMajor.toLowerCase();
    return this.major.filter((m) => m.name_en.toLowerCase().includes(keyword));
  }

  isFirstAuthorTaken(currentRow?: any): boolean {
    if (this.researchData.responsibilities === FIRST_AUTHOR) return true;
    return [...this.internalRows, ...this.externalRows].some(
      (row) => row !== currentRow && row.responsibilities === FIRST_AUTHOR
    );
  }

  // =========================== Add/Remove Member ===========================
  addInternal(): void {
    this.internalRows.push({
      id: Date.now(),
      researcher_id: null,
      name: '',
      responsibilities: '',
    });
  }

  removeInternal(index: number): void {
    this.internalRows.splice(index, 1);
  }

  addExternal() {
    this.externalRows.push({
      name: '',
      organization: '',
      responsibilities: '',
    });
  }

  removeExternal(index: number) {
    this.externalRows.splice(index, 1);
  }

  // ====================== Researcher & Role Selection =======================
  onFocus(index: InternalMemberRow): void {
    this.activeRowIndex = index.id;
    this.filteredResearchers = this.researchers;
  }

  onSearch(value: string): void {
    this.filteredResearchers = value
      ? this.researchers.filter((r) =>
          r.full_name.toLowerCase().includes(value.toLowerCase())
        )
      : this.researchers;
  }

  selectResearcher(r: Researcher, row: InternalMemberRow): void {
    row.name = r.full_name;
    row.researcher_id = r.user_id;

    this.activeRowIndex = null;
  }

  // ============= File =================
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
    }
  }

  onReportFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.reportFile = input.files[0];
      this.reportFileName = this.reportFile.name;
    }
  }

  // ============== Submit Research ==============
  submitResearch() {
    const formData = this.prepareFormData();

    Swal.fire({
      title: 'กำลังบันทึก...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const request$ = this.isEdit
      ? this.researchService.updateProject(this.researchData.id, formData)
      : this.researchService.createProject(formData);

    request$.subscribe({
      next: () => this.handleSuccess(),
      error: () => this.handleError(),
    });
  }

  // ============== FormData Preparation ==============
  private prepareFormData(): FormData {
    const fd = new FormData();
    const d = this.researchData;

    Object.entries(d).forEach(([key, value]) => {
      if (
        value !== null &&
        value !== undefined &&
        value !== '' &&
        !Array.isArray(value)
      ) {
        fd.append(key, value as any);
      }
    });

    this.appendMembers(fd);

    if (this.selectedFile) {
      fd.append('contract_file', this.selectedFile);
    }

    if (this.reportFile) {
      fd.append('full_report', this.reportFile);
    }

    return fd;
  }

  private resetForm() {
    this.researchData = { ...DEFAULT_RESEARCH };
    this.internalRows = [
      {
        id: 0,
        researcher_id: null,
        name: '',
        responsibilities: '',
      },
    ];
    this.externalRows = [
      {
        name: '',
        organization: '',
        responsibilities: '',
      },
    ];
    this.selectedFile = null;
    this.reportFile = null;
    this.selectedFileName = '';
    this.reportFileName = '';
  }

  private appendMembers(fd: FormData): void {
    this.internalRows
      .filter(r => r.researcher_id)
      .forEach((r, i) => {
        fd.append(`internal_members[${i}][user_id]`, String(r.researcher_id));
        fd.append(`internal_members[${i}][role]`, r.responsibilities ?? '');
        fd.append(`internal_members[${i}][no]`, String(i + 1));
      });

    this.externalRows
      .filter(r => r.name)
      .forEach((r, i) => {
        fd.append(`external_members[${i}][full_name]`, r.name);
        fd.append(`external_members[${i}][role]`, r.responsibilities ?? '');
        fd.append(`external_members[${i}][organization]`, r.organization);
        fd.append(`external_members[${i}][no]`, String(i + 1));
      });
  }

  private handleSuccess(): void {
    Swal.fire({
      icon: 'success',
      title: this.isEdit ? 'อัพเดทสำเร็จ' : 'บันทึกสำเร็จ',
      timer: 1000,
      showConfirmButton: false,
    });

    if (this.isEdit) {
      this.router.navigate(['/performance/research', this.researchData.id]);
    } else {
      this.resetForm();
    }
  }

  private handleError(): void {
    Swal.fire({
      icon: 'error',
      title: this.isEdit ? 'อัพเดทไม่สำเร็จ' : 'บันทึกไม่สำเร็จ',
    });
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
}
