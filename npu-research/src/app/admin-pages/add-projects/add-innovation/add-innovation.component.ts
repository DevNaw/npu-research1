import { Component, HostListener } from '@angular/core';
import Swal from 'sweetalert2';
import {
  ExternalMemberRow,
  InternalMemberRow,
} from '../../../models/member.model';
import { Researcher } from '../../../models/researchers.model';
import { Child, Major, Sub } from '../../../models/subject.model';
import { FundingService } from '../../../services/funding.service';
import { ResearchService } from '../../../services/research.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ResearchInnovationDetail } from '../../../models/innovation.model';
import { MainComponent } from '../../../shared/layouts/main/main.component';
import { Funding } from '../../../models/funding.model';
const FIRST_AUTHOR = 'หัวหน้าโครงการ';

export const DEFAULT_INNOVATION: ResearchInnovationDetail = {
  research_id: 0,
  research_type: 'INNOVATION',
  title_th: '',
  title_en: '',
  abstract: '',
  abstract_en: '',
  keywords: [],
  year: 0,
  published_date: '',
  image: null,
  call_other: null,
  img_url: null,
  status: null,
  subject_area_id: 0,
  principle: '',
  source_funds: null,
  budget_amount: null,
  name_funding: null,
  year_received_budget: 0,
  patent_number: null,
  application_number: null,
  examination_url: null,
  responsibilities: null,
  internal_members: [
    {
      user_id: 0,
      full_name: '',
      role: '',
      no: '',
    },
  ],
  external_members: [
    {
      full_name: '',
      role: '',
      organization: '',
      no: '',
    },
  ],
  full_report: null,
  innovation_images: [],
  oecd_id: 0,
  funding_code: '',
  funding_id: null,
  volume_no: '',
};

@Component({
  selector: 'app-add-innovation',
  standalone: false,
  templateUrl: './add-innovation.component.html',
  styleUrl: './add-innovation.component.css',
})
export class AddInnovationComponent {
  toggleTooltip = false;
  activeDropdown: string | null = null;
  activeRowIndex: number | null = null;

  oecdList: Major[] = [];
  selectedMajor: Major | null = null;
  selectedSub: Sub | null = null;
  searchMajor = '';
  searchSub = '';
  searchSubSub = '';
  selectedSubSub: Child | null = null;
  thaiYears: number[] = [];

  researchers: Researcher[] = [];
  filteredResearchers: Researcher[] = [];
  searchResearcher = '';
  abstractType: string = '';

  keywordInput = '';
  keywordInputEn = '';

  internalRow: InternalMemberRow[] = [
    { id: 0, researcher_id: null, name: '', responsibilities: '' },
  ];
  externalRow: ExternalMemberRow[] = [
    { name: '', organization: '', responsibilities: '' },
  ];
  activeMajor: Major | null = null;
  selectedFileName = '';
  selectedFile: File | null = null;
  selectedImagesFile: File[] = [];
  fundings: Funding[] = [];
  imagePreviews: string[] = [];

  filteredMajorsList: Major[] = [];
  filteredSubsList: Sub[] = [];
  filteredSubSubsList: Child[] = [];

  projectData: ResearchInnovationDetail = { ...DEFAULT_INNOVATION };
  keywords: string[] = [];

  showWeightModal = false;

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

