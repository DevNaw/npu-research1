import { Component, HostListener } from '@angular/core';
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

const FIRST_AUTHOR = 'หัวหน้าโครงการ';

export const DEFAULT_INNOVATION: ResearchInnovationDetail = {
  research_id: 0,
  research_type: 'INNOVATION',
  title_th: '',
  title_en: '',
  abstract: '',
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

  projectData: ResearchInnovationDetail = { ...DEFAULT_INNOVATION };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ResearchService
  ) {}

  ngOnInit(): void {
    this.loadSubjectArea();
    this.loadResearchersData();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (id) {
        this.isEdit = true;
        this.projectData.research_id = +id;
        this.loadProjectData(this.projectData.research_id);
      } else {
        this.isEdit = false;
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

        this.projectData = {
          ...this.projectData,
          ...data,
        };

        this.selectedFileName = data.full_report?.file_name ?? '';
        this.selectedImagesName = data.innovation_images ?? [];

        if (data.internal_members?.length) {
          this.internalRow = data.internal_members.map(
            (m: any, index: number) => ({
              id: index,
              researcher_id: m.user_id,
              name: m.full_name,
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
      this.selectedImagesFile.push(...Array.from(input.files));
    }
    input.value = '';
  }

  removeImageFile() {
    this.selectedImagesFile = [];
    this.selectedImagesName = '';
    this.projectData.innovation_images = [];
  }

  submit() {
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
      next: () => {
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

    required('title_th', d.title_th);
    required('published_date', d.published_date);
    required('source_funds', d.source_funds);
    required('principle', d.principle);
    required('call_other', d.call_other)
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
    return this.selectedImagesFile.length > 0 ||
           this.projectData.innovation_images?.length > 0;
  }
}
