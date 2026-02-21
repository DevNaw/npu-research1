import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { InnovationForm, Major, SubArea } from '../../models/subject.model';
import { ResearchService } from '../../services/research.service';
import { Researcher } from '../../models/researchers.model';
import { ResearchInnovation } from '../../models/innovation.model';
import {
  ExternalMemberRow,
  InternalMemberRow,
} from '../../models/member.model';

const FIRST_AUTHOR = 'หัวหน้าโครงการ';

export const DEFAULT_INNOVATION: ResearchInnovation = {
  id: 0,
  title_th: '',
  title_en: '',
  abstract: '',
  year: '',
  published_date: '',
  image: null,
  call_other: null,
  img_url: null,
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

  selectedMajor: Major | null = null;
  searchMajor = '';
  majors: Major[] = [];
  selectedSub: SubArea | null = null;

  fundType: string = '';
  fundName: string = '';

  activeDropdown: string | null = null;
  activeMajor: Major | null = null;
  activeRowIndex: number | null = null;

  researchers: Researcher[] = [];
  filteredResearchers: Researcher[] = [];

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

  // Data
  innovationData: ResearchInnovation = { ...DEFAULT_INNOVATION };
  internalRows: InternalMemberRow[] = [
    { id: 0, researcher_id: null, name: '', responsibilities: '' },
  ];
  externalRows: ExternalMemberRow[] = [
    { name: '', organization: '', responsibilities: '' },
  ];

  selectedFile: File | null = null;
  selectedFileName = '';

  reportFile: File | null = null;
  reportFileName = '';

  selectedImageFile: File[]  = [];
  selectedImageFileName = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ResearchService
  ) {}

  ngOnInit() {
    this.loadSubjectArea();
    this.loadResearcherData();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (id) {
        this.isEdit = true;
        this.innovationData.id = +id;
        this.loadInnovationData(this.innovationData.id);
      } else {
        this.isEdit = false;
      }
    });
  }

  // ======================== Load Data ====================
  loadSubjectArea() {
    this.service.getSubjectArea().subscribe({
      next: (res) => {
        this.majors = res.data.subject_areas;
      },
      error: (err) => {
        console.error('Not Found!', err);
      },
    });
  }

  loadResearcherData() {
    this.service.getResearchers().subscribe({
      next: (res) => {
        this.researchers = res.data.$researchers;
        this.filteredResearchers = this.researchers;
      },
    });
  }

  loadInnovationData(id: number): void {
    this.service.getInnovationById(id).subscribe({
      next: (res) => {
        const data = res.data.researchInnovation;

        this.innovationData = {
          ...this.innovationData,
          ...data,
        };
        console.log(data);

        this.reportFileName = data.full_report_file_name;
        this.selectedImageFile = data.innovation_images ?? '';

        if (data.internal_members?.length) {
          this.internalRows = data.internal_members.map(
            (m: any, index: number) => ({
              in: index,
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

        if (this.innovationData.subject_area_id) {
          for (const m of this.majors) {
            const foundSub = m.children.find(
              (s) => s.sub_id === this.innovationData.subject_area_id
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

  // ===================== Toggle Event ===========================
  toggleDropdown(name: string, event: MouseEvent) {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === name ? null : name;
  }

  @HostListener('document:click')
  closeAll() {
    this.activeDropdown = null;
  }

  // ====================== Select Value ==========================
  selectValue<K extends keyof ResearchInnovation>(
    field: K,
    value: ResearchInnovation[K]
  ): void {
    if (
      field === 'responsibilities' &&
      value === FIRST_AUTHOR &&
      this.isFirstAuthorTaken()
    ) {
      return;
    }

    this.innovationData[field] = value;

    if (field === 'source_funds') {
      this.innovationData.name_funding = '';
    }

    this.activeDropdown = null;
  }

  selectSub(sub: SubArea) {
    this.selectedSub = sub;
    this.innovationData.subject_area_id = sub.sub_id;
    this.activeDropdown = null;
    this.activeMajor = null;

    // this.innovationData.major_id = sub.major_id;
    // this.innovationData.sub_id = sub.sub_id;
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

  // ===================== Filter ===================
  filteredMajor(): Major[] {
    if (!this.searchMajor) return this.majors;

    const keyword = this.searchMajor.toLowerCase();
    return this.majors.filter((m) => m.name_en.toLowerCase().includes(keyword));
  }

  isFirstAuthorTaken(currentRow?: any): boolean {
    if (this.innovationData.responsibilities === FIRST_AUTHOR) return true;
    return [...this.internalRows, ...this.externalRows].some(
      (row) => row !== currentRow && row.responsibilities === FIRST_AUTHOR
    );
  }

  // ================ Add / Remove Members =======================
  addInternal(): void {
    this.internalRows.push({
      id: this.internalRows.length,
      researcher_id: null,
      name: '',
      responsibilities: '',
    });
  }

  removeInternal(index: number) {
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

  // =========== Researcher & Role ======================
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

  // ============== File ==============
  // onFileSelected(event: Event) {
  //   const input = event.target as HTMLInputElement;

  //   if (input.files && input.files.length > 0) {
  //     this.selectedImageFiles = Array.from(input.files);
  //   }
  // }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
  
    if (input.files && input.files.length > 0) {
      this.selectedImageFile = Array.from(input.files);
    } else {
      this.selectedImageFile = [];
    }
  }

  onReportFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      this.reportFile = input.files[0];
      this.reportFileName = this.reportFile.name;
    }
  }

  removeFile(): void {
    this.selectedFile = null;
    this.selectedFileName = '';
    this.innovationData.full_report = null;
  }

  removeFileImage(): void {
    // this.selectedImageFile = null;
    this.selectedImageFileName = '';
    this.innovationData.innovation_images = null;
  }

  // ================  Submit ==================
  submitInnovation(): void {
    const formData = this.buildFormData();

    Swal.fire({
      title: 'กำลังบันทึก...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    const request$ = this.isEdit
      ? this.service.updateInnovation(this.innovationData.id, formData)
      : this.service.createInnovation(formData);

    request$.subscribe({
      next: () => this.handleSuccess(),
      error: () => this.handleError(),
    });
  }

  private prepareFormData(): FormData {
    const fd = new FormData();
    const d = this.innovationData;

    Object.entries(d).forEach(([key, value]) => {
      if (key === 'full_report' || key === 'innovation_images') {
        return;
      }

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

    // ✅ ส่ง report เฉพาะเมื่อเลือกไฟล์
    if (this.reportFile instanceof File) {
      fd.append('full_report', this.reportFile);
    }

    // ✅ ส่ง image เฉพาะเมื่อเลือกไฟล์
    if (this.selectedImageFile instanceof File) {
      fd.append('innovation_images', this.selectedImageFile);
    }

    return fd;
  }

  private appendMembers(fd: FormData): void {
    this.internalRows
      .filter((r) => r.researcher_id)
      .forEach((r, i) => {
        fd.append(`internal_members[${i}][user_id]`, String(r.researcher_id));
        fd.append(`internal_members[${i}][role]`, r.responsibilities ?? '');
        fd.append(`internal_members[${i}][no]`, String(i + 1));
      });

    this.externalRows
      .filter((r) => r.name)
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
      this.router.navigate(['/performance/innovation', this.innovationData.id]);
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

  selectMajor(m: Major) {
    this.selectedMajor = m;
    this.activeDropdown = null;
    this.searchMajor = '';
  }

  private resetForm() {
    this.innovationData = { ...DEFAULT_INNOVATION };
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

  toggleMajor(major: Major, event: Event) {
    event.stopPropagation();

    if (this.activeMajor?.major_id === major.major_id) {
      this.activeMajor = null;
    } else {
      this.activeMajor = major;
    }
  }

  private buildFormData(): FormData {
    const fd = new FormData();
    const d = this.innovationData;

    const required = (key: string, val: any) => fd.append(key, val ?? '');

    required('title_th', d.title_th);
    required('year', d.year);
    required('year_received_budfet', d.year_received_budget);
    required('call_other', d.call_other);
    required('principle', d.principle);
    required('source_funds', d.source_funds);
    required('budget_amount', d.budget_amount);
    required('name_funding', d.name_funding);
    required('patent_number', d.patent_number);
    required('application_number', d.application_number);
    required('examination_url', d.examination_url);
    required('responsibilities', d.responsibilities);

    if (d.subject_area_id > 0)
      fd.append('subject_area_id', String(d.subject_area_id));

    if (this.selectedFile) fd.append('full_report', this.selectedFile);
    if (this.selectedImageFile.length > 0) {
      this.selectedImageFile.forEach(file => {
        fd.append('innovation_images[]', file);
      });
    }

    this.internalRows
      .filter((r) => r.researcher_id)
      .forEach((r, i) => {
        fd.append(`internal_members[${i}][user_id]`, String(r.researcher_id));
        fd.append(`internal_members[${i}][role]`, r.responsibilities ?? '');
        fd.append(`internal_members[${i}][no]`, String(i + 1));
      });

      this.externalRows
      .filter((r) => r.name)
      .forEach((r, i) => {
        fd.append(`external_members[${i}][full_name]`, r.name);
        fd.append(`external_members[${i}][role]`, r.responsibilities ?? '');
        fd.append(`external_members[${i}][organization]`, r.organization);
        fd.append(`external_members[${i}][no]`, String(i + 1));
      });

    return fd;
  }
}
