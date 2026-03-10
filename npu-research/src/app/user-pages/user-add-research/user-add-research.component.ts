import { Component, HostListener } from '@angular/core';
import { Major, SubArea } from '../../models/subject.model';
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
  year_received_budget: '',
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
};

@Component({
  selector: 'app-user-add-research',
  standalone: false,
  templateUrl: './user-add-research.component.html',
  styleUrl: './user-add-research.component.css',
})
export class UserAddResearchComponent {
  isEdit = false;
  activeDropdown: string | null = null;
  activeRowIndex: number | null = null;
  activeMajor: Major | null = null;

  major: Major[] = [];
  selectedSub: SubArea | null = null;
  selectedMajor: Major | null = null;
  searchMajor = '';
  searchSub = '';

  researchers: Researcher[] = [];
  filteredResearchers: Researcher[] = [];
  searchResearcher = '';
  selectedResearcher: string | null = null;
  searchKeyword = '';

  keywordInput: string = '';

  internalRow: InternalMemberRow[] = [
    { id: 0, researcher_id: null, name: '', responsibilities: '' },
  ];
  externalRow: ExternalMemberRow[] = [
    { name: '', organization: '', responsibilities: '' },
  ];

  internalFunds: string[] = [
    'งบประมาณมหาวิทยาลัย',
    'งบประมาณคณะ',
    'งบประมาณภาควิชา',
  ];

  externalFunds: string[] = ['สำนักงานวิจัยแห่งชาติ', 'สกสว.', 'หน่วยงานเอกชน'];

  selectedFileName = '';
  selectedFile: File | null = null;
  selectedContractFile: File | null = null;
  selectedContractFileName = '';

  projectData: ResearchProjectData = { ...DEFAULT_RESEARCH };

  researchId?: number;
  reportFilename = '';
  projectId: number | null = null;

