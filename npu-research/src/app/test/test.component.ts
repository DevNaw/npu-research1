import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Article } from '../models/aticle.model';
import { Major, SubArea } from '../models/subject.model';
import { Researcher } from '../models/researchers.model';
import { ResearchService } from '../services/research.service';

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
  year_published: '',
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
};

@Component({
  selector: 'app-test',
  standalone: false,
  templateUrl: './test.component.html',
  styleUrl: './test.component.css',
})
export class TestComponent implements OnInit {
  isEdit = false;

  // Subject area
  majors: Major[] = [];
  selectedMajor: Major | null = null;
  selectedSub: SubArea | null = null;
  searchMajor = '';
  activeMajor: Major | null = null;
 
  // Dropdowns
  activeDropdown: string | null = null;

  // Researchers
  researchers: Researcher[] = [];
  filteredResearchers: Researcher[] = [];
  activeRowIndex: number | null = null;

  // Member rows
  internalRows: InternalMemberRow[] = [{ id: 0, researcher_id: null, name: '', responsibilities: '' }];
  externalRows: ExternalMemberRow[] = [{ name: '', organization: '', responsibilities: '' }];

  // File
  selectedFile: File | null = null;
  selectedFileName = '';

  // Country
  selectedCountry = '';
  searchCountries = '';

  articleData: Article = { ...DEFAULT_ARTICLE };

