import {
  Component,
  ElementRef,
  HostListener,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { InnovationForm, Major, SubArea } from '../../models/subject.model';
import { ResearchService } from '../../services/research.service';
import { Researcher } from '../../models/researchers.model';
import { ResearchInnovationDetail } from '../../models/innovation.model';
import {
  ExternalMemberRow,
  InternalMemberRow,
} from '../../models/member.model';
import { Funding } from '../../models/funding.model';
import { FundingService } from '../../services/funding.service';
import { MainComponent } from '../../shared/layouts/main/main.component';

const FIRST_AUTHOR = 'หัวหน้าโครงการ';

export const DEFAULT_INNOVATION: ResearchInnovationDetail = {
  research_id: 0,
  research_type: 'INNOVATION',
  title_th: '',
  title_en: '',
  abstract: '',
  abstract_en: '',
  keywords: [],
  year: '',
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
  year_received_budget: null,
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
};

@Component({
  selector: 'app-user-add-innovation',
  standalone: false,
  templateUrl: './user-add-innovation.component.html',
  styleUrl: './user-add-innovation.component.css',
})
export class UserAddInnovationComponent {
  isEdit = false;
  activeDropdown: string | null = null;
  activeRowIndex: number | null = null;
  activeMajor: Major | null = null;

  major: Major[] = [];
  selectedMajor: Major | null = null;
  selectedSub: SubArea | null = null;
  searchMajor = '';

  researchers: Researcher[] = [];
  filteredResearchers: Researcher[] = [];
  searchResearcher = '';
  selectedResearcher: string | null = null;
  searchKeyword = '';
  abstractType: string = '';

  keywordInput = '';
  keywordInputEn = '';

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
  selectedImagesName = '';
  selectedImagesFile: File[] = [];
  fundings: Funding[] = [];
  imagePreviews: string[] = [];

  projectData: ResearchInnovationDetail = { ...DEFAULT_INNOVATION };
  keywords: string[] = [];

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
        this.projectData.research_id = +id;
        this.loadProjectData(this.projectData.research_id);
      } else {
        this.isEdit = false;
        MainComponent.hideLoading();
      }
    });
  }

  loadSubjectArea(): void {
    this.service.getSubjectArea().subscribe({
      next: (res) => {
        this.major = res.data.subject_areas;
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
        const subjectId = data.subject_area?.[0]?.subject_area_id;
  
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
  
        if (subjectId) {
          this.selectedMajor =
            this.major.find((m) =>
              m.children?.some((c) => c.sub_id === subjectId)
            ) ?? null;
  
          this.selectedSub =
            this.selectedMajor?.children.find(
              (c) => c.sub_id === subjectId
            ) ?? null;
  
          if (this.selectedSub) {
            this.selectSub(this.selectedSub);
          }
        }
  
        this.selectedFileName = data.full_report?.file_name ?? '';
        this.selectedImagesName = data.innovation_images ?? [];
  
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

    if (this.activeDropdown === type) {
      this.activeDropdown = null;
    } else {
      this.activeDropdown = type;

      if (this.selectedSub) {
        this.activeMajor =
          this.major.find((m) =>
            m.children.some((c) => c.sub_id === this.selectedSub?.sub_id)
          ) ?? null;

        this.scrollToSelectedSub();
      }
    }
  }

  @HostListener('document: click')
  closeAll(): void {
    this.activeDropdown = null;
    this.activeRowIndex = null;
    this.activeMajor = null;
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

  selectSub(sub: any): void {
    this.selectedSub = sub;
    this.projectData.subject_area_id = sub.sub_id;

    const major = this.major.find((m) =>
      m.children.some((c) => c.sub_id === sub.sub_id)
    );

    if (major) {
      this.selectedMajor = major;
      this.activeMajor = major;
    }

    this.activeDropdown = null;

    setTimeout(() => {
      this.scrollToSelectedSub();
    });
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

  onFilesSelected(event: any) {
    const files: FileList = event.target.files;

    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      this.selectedImagesFile.push(files[i]);
    }
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
      ? this.service.updateInnovation(this.projectData.research_id, formData)
      : this.service.createInnovation(formData);

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
              .navigate([
                '/performance/innovation',
                this.projectData.research_id,
              ])
              .then(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              });
          }, 1000);
        } else {
          this.router.navigate([
            '/performance/innovation',
            res.data.research_id,
          ]);
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
    required('call_other', d.call_other);
    required('name_funding', d.name_funding);
    required('budget_amount', d.budget_amount);
    required('year_received_budget', d.year_received_budget);
    required('responsibilities', d.responsibilities);
    required('patent_number', d.patent_number);
    required('application_number', d.application_number);
    required('examination_url', d.examination_url);

    if (d.subject_area_id > 0)
      fd.append('subject_area_id', String(d.subject_area_id));
    if (this.selectedFile) fd.append('full_report', this.selectedFile);
    if (this.selectedImagesFile.length > 0) {
      this.selectedImagesFile.forEach((file) => {
        fd.append('innovation_images[]', file);
      });
    }

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
    this.projectData = { ...DEFAULT_INNOVATION };
    this.internalRow = [
      { id: 0, researcher_id: null, name: '', responsibilities: '' },
    ];
    this.externalRow = [{ name: '', organization: '', responsibilities: '' }];
    this.selectedFile = null;
    this.selectedFileName = '';
    this.selectedImagesFile = [];
    (this.selectedImagesName = ''), (this.selectedMajor = null);
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

  createImagePreview(file: File) {
    return URL.createObjectURL(file);
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

  scrollToSelectedSub() {
    if (!this.selectedSub) return;

    setTimeout(() => {
      const element = document.querySelector(
        `[data-id="${this.selectedSub?.sub_id}"]`
      ) as HTMLElement;

      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
      }
    }, 200);
  }

  setSelectedSubjectArea() {
    if (!this.projectData.subject_area_id) return;

    for (const major of this.major) {
      const found = major.children.find(
        (s) => s.sub_id === this.projectData.subject_area_id
      );

      if (found) {
        this.selectedMajor = major;
        this.selectedSub = found;
        this.activeMajor = major;
        break;
      }
    }
  }
}