  fundings: Funding[] = [];

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
        this.major = res.data.subject_areas;
      },
      error: (err) => {
        console.error('Failed to load Subject Area:', err);
      },
    });
  }

  loadFundings(): void {
    this.fundingService.getFundings().subscribe({
      next: (res) => {
        this.fundings = res.data.fundings;
      },
      error: (err) => {
        console.error('Failed to load fundings:', err);
      },
    });
  }

  loadResearchersData(): void {
    this.service.getResearchers().subscribe({
      next: (res) => {
        this.researchers = res.data.$researchers ?? [];
        this.filteredResearchers = this.researchers;
      },
      error: (err) => {
        console.error('Failed to load researchers:', err);
      },
    });
  }

  loadProjectData(id: number): void {
    this.service.getProjectById(id).subscribe({
      next: (res) => {
        const data = res.data.projectDetail;

        this.projectData = {
          ...this.projectData,
          ...data,
          keywords: data.keywords?.map((k: any) => k.keyword) ?? []
        };

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

        if (this.projectData.subject_area_id) {
          for (const major of this.major) {
            const found = major.children.find(
              (s) => s.sub_id === this.projectData.subject_area_id
            );

            if (found) {
              this.selectedMajor = major;
              this.selectedSub = found;

              break;
            }
          }
        }
      },
      error: (err) => {
        console.error('Failed to load article:', err);
      },
    });
  }

  toggleDropdown(type: string, event: Event): void {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === type ? null : type;
  }

  @HostListener('document: click')
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

  selectSub(sub: SubArea): void {
    this.selectedSub = sub;
    this.projectData.subject_area_id = sub.sub_id;
    this.activeDropdown = null;
    this.activeMajor = null;
  }

  selectRowResponsibility(row: any, value: string) {
    if (value === FIRST_AUTHOR && this.isFirstAuthorTaken(row)) {
      return;
    }

    row.responsibilities = value;
    this.activeDropdown = null;
  }

  selectResearcher(r: Researcher, row: InternalMemberRow): void {

    if (this.isResearcherAlreadySelected(r.user_id, row)) {
      Swal.fire({
        icon: 'warning',
        title: 'เลือกซ้ำไม่ได้',
        text: 'ผู้ร่วมโครงการคนนี้ถูกเลือกแล้ว',
        confirmButtonColor: '#3085d6'
      });
      return;
    }
  
    row.name = r.full_name;
    row.researcher_id = r.user_id;
  
    this.activeRowIndex = null;
  }

  toggleMajor(major: Major, event: Event): void {
    event.stopPropagation();

    this.activeMajor =
      this.activeMajor?.major_id === major.major_id ? null : major;
  }

  filteredMajor(): Major[] {
    if (!this.searchMajor) return this.major;

    const keyword = this.searchMajor.toLowerCase();
    return this.major.filter((m) => m.name_en.toLowerCase().includes(keyword));
  }

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
    this.externalRow.push({
      name: '',
      organization: '',
      responsibilities: '',
    });
  }

  removeExternalRow(index: number): void {
    this.externalRow.splice(index, 1);
  }

  trackById(index: number) {
    return index;
  }

  onFocus(index: InternalMemberRow): void {
    this.activeRowIndex = index.id;
    this.filteredResearchers = this.researchers;
  }

  onSearch(value: string): void {
    this.filteredResearchers = value
      ? this.researchers.filter((r) =>
          r.full_name?.toLowerCase().includes(value.toLowerCase())
        )
      : this.researchers;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      this.selectedFile = file;
      this.selectedFileName = this.selectedFile.name;
    }
  }

  removeFile() {
    this.selectedFile = null;
    this.selectedFileName = '';
    this.projectData.full_report = null;
  }

  removeFileI() {
    this.selectedContractFile = null;
    this.selectedContractFileName = '';
    this.projectData.contract_file = null;
  }

  onContractFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      this.selectedContractFile = file;
      this.selectedContractFileName = this.selectedContractFile.name;
    }
  }

  removeContractFile() {
    this.selectedContractFile = null;
    this.selectedContractFileName = '';
    this.projectData.contract_file = null;
  }

  submit() {

    if (!this.validateForm()) {
      return;
    }
    const formData = this.buildFormData();

    Swal.fire({
      title: 'กำลังบันทึก...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });
    

    const request$ = this.isEdit
      ? this.service.updateProject(this.projectData.id, formData)
      : this.service.createProject(formData);

    request$.subscribe({
      next: (res: any) => {
        Swal.fire({
          icon: 'success',
          title: this.isEdit ? 'อัพเดทสำเร็จ' : 'บันทึกสำเร็จ',
          showConfirmButton: false,
          timer: 1000,
        });
        if (this.isEdit) {
          setTimeout(() => {
            this.router
              .navigate(['/performance/project', this.projectData.id])
              .then(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              });
          }, 1000);
        } else {
          this.router.navigate(['/performance/project', res.data.research_id]);
          this.resetForm();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: this.isEdit ? 'อัพเดทไม่สำเร็จ' : 'บันทึกไม่สำเร็จ',
        });
      },
    });
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
    required('abstract', d.abstract);
    required('abstract_en', d.abstract_en);
    
    d.keywords.forEach((k, i) => {
      fd.append(`keywords[${i}]`, k);
    });

    required('published_date', d.published_date);
    required('source_funds', d.source_funds);
    required('name_funding', d.name_funding);
    required('budget_amount', d.budget_amount);
    required('year_received_budget', d.year_received_budget);
    optional('research_area', d.research_area);
    optional('usable_area', d.usable_area);
    required('responsibilities', d.responsibilities);
    required('status', d.status);

    if (d.subject_area_id > 0)
      fd.append('subject_area_id', String(d.subject_area_id));
    if (this.selectedFile) fd.append('full_report', this.selectedFile);
    if (this.selectedContractFile)
      fd.append('contract_file', this.selectedContractFile);

    this.internalRow
      .filter((r) => r.researcher_id)
      .forEach((r, i) => {
        fd.append(`internal_members[${i}][user_id]`, String(r.researcher_id));
        fd.append(`internal_members[${i}][role]`, r.responsibilities ?? '');
        fd.append(`internal_members[${i}][no]`, String(i + 1));
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

  resetForm(): void {
    this.projectData = { ...DEFAULT_RESEARCH };
    this.internalRow = [
      { id: 0, researcher_id: null, name: '', responsibilities: '' },
    ];
    this.externalRow = [{ name: '', organization: '', responsibilities: '' }];
    this.selectedFile = null;
    this.selectedFileName = '';
    this.selectedContractFile = null;
    (this.selectedContractFileName = ''), (this.selectedMajor = null);
    this.selectedSub = null;
    this.searchMajor = '';
  }

  goToResearchDetail() {
    this.router.navigate(['/user/profile']);
  }

  isResearcherAlreadySelected(userId: number, currentRow: InternalMemberRow): boolean {
    return this.internalRow.some(
      row =>
        row !== currentRow &&
        row.researcher_id === userId
    );
  }

  getAvailableResearchers(row: InternalMemberRow): Researcher[] {
    return this.filteredResearchers.filter(res =>
      !this.internalRow.some(
        r => r !== row && r.researcher_id === res.user_id
      )
    );
  }

  validateForm(): boolean {
    const d = this.projectData;
  
    if (
      !d.title_th ||
      !d.title_en ||
      !d.abstract ||
      !d.abstract_en ||
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
  
    // ✅ internal member (กรอกก็ได้ แต่ถ้ากรอกต้องครบ)
    const invalidInternal = this.internalRow.some(
      r => r.researcher_id && !r.responsibilities
    );
  
    if (invalidInternal) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลผู้ร่วมโครงการไม่ครบ',
        text: 'กรุณาเลือกประเภทความรับผิดชอบให้ครบ',
      });
      return false;
    }
  
    // ✅ external member
    const invalidExternal = this.externalRow.some(
      r => (r.name && !r.responsibilities) || (r.responsibilities && !r.name)
    );
  
    if (invalidExternal) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลผู้ร่วมภายนอกไม่ครบ',
        text: 'กรุณากรอกชื่อและประเภทความรับผิดชอบให้ครบ',
      });
      return false;
    }
  
    return true;
  }

  addKeyword(event: KeyboardEvent) {

    if (event.key === 'Enter') {
  
      event.preventDefault();
  
      const value = this.keywordInput.trim();
  
      if (!value) return;
  
      if (!this.projectData.keywords.includes(value)) {
        this.projectData.keywords.push(value);
      }
  
      this.keywordInput = '';
      
    }
  }

  removeKeyword(index: number) {
    this.projectData.keywords.splice(index, 1);
  }
}
