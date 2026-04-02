import { Component, HostListener } from '@angular/core';
import { Major, Sub, Child } from '../../models/subject.model';
import { ResearchProjectData } from '../../models/researchs-detai.model';
import { Researcher } from '../../models/researchers.model';
import {
  ExternalMemberRow,
  InternalMemberRow,
} from '../../models/member.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ResearchService } from '../../services/research.service';
import Swal from 'sweetalert2';
import { Funding } from '../../models/funding.model';
import { FundingService } from '../../services/funding.service';
import { MainComponent } from '../../shared/layouts/main/main.component';

const FIRST_AUTHOR = 'หัวหน้าโครงการ';

const DEFAULT_RESEARCH: ResearchProjectData = {
  id: 0,
  title_th: '',
  title_en: '',
  abstract: '',
  abstract_en: '',
  keywords: [],
  year: '',
  status: '',
  published_date: '',
  call_other: null,
  image: '',
  source_funds: '',
  name_funding: '',
  budget_amount: '',
  year_received_budget: 0,
  research_area: '',
  usable_area: '',
  start_date: '',
  end_date: '',
  responsibilities: '',
  subject_area_id: 0,
  internal_members: [{ user_id: 0, role: '', no: '' }],
  external_members: [{ full_name: '', role: '', organization: '', no: '' }],
  full_report: null,
  contract_file: null,
  oecd_id: 0,
  funding_code: '',
  funding_id: null,
};

@Component({
  selector: 'app-edit-projects',
  standalone: false,
  templateUrl: './edit-projects.component.html',
  styleUrl: './edit-projects.component.css',
})
export class EditProjectsComponent {
  isEdit = false;
  activeDropdown: string | null = null;
  activeRowIndex: number | null = null;
  activeMajor: Major | null = null;

  oecdList: Major[] = [];

  selectedMajor: Major | null = null;
  selectedSub: Sub | null = null;
  selectedSubSub: Child | null = null;

  researchers: Researcher[] = [];
  filteredResearchers: Researcher[] = [];

  internalRow: InternalMemberRow[] = [
    { id: 0, researcher_id: null, name: '', responsibilities: '' },
  ];
  externalRow: ExternalMemberRow[] = [
    { name: '', organization: '', responsibilities: '' },
  ];

  selectedFileName = '';
  selectedFile: File | null = null;
  selectedContractFile: File | null = null;
  selectedContractFileName = '';

  projectData: ResearchProjectData = { ...DEFAULT_RESEARCH };

  fundings: Funding[] = [];

  abstractType: string = '';
  keywordInput = '';
  keywordInputEn = '';
  thaiYears: number[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ResearchService,
    private fundingService: FundingService
  ) {}

