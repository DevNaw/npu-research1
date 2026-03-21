import {
  Component,
  ElementRef,
  HostListener,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ResearchService } from '../../services/research.service';
import { Major, Sub, Child } from '../../models/subject.model';
import { Researcher } from '../../models/researchers.model';
import { Article } from '../../models/aticle.model';
import { MainComponent } from '../../shared/layouts/main/main.component';

interface InternalMemberRow {
  id: number;
  researcher_id: number | null;
  name: string;
  responsibilities: string;
}

interface ExternalMemberRow {
  name: string;
  organization: string;
  responsibilities: string;
}

const FIRST_AUTHOR = 'First Author (ผู้ประพันธ์อันดับแรก)';

const DEFAULT_ARTICLE: Article = {
  id: 0,
  title_th: '',
  title_en: '',
  abstract: '',
  abstract_en: '',
  keywords: [],
  year: '',
  published_date: '',
  call_other: null,
  image: null,
  db_type: '',
  country: '',
  article_file: null,
  journal_name: '',
  pre_location: '',
  pages: '',
  year_published: 0,
  volume: '',
  volume_no: '',
  is_cooperation: '',
  doi: '',
  subject_area_id: 0,
  responsibilities: '',
  internal_members: [{ user_id: 0, role: '', no: '' }],
  external_members: [{ full_name: '', role: '', organization: '', no: '' }],
  article_type: '',
  major_id: null,
  sub_id: null,
  oecd_id: 0,
  article_type_code: '',
  con_type: '',
};

@Component({
  selector: 'app-user-add-aticle',
  standalone: false,
  templateUrl: './user-add-aticle.component.html',
  styleUrl: './user-add-aticle.component.css',
})
export class UserAddAticleComponent {
  @ViewChildren('subItem') subItems!: QueryList<ElementRef>;

  isEdit = false;
  oecdList: Major[] = [];
  selectedSub: Sub | null = null;
  selectedMajor: Major | null = null;
  searchMajor = '';
  searchSub = '';
  thaiYears: number[] = [];
  searchSubSub = '';
  selectedSubSub: Child | null = null;
  activeDropdown: string | null = null;
  researchers: Researcher[] = [];
  filteredResearchers: Researcher[] = [];
  activeRowIndex: number | null = null;
  internalRow: InternalMemberRow[] = [
    { id: 0, researcher_id: null, name: '', responsibilities: '' },
  ];
  externalRow: ExternalMemberRow[] = [
    { name: '', organization: '', responsibilities: '' },
  ];

  selectedFileName = '';
  selectedFile: File | null = null;
  submitted = false;
  articleData: Article = { ...DEFAULT_ARTICLE };
  researchId?: number;
  activeMajor: Major | null = null;
  searchResearcher = '';