    MainComponent.hideLoading();
  }

  loadSubjectArea(): void {
    this.service.getSubjectArea().subscribe({
      next: (res) => {
        this.oecdList = res.data.oecd;
      },
      error: (err) => {
        console.error('Failed to load Subject Area: ', err);
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
        console.error('Failed to load Researchers: ', err);
      },
    });
  }

  loadProjectData(id: number): void {
    this.service.getInnovationById(id).subscribe({
      next: (res) => {
        const data = res.data.researchInnovation;
        const oced = data.oecd?.[0];

        if (oced) {
          this.selectedMajor = {
            major_id: oced.major_id,
            name_th: oced.name_th,
            children: [oced.children],
          };

          this.selectedSub = oced.children;
          this.selectedSubSub = oced.children?.children;
        }

        this.projectData = {
          ...this.projectData,
          ...data,
          keywords: (data.keywords || []).map((k: any) => k.keyword),
        };

        if (data.abstract) {
          this.abstractType = 'th';
        } else if (data.abstract_en) {
          this.abstractType = 'en';
        }

        this.selectedFileName = data.full_report?.file_name ?? '';

        MainComponent.hideLoading();
      },
      error: (err) => {
        console.error('Failed to load article:', err);
        MainComponent.hideLoading();
      },
    });
  }

  toggleDropdown(type: string, event: Event): void {
    event.stopPropagation();

    this.activeDropdown = this.activeDropdown === type ? null : type;

    if (this.activeDropdown && this.selectedSub) {
      this.activeMajor =
        this.oecdList.find((m) =>
          (m.children || []).some((c) => c.sub_id === this.selectedSub?.sub_id)
        ) ?? null;

      this.selectedMajor = this.activeMajor;
      this.selectedSub =
        this.activeMajor?.children.find(
          (c) => c.sub_id === this.selectedSub?.sub_id
        ) ?? null;
    }
  }

  @HostListener('document: click')
  closeAll(): void {
    this.activeDropdown = null;
    this.activeRowIndex = null;
  }

  selectValue<K extends keyof ResearchInnovationDetail>(
    field: K,
    value: ResearchInnovationDetail[K]
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

  selectSub(sub: Sub) {
    this.selectedSub = sub;
    this.projectData.subject_area_id = sub.sub_id;

    this.activeDropdown = null;
  }

  selectSubSub(subSub: Child) {
    this.selectedSubSub = subSub;
    this.projectData.subject_area_id = subSub.child_id;

    this.activeDropdown = null;
  }

  selectMajor(m: Major) {
    this.selectedMajor = m;
    this.selectedSub = null;
    this.selectedSubSub = null;

    this.projectData.subject_area_id = 0;
    this.activeDropdown = null;
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
        text: 'ผู้ร่วมโครงการคนนี้ถูกเลือกแล้ว Optionแล้ว',
        confirmButtonColor: '#3085d6',
      });
      return;
    }
    row.name = r.full_name;
    row.researcher_id = r.user_id;
    this.activeRowIndex = null;
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

  onImageFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.files?.length) {
      const files = Array.from(input.files);

      files.forEach((file) => {
        this.selectedImagesFile.push(file);
        this.imagePreviews.push(URL.createObjectURL(file));
      });
    }

    input.value = '';
  }

  removeImageFile(index: number) {
    this.selectedImagesFile.splice(index, 1);
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

    this.service.adminCreateInnovation(formData).subscribe({
      next: (res: any) => {
        Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          showConfirmButton: false,
          timer: 1000,
        });

          this.router.navigate(['/admin/performance-by-departmaent', 'innovation', res.data.research_id]);
          this.resetForm();
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'บันทึกไม่สำเร็จ',
        });
      },
    });
  }

  buildFormData(): FormData {
    const fd = new FormData();
    const d = this.projectData;
    const subSub = this.selectedSubSub?.child_id ?? '';
    let funding_code = '';

    const required = (key: string, val: any) =>
      fd.append(key, val !== undefined ? String(val) : '');

    const optional = (key: string, val: any) => {
      if (val !== null && val !== undefined && val !== '') {
        fd.append(key, val);
      }
    };

    required('title_th', d.title_th);
    required('title_en', d.title_en);
    optional('abstract', d.abstract);
    optional('abstract_en', d.abstract_en);

    d.keywords.forEach((k, i) => {
      fd.append(`keywords[${i}]`, k);
    });

    required('published_date', d.published_date);
    required('source_funds', d.source_funds);
    required('principle', d.principle);
    optional('call_other', d.call_other);
    required('name_funding', d.name_funding);
    required('budget_amount', d.budget_amount);
    required('year_received_budget', d.year_received_budget);
    optional('responsibilities', d.responsibilities);
    required('patent_number', d.patent_number);
    required('application_number', d.application_number);
    required('examination_url', d.examination_url);
    required('volume_no', d.volume_no);

    if (this.selectedFile) fd.append('full_report', this.selectedFile);
    if (this.selectedImagesFile.length > 0) {
      this.selectedImagesFile.forEach((file) => {
        fd.append('innovation_images[]', file);
      });
    }

    if (d?.source_funds === 'แหล่งทุนภายใน') {
      funding_code = '01';
    } else if (d?.source_funds === 'แหล่งทุนภายนอก') {
      const selectedFund = this.fundings?.find(
        (f) => f?.funding_name === d?.name_funding
      );

      funding_code = selectedFund?.funding_code ?? '';
    } else {
      funding_code = '99';
    }

    required('oecd_id', subSub);
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

  resetForm(): void {
    this.projectData = { ...DEFAULT_INNOVATION };
    this.internalRow = [
      { id: 0, researcher_id: null, name: '', responsibilities: '' },
    ];
    this.externalRow = [{ name: '', organization: '', responsibilities: '' }];
    this.selectedFile = null;
    this.selectedFileName = '';
    this.selectedImagesFile = [];
    this.selectedSub = null;
    this.searchMajor = '';
  }

  goToResearchDetail() {
    this.router.navigate(['/user/profile']);
  }

  get hasImages(): boolean {
    return (
      this.selectedImagesFile.length > 0 ||
      this.projectData.innovation_images?.length > 0
    );
  }

  isResearcherAlreadySelected(
    userId: number,
    currentRow: InternalMemberRow
  ): boolean {
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

  validateForm(): boolean {
    const d = this.projectData;

    if (
      !d.title_th ||
      !d.title_en ||
      !d.source_funds ||
      !d.name_funding ||
      !d.budget_amount ||
      !d.year_received_budget ||
      !d.patent_number ||
      !d.application_number ||
      !d.examination_url
    ) {
      Swal.fire({
        icon: 'warning',
        title: 'กรอกข้อมูลไม่ครบ',
        text: 'กรุณากรอกข้อมูลบทความให้ครบถ้วน',
      });
      return false;
    }

    const invalidInternal = this.internalRow.some(
      (r) => r.researcher_id && !r.responsibilities
    );

    if (invalidInternal) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลผู้ร่วมโครงการไม่ครบ',
        text: 'กรุณาเลือกประเภทความรับผิดชอบให้ครบ',
      });
      return false;
    }

    const invalidExternal = this.externalRow.some(
      (r) => (r.name && !r.responsibilities) || (r.responsibilities && !r.name)
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

  removeImage(index: number) {
    this.projectData.innovation_images.splice(index, 1);
  }

  deleteImage(id: number) {
    Swal.fire({
      title: 'ยืนยันการลบ?',
      text: 'คุณต้องการลบรูปนี้ใช่หรือไม่',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ลบ',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.deleteImage(id).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'ลบข้อมูลสำเร็จ',
              showConfirmButton: false,
              timer: 1000,
            });

            this.loadProjectData(this.projectData.research_id);
          },
          error: (err) => {
            console.error(err);

            Swal.fire({
              icon: 'error',
              title: 'ลบข้อมูลไม่สำเร็จ',
            });
          },
        });
      }
    });
  }

  addKeyword(event: KeyboardEvent, type: string) {
    if (event.key === 'Enter') {
      event.preventDefault();

      if (type === 'th') {
        if (this.projectData.keywords.length >= 5) return;

        if (this.keywordInput.trim()) {
          this.projectData.keywords.push(this.keywordInput.trim());
          this.keywordInput = '';
        }
      }

      if (type === 'en') {
        if (this.projectData.keywords.length >= 5) return;

        if (this.keywordInputEn.trim()) {
          this.projectData.keywords.push(this.keywordInputEn.trim());
          this.keywordInputEn = '';
        }
      }
    }
  }

  removeKeyword(i: number) {
    this.projectData.keywords.splice(i, 1);
  }

  removeKeywordEn(i: number) {
    this.projectData.keywords.splice(i, 1);
  }

  filteredMajors(): Major[] {
    const keyword = (this.searchMajor || '').toLowerCase();

    return this.oecdList.filter((m) =>
      (m.name_th || '').toLowerCase().includes(keyword)
    );
  }

  filteredSubs(): Sub[] {
    if (!this.selectedMajor) return [];

    const keyword = (this.searchSub || '').toLowerCase();

    return (this.selectedMajor.children || []).filter((s) =>
      (s.name_th || '').toLowerCase().includes(keyword)
    );
  }

  filteredSubSubs(): Child[] {
    if (!this.selectedSub) return [];

    const keyword = (this.searchSubSub || '').toLowerCase();

    return (this.selectedSub.children || []).filter((ss) =>
      (ss.name_th || '').toLowerCase().includes(keyword)
    );
  }

  generateThaiYears() {
    const currentYear = new Date().getFullYear() + 543;

    this.thaiYears = [];
    for (let i = 0; i < 70; i++) {
      this.thaiYears.push(currentYear - i);
    }
  }

  selectYear(year: number) {
    this.projectData.year_received_budget = year;
    this.activeDropdown = null;
  }

  onAbstractTypeChange(type: 'th' | 'en') {
    this.abstractType = type;

    if (type === 'en') {
      // 👇 reset ตอนเลือก EN
      this.keywordInputEn = '';
      this.projectData.keywords = [];
      this.projectData.abstract_en = '';
    } else {
      // 👇 reset ตอนเลือก TH
      this.keywordInput = '';
      this.projectData.keywords = [];
      this.projectData.abstract = '';
    }
  }

  handleTab(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault();

      const textarea = event.target as HTMLTextAreaElement;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const tab = '\t';

      textarea.value =
        textarea.value.substring(0, start) +
        tab +
        textarea.value.substring(end);

      textarea.selectionStart = textarea.selectionEnd = start + tab.length;

      this.projectData.abstract = textarea.value;
    }
  }
}