  readonly countries = [
    { code: 'AF', name: 'อัฟกานิสถาน' }, { code: 'AL', name: 'แอลเบเนีย' },
    { code: 'DZ', name: 'แอลจีเรีย' }, { code: 'AD', name: 'อันดอร์รา' },
    { code: 'AO', name: 'แองโกลา' }, { code: 'AG', name: 'แอนติกาและบาร์บูดา' },
    { code: 'AR', name: 'อาร์เจนตินา' }, { code: 'AM', name: 'อาร์มีเนีย' },
    { code: 'AU', name: 'ออสเตรเลีย' }, { code: 'AT', name: 'ออสเตรีย' },
    { code: 'AZ', name: 'อาเซอร์ไบจาน' }, { code: 'BS', name: 'บาฮามาส' },
    { code: 'BH', name: 'บาห์เรน' }, { code: 'BD', name: 'บังกลาเทศ' },
    { code: 'BB', name: 'บาร์เบโดส' }, { code: 'BY', name: 'เบลารุส' },
    { code: 'BE', name: 'เบลเยียม' }, { code: 'BZ', name: 'เบลีซ' },
    { code: 'BJ', name: 'เบนิน' }, { code: 'BT', name: 'ภูฏาน' },
    { code: 'BO', name: 'โบลิเวีย' }, { code: 'BA', name: 'บอสเนียและเฮอร์เซโกวีนา' },
    { code: 'BW', name: 'บอตสวานา' }, { code: 'BR', name: 'บราซิล' },
    { code: 'BN', name: 'บรูไน' }, { code: 'BG', name: 'บัลแกเรีย' },
    { code: 'BF', name: 'บูร์กินาฟาโซ' }, { code: 'BI', name: 'บุรุนดี' },
    { code: 'KH', name: 'กัมพูชา' }, { code: 'CM', name: 'แคเมอรูน' },
    { code: 'CA', name: 'แคนาดา' }, { code: 'CV', name: 'เคปเวิร์ด' },
    { code: 'CF', name: 'สาธารณรัฐแอฟริกากลาง' }, { code: 'TD', name: 'ชาด' },
    { code: 'CL', name: 'ชิลี' }, { code: 'CN', name: 'จีน' },
    { code: 'CO', name: 'โคลอมเบีย' }, { code: 'CR', name: 'คอสตาริกา' },
    { code: 'HR', name: 'โครเอเชีย' }, { code: 'CU', name: 'คิวบา' },
    { code: 'CY', name: 'ไซปรัส' }, { code: 'CZ', name: 'สาธารณรัฐเช็ก' },
    { code: 'DK', name: 'เดนมาร์ก' }, { code: 'EG', name: 'อียิปต์' },
    { code: 'EE', name: 'เอสโตเนีย' }, { code: 'ET', name: 'เอธิโอเปีย' },
    { code: 'FI', name: 'ฟินแลนด์' }, { code: 'FR', name: 'ฝรั่งเศส' },
    { code: 'DE', name: 'เยอรมนี' }, { code: 'GH', name: 'กานา' },
    { code: 'GR', name: 'กรีซ' }, { code: 'HK', name: 'ฮ่องกง' },
    { code: 'HU', name: 'ฮังการี' }, { code: 'IS', name: 'ไอซ์แลนด์' },
    { code: 'IN', name: 'อินเดีย' }, { code: 'ID', name: 'อินโดนีเซีย' },
    { code: 'IR', name: 'อิหร่าน' }, { code: 'IQ', name: 'อิรัก' },
    { code: 'IE', name: 'ไอร์แลนด์' }, { code: 'IL', name: 'อิสราเอล' },
    { code: 'IT', name: 'อิตาลี' }, { code: 'JP', name: 'ญี่ปุ่น' },
    { code: 'JO', name: 'จอร์แดน' }, { code: 'KZ', name: 'คาซัคสถาน' },
    { code: 'KE', name: 'เคนยา' }, { code: 'KR', name: 'เกาหลีใต้' },
    { code: 'KW', name: 'คูเวต' }, { code: 'LA', name: 'ลาว' },
    { code: 'LV', name: 'ลัตเวีย' }, { code: 'LB', name: 'เลบานอน' },
    { code: 'LY', name: 'ลิเบีย' }, { code: 'LT', name: 'ลิทัวเนีย' },
    { code: 'LU', name: 'ลักเซมเบิร์ก' }, { code: 'MY', name: 'มาเลเซีย' },
    { code: 'MX', name: 'เม็กซิโก' }, { code: 'MM', name: 'เมียนมา' },
    { code: 'NP', name: 'เนปาล' }, { code: 'NL', name: 'เนเธอร์แลนด์' },
    { code: 'NZ', name: 'นิวซีแลนด์' }, { code: 'NO', name: 'นอร์เวย์' },
    { code: 'PK', name: 'ปากีสถาน' }, { code: 'PH', name: 'ฟิลิปปินส์' },
    { code: 'PL', name: 'โปแลนด์' }, { code: 'PT', name: 'โปรตุเกส' },
    { code: 'QA', name: 'กาตาร์' }, { code: 'RU', name: 'รัสเซีย' },
    { code: 'SA', name: 'ซาอุดีอาระเบีย' }, { code: 'SG', name: 'สิงคโปร์' },
    { code: 'ZA', name: 'แอฟริกาใต้' }, { code: 'ES', name: 'สเปน' },
    { code: 'SE', name: 'สวีเดน' }, { code: 'CH', name: 'สวิตเซอร์แลนด์' },
    { code: 'TH', name: 'ไทย' }, { code: 'TR', name: 'ตุรกี' },
    { code: 'UA', name: 'ยูเครน' }, { code: 'AE', name: 'สหรัฐอาหรับเอมิเรตส์' },
    { code: 'GB', name: 'สหราชอาณาจักร' }, { code: 'US', name: 'สหรัฐอเมริกา' },
    { code: 'VN', name: 'เวียดนาม' }, { code: 'ZW', name: 'ซิมบับเว' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private researchService: ResearchService
  ) {}

  ngOnInit(): void {
    this.loadSubjectAreas();
    this.loadResearchers();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEdit = true;
        this.articleData.id = +id;
        this.loadArticleData(this.articleData.id);
      }
    });
  }

  loadSubjectAreas(): void {
    this.researchService.getSubjectArea().subscribe({
      next: (res) => (this.majors = res.data.subject_areas),
      error: (err) => console.error('Failed to load subject areas:', err),
    });
  }

  loadResearchers(): void {
    this.researchService.getResearchers().subscribe({
      next: (res) => {
        this.researchers = res.data.$researchers ?? [];
        this.filteredResearchers = this.researchers;
      },
      error: (err) => console.error('Failed to load researchers:', err),
    });
  }

  loadArticleData(id: number): void {
    this.researchService.getArticleById(id).subscribe({
      next: (res) => {
        const data = res.data.researchArticle;
        this.articleData = { ...this.articleData, ...data };
        this.selectedCountry = this.articleData.country;

        if (this.articleData.subject_area_id) {
          for (const major of this.majors) {
            const found = major.children.find(
              (s) => s.sub_id === this.articleData.subject_area_id
            );
            if (found) {
              this.selectedMajor = major;
              this.selectedSub = found;
              break;
            }
          }
        }
      },
      error: (err) => console.error('Failed to load article:', err),
    });
  }

  toggleDropdown(key: string, event: Event): void {
    event.stopPropagation();
    this.activeDropdown = this.activeDropdown === key ? null : key;
  }

  @HostListener('document:click')
  closeAll(): void {
    this.activeDropdown = null;
    this.activeMajor = null;
    this.activeRowIndex = null;
  }

  selectValue<K extends keyof Article>(field: K, value: Article[K]): void {
    if (field === 'responsibilities' && value === FIRST_AUTHOR && this.isFirstAuthorTaken()) return;
    this.articleData[field] = value;
    this.activeDropdown = null;
  }

  // ─── Subject Area ────────────────────────────────────────────────────────────

  toggleMajor(major: Major, event: Event): void {
    event.stopPropagation();
    this.activeMajor = this.activeMajor?.major_id === major.major_id ? null : major;
  }

  selectSub(sub: SubArea): void {
    this.selectedSub = sub;
    this.articleData.subject_area_id = sub.sub_id;
    this.activeDropdown = null;
    this.activeMajor = null;
  }

  filteredMajors(): Major[] {
    if (!this.searchMajor) return this.majors;
    const kw = this.searchMajor.toLowerCase();
    return this.majors.filter((m) => m.name_en.toLowerCase().includes(kw));
  }

  // ─── Country ─────────────────────────────────────────────────────────────────

  selectCountry(c: { code: string; name: string }): void {
    this.selectedCountry = c.name;
    this.articleData.country = c.name;
    this.searchCountries = '';
    this.activeDropdown = null;
  }

  filteredCountries() {
    const kw = this.searchCountries.toLowerCase();
    return this.countries.filter(
      (c) => c.name.toLowerCase().includes(kw) || c.code.toLowerCase().includes(kw)
    );
  }

  // ─── First Author Guard ───────────────────────────────────────────────────────

  isFirstAuthorTaken(excludeRow?: any): boolean {
    if (this.articleData.responsibilities === FIRST_AUTHOR) return true;
    return [...this.internalRows, ...this.externalRows].some(
      (row) => row !== excludeRow && row.responsibilities === FIRST_AUTHOR
    );
  }

  addInternalRow(): void {
    this.internalRows.push({ id: this.internalRows.length, researcher_id: null, name: '', responsibilities: '' });
  }

  removeInternalRow(index: number): void {
    this.internalRows.splice(index, 1);
  }

  addExternalRow(): void {
    this.externalRows.push({ name: '', organization: '', responsibilities: '' });
  }

  removeExternalRow(index: number): void {
    this.externalRows.splice(index, 1);
  }

  selectRowResponsibility(row: any, value: string): void {
    if (value === FIRST_AUTHOR && this.isFirstAuthorTaken(row)) return;
    row.responsibilities = value;
    this.activeDropdown = null;
  }

  trackByIndex(index: number): number {
    return index;
  }

  // ─── Researcher Search ────────────────────────────────────────────────────────

  onResearcherFocus(row: InternalMemberRow): void {
    this.activeRowIndex = row.id;
    this.filteredResearchers = this.researchers;
  }

  onResearcherSearch(value: string): void {
    this.filteredResearchers = value
      ? this.researchers.filter((r) => r.full_name?.toLowerCase().includes(value.toLowerCase()))
      : this.researchers;
  }

  selectResearcher(r: Researcher, row: InternalMemberRow): void {
    row.name = r.full_name;
    row.researcher_id = r.user_id;
    this.activeRowIndex = null;
  }

  // ─── File ────────────────────────────────────────────────────────────────────

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) {
      this.selectedFile = input.files[0];
      this.selectedFileName = this.selectedFile.name;
    }
  }

  // ─── Submit ──────────────────────────────────────────────────────────────────

  submitArticle(): void {
    const formData = this.buildFormData();

    Swal.fire({ title: 'กำลังบันทึก...', allowOutsideClick: false, didOpen: () => Swal.showLoading() });

    const request$ = this.isEdit
      ? this.researchService.updateArticle(this.articleData.id, formData)
      : this.researchService.createArticle(formData);

    request$.subscribe({
      next: () => {
        Swal.fire({ icon: 'success', title: this.isEdit ? 'อัปเดตสำเร็จ' : 'บันทึกสำเร็จ', showConfirmButton: false, timer: 1500 });
        if (!this.isEdit) this.resetForm();
      },
      error: (err) => {
        console.error(err);
        Swal.fire({ icon: 'error', title: 'เกิดข้อผิดพลาด', text: 'กรุณาลองใหม่อีกครั้ง' });
      },
    });
  }
  private buildFormData(): FormData {
    const fd = new FormData();
    const d = this.articleData;

    const append = (key: string, val: any) => fd.append(key, val ?? '');

    append('title_th', d.title_th);
    append('article_type', d.article_type);
    append('db_type', d.db_type);
    append('country', d.country);
    append('journal_name', d.journal_name);
    append('pre_location', d.pre_location);
    append('pages', d.pages);
    append('year_published', d.year_published);
    append('volume', d.volume);
    append('volume_no', d.volume_no);
    append('doi', d.doi);
    append('responsibilities', d.responsibilities);
    append('is_cooperation', d.is_cooperation);

    if (d.subject_area_id > 0) append('subject_area_id', String(d.subject_area_id));
    if (this.selectedFile) fd.append('article_file', this.selectedFile);

    this.internalRows
      .filter((r) => r.researcher_id)
      .forEach((r, i) => {
        fd.append(`internal_members[${i}][user_id]`, String(r.researcher_id));
        fd.append(`internal_members[${i}][role]`, r.responsibilities);
        fd.append(`internal_members[${i}][no]`, String(i + 1));
      });

    this.externalRows
      .filter((r) => r.name)
      .forEach((r, i) => {
        fd.append(`external_members[${i}][full_name]`, r.name);
        fd.append(`external_members[${i}][role]`, r.responsibilities);
        fd.append(`external_members[${i}][organization]`, r.organization);
        fd.append(`external_members[${i}][no]`, String(i + 1));
      });

    return fd;
  }

  private resetForm(): void {
    this.articleData = { ...DEFAULT_ARTICLE };
    this.internalRows = [{ id: 0, researcher_id: null, name: '', responsibilities: '' }];
    this.externalRows = [{ name: '', organization: '', responsibilities: '' }];
    this.selectedFile = null;
    this.selectedFileName = '';
    this.selectedMajor = null;
    this.selectedSub = null;
    this.searchMajor = '';
    this.selectedCountry = '';
    this.searchCountries = '';
  }
}