  keywords: string[] = [];
  abstractType: 'th' | 'en' = 'th';
  keywordInput = '';
  keywordInputEn = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private researchService: ResearchService
  ) {}

  ngOnInit() {
    this.resetForm();

    MainComponent.showLoading();
    this.loadSubjectAreas();
    this.loadResearchersData();
    this.generateThaiYears();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (id) {
        this.isEdit = true;
        this.articleData.id = +id;
        this.loadAticleData(this.articleData.id);
      } else {
        this.isEdit = false;
        // this.resetForm();
      }
      MainComponent.hideLoading();
    });
  }

  loadSubjectAreas(): void {
    this.researchService.getSubjectArea().subscribe({
      next: (res) => {
        this.oecdList = res.data.oecd;
      },
      error: (err) => {
        console.error('Failed to load subject areas:', err);
      },
    });
  }

  loadResearchersData(): void {
    this.researchService.getResearchers().subscribe({
      next: (res) => {
        this.researchers = res.data.$researchers ?? [];
        this.filteredResearchers = this.researchers;
      },
      error: (err) => console.error('Failed to load researchers:', err),
    });
  }

  loadAticleData(id: number): void {
    this.researchService.getArticleById(id).subscribe({
      next: (res) => {
        const data = res.data.researchArticle;
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

        this.articleData = {
          ...this.articleData,
          ...data,
          keywords: (data.keywords || []).map((k: any) => k.keyword),
        };

        if (data.abstract) {
          this.abstractType = 'th';
        } else if (data.abstract_en) {
          this.abstractType = 'en';
        }

        this.selectedFileName = data.articleFile?.file_name ?? '';

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
      error: (err) => console.error('Failed to load article:', err),
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
          this.oecdList.find((m) =>
            m.children.some((c) => c.sub_id === this.selectedSub?.sub_id)
          ) ?? null;

        this.selectedMajor = this.activeMajor;
        this.selectedSub =
          this.activeMajor?.children.find(
            (c) => c.sub_id === this.selectedSub?.sub_id
          ) ?? null;
      }
    }
  }

  @HostListener('document:click')
  closeAll(): void {
    this.activeDropdown = null;
    this.activeMajor = null;
    this.activeRowIndex = null;
  }

  selectValue<K extends keyof Article>(field: K, value: Article[K]): void {
    if (
      field === 'responsibilities' &&
      value === FIRST_AUTHOR &&
      this.isFirstAuthorTaken()
    )
      return;
    this.articleData[field] = value;
    this.activeDropdown = null;
  }

  selectSub(sub: Sub): void {
    this.selectedSub = sub;
    this.selectedSubSub = null;
    this.articleData.subject_area_id = sub.sub_id;

    this.selectedMajor =
      this.oecdList.find((m) =>
        m.children.some((c) => c.sub_id === sub.sub_id)
      ) ?? null;

    this.activeDropdown = null;
  }

  selectMajor(m: Major) {
    this.selectedMajor = m;
    this.selectedSub = null;
    this.selectedSubSub = null;
    this.searchSub = '';
    this.searchSubSub = '';

    this.articleData.subject_area_id = 0;
    this.activeDropdown = null;
  }

  selectSubSub(subSub: Child) {
    this.selectedSubSub = subSub;
    this.articleData.subject_area_id = subSub.child_id;

    this.activeDropdown = null;
  }

  // -------- First Author Guard -------------------------------------------------------
  isFirstAuthorTaken(excludeRow?: any): boolean {
    if (this.articleData.responsibilities === FIRST_AUTHOR) return true;
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

  removeExternalRow(index: number) {
    this.externalRow.splice(index, 1);
  }

  selectRowResponsibility(row: any, value: string): void {
    if (value === FIRST_AUTHOR && this.isFirstAuthorTaken(row)) {
      return;
    }

    row.responsibilities = value;
    this.activeDropdown = null;
  }

  trackById(index: number) {
    return index;
  }

  // ----- Researcher Search -------------------------------------------------------
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

  // -----File -------------------------------------------------------
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
    this.articleData.article_file = null;
  }

  // ----- Submit -------------------------------------------------------
  submitArticle() {
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
      ? this.researchService.updateArticle(this.articleData.id, formData)
      : this.researchService.createArticle(formData);

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
              .navigate(['/performance/article', this.articleData.id])
              .then(() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              });
          }, 1000);
        } else {
          this.router.navigate(['/performance/article', res.data.research_id]);
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

  private buildFormData(): FormData {
    const fd = new FormData();
    const d = this.articleData;
    const subSub = this.selectedSubSub?.child_id ?? '';
    let article_type_code = '';
    let article_type = '';

    const required = (key: string, val: any) => fd.append(key, val ?? '');

    const optional = (key: string, val: any) => {
      if (val !== null && val !== undefined && val !== '') {
        fd.append(key, val);
      }
    };

    // required('title_th', d.title_th);
    // required('title_en', d.title_en);
    if (this.abstractType === 'th') {
      required('title_th', d.title_th);
    } else {
      required('title_en', d.title_en);
    }

    optional('abstract', d.abstract);
    optional('abstract_en', d.abstract_en);

    d.keywords.forEach((k, i) => {
      fd.append(`keywords[${i}]`, k);
    });
    required('published_date', d.published_date);
    required('article_type', d.article_type);
    // article_type = d.article_type;
    required('journal_name', d.journal_name);
    required('pages', d.pages);
    required('year_published', d.year_published);
    required('volume', d.volume);
    required('volume_no', d.volume_no);

    const isJournal = ['วารสาร', 'Journal'].includes(d.article_type);

    if (isJournal) {
      required('doi', d.doi);
    } else {
      optional('doi', d.doi);
    }
    required('is_cooperation', d.is_cooperation);
    optional('db_type', d.db_type);
    optional('responsibilities', d.responsibilities);
    optional('pre_location', d.pre_location);
    optional('con_type', d.con_type);

    if (d.subject_area_id > 0)
      fd.append('subject_area_id', String(d.subject_area_id));
    if (this.selectedFile) fd.append('article_file', this.selectedFile);

    if (d.db_type === 'Scopus') {
      article_type_code = '01';
    } else if (d.db_type === 'TCI') {
      article_type_code = '02';
    } else if (d.con_type === 'การประชุมวิชาการนานาชาติ') {
      article_type_code = '03';
    } else if (d.con_type === 'การประชุมวิชาการ') {
      article_type_code = '04';
    }

    required('oecd_id', subSub);
    optional('article_type_code', d.article_type_code);

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

  private resetForm(): void {
    this.articleData = { ...DEFAULT_ARTICLE };
    this.internalRow = [
      { id: 0, researcher_id: null, name: '', responsibilities: '' },
    ];
    this.externalRow = [{ name: '', organization: '', responsibilities: '' }];
    this.selectedFile = null;
    this.selectedFileName = '';
    this.selectedMajor = null;
    this.selectedSub = null;
    this.searchMajor = '';
    this.searchSub = '';
    this.keywordInput = '';
    this.keywordInputEn = '';
    this.abstractType = 'th';
    this.articleData.keywords = [];
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
    const d = this.articleData;

    if (
      !d.title_th ||
      !d.title_en ||
      !d.article_type ||
      !d.journal_name ||
      !d.pages ||
      !d.year_published ||
      !d.volume ||
      !d.volume_no ||
      !d.doi
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

  addKeyword(event: KeyboardEvent, type: string) {
    if (event.key === 'Enter') {
      event.preventDefault();

      if (type === 'th') {
        if (this.articleData.keywords.length >= 5) return;

        if (this.keywordInput.trim()) {
          this.articleData.keywords.push(this.keywordInput.trim());
          this.keywordInput = '';
        }
      }

      if (type === 'en') {
        if (this.articleData.keywords.length >= 5) return;

        if (this.keywordInputEn.trim()) {
          this.articleData.keywords.push(this.keywordInputEn.trim());
          this.keywordInputEn = '';
        }
      }
    }
  }

  removeKeyword(i: number) {
    this.articleData.keywords.splice(i, 1);
  }

  removeKeywordEn(i: number) {
    this.articleData.keywords.splice(i, 1);
  }

  generateThaiYears() {
    const currentYear = new Date().getFullYear() + 543;

    this.thaiYears = [];
    for (let i = 0; i < 70; i++) {
      this.thaiYears.push(currentYear - i);
    }
  }

  selectYear(year: number) {
    this.articleData.year_published = year;
    this.activeDropdown = null;
  }

  filteredSubSubs() {
    if (!this.selectedSub) return [];

    return (this.selectedSub.children || []).filter((ss: Child) =>
      (ss.name_th || '')
        .toLowerCase()
        .includes((this.searchSubSub || '').toLowerCase())
    );
  }

  filteredMajors() {
    return this.oecdList.filter((m) =>
      m.name_th.toLowerCase().includes(this.searchMajor.toLowerCase())
    );
  }

  filteredSubs() {
    if (!this.selectedMajor) return [];

    return (this.selectedMajor.children || []).filter((s: Sub) =>
      (s.name_th || '')
        .toLowerCase()
        .includes((this.searchSub || '').toLowerCase())
    );
  }

  onAbstractTypeChange(type: 'th' | 'en') {
    this.abstractType = type;
  
    if (type === 'en') {
      // 👇 reset ตอนเลือก EN
      this.keywordInputEn = '';
      this.articleData.keywords = [];
      this.articleData.abstract_en = '';
    } else {
      // 👇 reset ตอนเลือก TH
      this.keywordInput = '';
      this.articleData.keywords = [];
      this.articleData.abstract = '';
    }
  }

  handleTab(event: KeyboardEvent) {
    if (event.key === 'Tab') {
      event.preventDefault(); // ❗ หยุดการเปลี่ยน focus
  
      const textarea = event.target as HTMLTextAreaElement;
  
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
  
      // ใส่ tab (\t) หรือจะใช้ช่องว่าง 4 ตัวก็ได้
      const tab = '\t'; // หรือ '    '
  
      textarea.value =
        textarea.value.substring(0, start) +
        tab +
        textarea.value.substring(end);
  
      // อัปเดต cursor
      textarea.selectionStart = textarea.selectionEnd = start + tab.length;
  
      // sync กับ ngModel
      this.articleData.abstract = textarea.value;
    }
  }
}