  ngOnInit(): void {
    MainComponent.showLoading();
    this.loadSubjectArea();
    this.loadResearchersData();
    this.loadFundings();
    this.generateThaiYears();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEdit = true;
        this.projectData.id = +id;
        this.loadProjectData(this.projectData.id);
      } else {
        this.isEdit = false;
      }
      MainComponent.hideLoading();
    });
  }

  // =========== Load Data ==========
  loadSubjectArea(): void {
    this.service.getSubjectArea().subscribe({
      next: (res) => {
        this.oecdList = res.data.oecd;
      },
      error: (err) => console.error('Failed to load Subject Area:', err),
    });
  }

  loadFundings(): void {
    this.fundingService.getFundings().subscribe({
      next: (res) => {
        this.fundings = res.data.fundings;
      },
      error: (err) => console.error('Failed to load fundings:', err),
    });
  }

  loadResearchersData(): void {
    this.service.getResearchers().subscribe({
      next: (res) => {
        this.researchers = res.data.$researchers ?? [];
        this.filteredResearchers = this.researchers;
      },
      error: (err) => console.error('Failed to load researchers:', err),
    });
  }

  loadProjectData(id: number): void {
    this.service.getProjectById(id).subscribe({
      next: (res) => {
        const data = res.data.projectDetail;
        const oecd = data.oecd?.[0];

        if (oecd) {
          this.selectedMajor = {
            major_id: oecd.major_id,
            name_th: oecd.name_th,
            children: [oecd.children],
          };
          this.selectedSub = oecd.children;
          this.selectedSubSub = oecd.children?.children;
        }

        this.projectData = {
          ...this.projectData,
          ...data,
          keywords: data.keywords?.map((k: any) => k.keyword) ?? [],
        };

        if (data.abstract) {
          this.abstractType = 'th';
        } else if (data.abstract_en) {
          this.abstractType = 'en';
        }

        this.selectedFileName = data.full_report?.file_name ?? '';
        this.selectedContractFileName = data.contract_file?.file_name ?? '';

        if (data.internal_members?.length) {
          this.internalRow = data.internal_members.map(
            (m: any, index: number) => ({
              id: index,
              researcher_id: m.user_id,
              name: m.full_name ?? '',
              responsibilities: m.role ?? '',
            })
          );
        }

        if (data.external_members?.length) {
          this.externalRow = data.external_members.map(
            (m: any, index: number) => ({
              id: index + 1,
              name: m.full_name ?? '',
              organization: m.organization ?? '',
              responsibilities: m.role ?? '',
            })
          );
        }
      },
      error: (err) => console.error('Failed to load project:', err),
    });
  }

  // =========== Dropdown ==========
  toggleDropdown(type: string, event: Event): void {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === type ? null : type;
  }

  @HostListener('document:click')
  closeAll(): void {
    this.activeDropdown = null;
    this.activeMajor = null;
    this.activeRowIndex = null;
  }

  selectValue<K extends keyof ResearchProjectData>(
    field: K,
    value: ResearchProjectData[K]
  ): void {
    if (
      field === 'responsibilities' &&
      value === FIRST_AUTHOR &&
      this.isFirstAuthorTaken()
    )
      return;

    this.projectData[field] = value;
    this.activeDropdown = null;
  }

  selectMajor(m: Major): void {
    this.selectedMajor = m;
    this.selectedSub = null;
    this.selectedSubSub = null;
    this.projectData.subject_area_id = 0;
    this.activeDropdown = null;
  }

  selectSub(sub: any): void {
    this.selectedSub = sub;
    this.projectData.subject_area_id = sub.sub_id;

    const major = this.oecdList.find((m) =>
      m.children.some((c) => c.sub_id === sub.sub_id)
    );

    if (major) {
      this.selectedMajor = major;
      this.activeMajor = major;
    }

    this.activeDropdown = null;
  }

  selectSubSub(subSub: any): void {
    this.selectedSubSub = subSub;
    this.projectData.subject_area_id = subSub.child_id;
    this.activeDropdown = null;
  }

  selectYear(year: number): void {
    this.projectData.year_received_budget = year;
    this.activeDropdown = null;
  }

  selectRowResponsibility(row: any, value: string): void {
    if (value === FIRST_AUTHOR && this.isFirstAuthorTaken(row)) return;
    row.responsibilities = value;
    this.activeDropdown = null;
  }

  // =========== Researchers ==========
  selectResearcher(r: Researcher, row: InternalMemberRow): void {
    if (this.isResearcherAlreadySelected(r.user_id, row)) {
      Swal.fire({
        icon: 'warning',
        title: 'เลือกซ้ำไม่ได้',
        text: 'ผู้ร่วมโครงการคนนี้ถูกเลือกแล้ว',
        confirmButtonColor: '#3085d6',
      });
      return;
    }

    row.name = r.full_name;
    row.researcher_id = r.user_id;
    this.activeRowIndex = null;
  }

  onFocus(row: InternalMemberRow): void {
    this.activeRowIndex = row.id;
    this.filteredResearchers = this.researchers;
  }

  onSearch(value: string): void {
    this.filteredResearchers = value
      ? this.researchers.filter((r) =>
          r.full_name?.toLowerCase().includes(value.toLowerCase())
        )
      : this.researchers;
  }

  isResearcherAlreadySelected(userId: number, currentRow: InternalMemberRow): boolean {
    return this.internalRow.some(
      (row) => row !== currentRow && row.researcher_id === userId
    );
  }

  getAvailableResearchers(row: InternalMemberRow): Researcher[] {
    return this.filteredResearchers.filter(
      (res) =>
        !this.internalRow.some(
          (r) => r !== row && r.researcher_id === res.user_id
        )
    );
  }

  // =========== Members ==========
  isFirstAuthorTaken(excludeRow?: any): boolean {
    if (this.projectData.responsibilities === FIRST_AUTHOR) return true;
    return [...this.internalRow, ...this.externalRow].some(
      (row) => row !== excludeRow && row.responsibilities === FIRST_AUTHOR
    );
  }

  addInternalRow(): void {
    this.internalRow.push({
      id: this.internalRow.length,
      researcher_id: null,
      name: '',
      responsibilities: '',
    });
  }

  removeInternalRow(index: number): void {
    this.internalRow.splice(index, 1);
  }

  addExternalRow(): void {
    this.externalRow.push({ name: '', organization: '', responsibilities: '' });
  }

  removeExternalRow(index: number): void {
    this.externalRow.splice(index, 1);
  }

  trackById(index: number): number {
    return index;
  }

  // =========== Files ==========
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.selectedFileName = '';
    this.projectData.full_report = null;
  }

  onContractFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedContractFile = input.files[0];
      this.selectedContractFileName = this.selectedContractFile.name;
    }
  }

  removeContractFile(): void {
    this.selectedContractFile = null;
    this.selectedContractFileName = '';
    this.projectData.contract_file = null;
  }

  // =========== Keywords ==========
  addKeyword(event: KeyboardEvent, type: 'th' | 'en'): void {
    if (event.key !== 'Enter') return;
    event.preventDefault();

    if (this.projectData.keywords.length >= 5) return;

    if (type === 'th' && this.keywordInput.trim()) {
      this.projectData.keywords.push(this.keywordInput.trim());
      this.keywordInput = '';
    }

    if (type === 'en' && this.keywordInputEn.trim()) {
      this.projectData.keywords.push(this.keywordInputEn.trim());
      this.keywordInputEn = '';
    }
  }

  removeKeyword(i: number): void {
    this.projectData.keywords.splice(i, 1);
  }

  removeKeywordEn(i: number): void {
    this.projectData.keywords.splice(i, 1);
  }

  onAbstractTypeChange(type: 'th' | 'en'): void {
    this.abstractType = type;
    this.projectData.keywords = [];

    if (type === 'en') {
      this.keywordInputEn = '';
      this.projectData.abstract_en = '';
    } else {
      this.keywordInput = '';
      this.projectData.abstract = '';
    }
  }

  handleTab(event: KeyboardEvent): void {
    if (event.key !== 'Tab') return;
    event.preventDefault();

    const textarea = event.target as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const tab = '\t';

    textarea.value =
      textarea.value.substring(0, start) + tab + textarea.value.substring(end);
    textarea.selectionStart = textarea.selectionEnd = start + tab.length;

    this.projectData.abstract = textarea.value;
  }

  // =========== Filters ==========
  filteredSubs(): Sub[] {
    return (this.selectedMajor?.children || []) as Sub[];
  }

  filteredSubSubs(): Child[] {
    return (this.selectedSub?.children || []) as Child[];
  }

  generateThaiYears(): void {
    const currentYear = new Date().getFullYear() + 543;
    this.thaiYears = Array.from({ length: 70 }, (_, i) => currentYear - i);
  }

  // =========== Submit ==========
  validateForm(): boolean {
    const d = this.projectData;

    if (
      !d.title_th ||
      !d.title_en ||
      !d.source_funds ||
      !d.name_funding ||
      !d.budget_amount ||
      !d.year_received_budget
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'กรอกข้อมูลไม่ครบ',
        text: 'กรุณากรอกข้อมูลบทความให้ครบถ้วน',
      });
      return false;
    }

    if (this.internalRow.some((r) => r.researcher_id && !r.responsibilities)) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลผู้ร่วมโครงการไม่ครบ',
        text: 'กรุณาเลือกประเภทความรับผิดชอบให้ครบ',
      });
      return false;
    }

    if (
      this.externalRow.some(
        (r) => (r.name && !r.responsibilities) || (r.responsibilities && !r.name)
      )
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลผู้ร่วมภายนอกไม่ครบ',
        text: 'กรุณากรอกชื่อและประเภทความรับผิดชอบให้ครบ',
      });
      return false;
    }

    return true;
  }

  buildFormData(): FormData {
    const fd = new FormData();
    const d = this.projectData;

    const required = (key: string, val: any) =>
      fd.append(key, val !== null && val !== undefined ? String(val) : '');

    const optional = (key: string, val: any) => {
      if (val !== null && val !== undefined && val !== '') {
        fd.append(key, val);
      }
    };

    required('title_th', d.title_th);
    required('title_en', d.title_en);
    optional('abstract', d.abstract);
    optional('abstract_en', d.abstract_en);

    d.keywords.forEach((k, i) => fd.append(`keywords[${i}]`, k));

    required('published_date', d.published_date);
    required('source_funds', d.source_funds);
    required('name_funding', d.name_funding);
    required('budget_amount', d.budget_amount);
    required('year_received_budget', d.year_received_budget);
    optional('research_area', d.research_area);
    optional('usable_area', d.usable_area);
    optional('responsibilities', d.responsibilities);
    required('status', d.status);

    if (d.subject_area_id > 0)
      fd.append('subject_area_id', String(d.subject_area_id));
    if (this.selectedFile) fd.append('full_report', this.selectedFile);
    if (this.selectedContractFile)
      fd.append('contract_file', this.selectedContractFile);

    required('oecd_id', this.selectedSubSub?.child_id ?? '');
    optional('funding_code', d.funding_code);
    optional('funding_id', d.funding_id);

    const sortedRows = [...this.internalRow].sort((a, b) => {
      const aFirst = a.responsibilities?.includes('หัวหน้าโครงการ') ? 0 : 1;
      const bFirst = b.responsibilities?.includes('หัวหน้าโครงการ') ? 0 : 1;
      return aFirst - bFirst;
    });

    sortedRows
      .filter((r) => r.researcher_id)
      .forEach((r, i) => {
        const no = r.responsibilities?.includes('หัวหน้าโครงการ') ? 0 : i + 1;

        fd.append(`internal_members[${i}][user_id]`, String(r.researcher_id));
        fd.append(`internal_members[${i}][role]`, r.responsibilities ?? '');
        fd.append(`internal_members[${i}][no]`, String(no));
      });

    this.externalRow
      .filter((r) => r.name)
      .forEach((r, i) => {
        fd.append(`external_members[${i}][full_name]`, r.name);
        fd.append(`external_members[${i}][role]`, r.responsibilities ?? '');
        fd.append(`external_members[${i}][organization]`, r.organization);
        fd.append(`external_members[${i}][no]`, String(i + 1));
      });

    return fd;
  }

  submit(): void {
    if (!this.validateForm()) return;

    const formData = this.buildFormData();

    Swal.fire({
      title: 'กำลังบันทึก...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    this.service.adminUpdateProject(this.projectData.id, formData).subscribe({
      next: (res: any) => {
        Swal.fire({
          icon: 'success',
          title: 'อัพเดทสำเร็จ',
          showConfirmButton: false,
          timer: 1000,
        });
        window.location.reload();
        window.scrollTo(0, 0);
      },
      error: (err) => {
        console.error(err);
        Swal.fire({ icon: 'error', title: 'อัพเดทไม่สำเร็จ' });
      },
    });
  }

  resetForm(): void {
    this.projectData = { ...DEFAULT_RESEARCH };
    this.internalRow = [{ id: 0, researcher_id: null, name: '', responsibilities: '' }];
    this.externalRow = [{ name: '', organization: '', responsibilities: '' }];
    this.selectedFile = null;
    this.selectedFileName = '';
    this.selectedContractFile = null;
    this.selectedContractFileName = '';
    this.selectedMajor = null;
    this.selectedSub = null;
  }

  goToResearchDetail(): void {
    this.router.navigate(['/admin/manage-project']);
  }
}