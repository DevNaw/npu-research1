import { Component, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ResearchService } from '../../services/research.service';
import { Major, SubArea, ArticleForm } from '../../models/subject.model';
import { Researcher } from '../../models/researchers.model';
import { Article } from '../../models/aticle.model';

@Component({
  selector: 'app-user-add-aticle',
  standalone: false,
  templateUrl: './user-add-aticle.component.html',
  styleUrl: './user-add-aticle.component.css',
})
export class UserAddAticleComponent {
  isEdit = false;
  researchId?: number;
  reportFilename = '';
  selectedFileName = '';

  searchMajor = '';
  searchSub = '';
  selectedMajor: Major | null = null;
  majors: Major[] = [];
  selectedSub: SubArea | null = null;

  activeDropdown: string | null = null;
  activeMajor: Major | null = null;

  researchers: Researcher[] = [];
  searchResearcher = '';
  selectedResearcher: string | null = null;
  filteredResearchers: Researcher[] = [];
  activeRowIndex: number | null = null;
  searchKeyword = '';

  // ผู้ร่วมโครงการภายใน
  rows2 = [{id: Date.now(), name: '', responsibility: '' }];

  // ผู้ร่วมโครงการภายนอก
  rows = [{ name: '', organization: '', responsibility: '' }];

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

  article: ArticleForm = {
    responsibility: '',
    type: '',
    database_types: '',
    quality: '',
    major_id: null,
    sub_id: null,
  };

  articleData: Article = {
    title_th: '',
    title_en: '',
    abstract: '',
    year: '',
    published_date: '',
    call_other: '',
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
    subject_area_id: '',
    responsibilities: '',
    internal_members: [{
      user_id: 0,
      role: '',
      no: ''
    }],
    external_members: [{
      full_name: '',
      role: '',
      organization: '',
      no: '',
    }],
    article_type: ''
  }

  selectedCountries = '';
  searchCountries = '';
  countries = [
    { code: 'AF', name: 'อัฟกานิสถาน' },
    { code: 'AL', name: 'แอลเบเนีย' },
    { code: 'DZ', name: 'แอลจีเรีย' },
    { code: 'AD', name: 'อันดอร์รา' },
    { code: 'AO', name: 'แองโกลา' },
    { code: 'AG', name: 'แอนติกาและบาร์บูดา' },
    { code: 'AR', name: 'อาร์เจนตินา' },
    { code: 'AM', name: 'อาร์มีเนีย' },
    { code: 'AU', name: 'ออสเตรเลีย' },
    { code: 'AT', name: 'ออสเตรีย' },
    { code: 'AZ', name: 'อาเซอร์ไบจาน' },
    { code: 'BS', name: 'บาฮามาส' },
    { code: 'BH', name: 'บาห์เรน' },
    { code: 'BD', name: 'บังกลาเทศ' },
    { code: 'BB', name: 'บาร์เบโดส' },
    { code: 'BY', name: 'เบลารุส' },
    { code: 'BE', name: 'เบลเยียม' },
    { code: 'BZ', name: 'เบลีซ' },
    { code: 'BJ', name: 'เบนิน' },
    { code: 'BT', name: 'ภูฏาน' },
    { code: 'BO', name: 'โบลิเวีย' },
    { code: 'BA', name: 'บอสเนียและเฮอร์เซโกวีนา' },
    { code: 'BW', name: 'บอตสวานา' },
    { code: 'BR', name: 'บราซิล' },
    { code: 'BN', name: 'บรูไน' },
    { code: 'BG', name: 'บัลแกเรีย' },
    { code: 'BF', name: 'บูร์กินาฟาโซ' },
    { code: 'BI', name: 'บุรุนดี' },
    { code: 'KH', name: 'กัมพูชา' },
    { code: 'CM', name: 'แคเมอรูน' },
    { code: 'CA', name: 'แคนาดา' },
    { code: 'CV', name: 'เคปเวิร์ด' },
    { code: 'CF', name: 'สาธารณรัฐแอฟริกากลาง' },
    { code: 'TD', name: 'ชาด' },
    { code: 'CL', name: 'ชิลี' },
    { code: 'CN', name: 'จีน' },
    { code: 'CO', name: 'โคลอมเบีย' },
    { code: 'KM', name: 'คอโมโรส' },
    { code: 'CG', name: 'คองโก' },
    { code: 'CR', name: 'คอสตาริกา' },
    { code: 'HR', name: 'โครเอเชีย' },
    { code: 'CU', name: 'คิวบา' },
    { code: 'CY', name: 'ไซปรัส' },
    { code: 'CZ', name: 'สาธารณรัฐเช็ก' },
    { code: 'DK', name: 'เดนมาร์ก' },
    { code: 'DJ', name: 'จิบูตี' },
    { code: 'DO', name: 'โดมินิกัน' },
    { code: 'EC', name: 'เอกวาดอร์' },
    { code: 'EG', name: 'อียิปต์' },
    { code: 'SV', name: 'เอลซัลวาดอร์' },
    { code: 'EE', name: 'เอสโตเนีย' },
    { code: 'ET', name: 'เอธิโอเปีย' },
    { code: 'FI', name: 'ฟินแลนด์' },
    { code: 'FR', name: 'ฝรั่งเศส' },
    { code: 'GE', name: 'จอร์เจีย' },
    { code: 'DE', name: 'เยอรมนี' },
    { code: 'GH', name: 'กานา' },
    { code: 'GR', name: 'กรีซ' },
    { code: 'GT', name: 'กัวเตมาลา' },
    { code: 'HT', name: 'เฮติ' },
    { code: 'HN', name: 'ฮอนดูรัส' },
    { code: 'HK', name: 'ฮ่องกง' },
    { code: 'HU', name: 'ฮังการี' },
    { code: 'IS', name: 'ไอซ์แลนด์' },
    { code: 'IN', name: 'อินเดีย' },
    { code: 'ID', name: 'อินโดนีเซีย' },
    { code: 'IR', name: 'อิหร่าน' },
    { code: 'IQ', name: 'อิรัก' },
    { code: 'IE', name: 'ไอร์แลนด์' },
    { code: 'IL', name: 'อิสราเอล' },
    { code: 'IT', name: 'อิตาลี' },
    { code: 'JP', name: 'ญี่ปุ่น' },
    { code: 'JO', name: 'จอร์แดน' },
    { code: 'KZ', name: 'คาซัคสถาน' },
    { code: 'KE', name: 'เคนยา' },
    { code: 'KR', name: 'เกาหลีใต้' },
    { code: 'KW', name: 'คูเวต' },
    { code: 'LA', name: 'ลาว' },
    { code: 'LV', name: 'ลัตเวีย' },
    { code: 'LB', name: 'เลบานอน' },
    { code: 'LY', name: 'ลิเบีย' },
    { code: 'LT', name: 'ลิทัวเนีย' },
    { code: 'LU', name: 'ลักเซมเบิร์ก' },
    { code: 'MY', name: 'มาเลเซีย' },
    { code: 'MX', name: 'เม็กซิโก' },
    { code: 'MM', name: 'เมียนมา' },
    { code: 'NP', name: 'เนปาล' },
    { code: 'NL', name: 'เนเธอร์แลนด์' },
    { code: 'NZ', name: 'นิวซีแลนด์' },
    { code: 'NO', name: 'นอร์เวย์' },
    { code: 'PK', name: 'ปากีสถาน' },
    { code: 'PH', name: 'ฟิลิปปินส์' },
    { code: 'PL', name: 'โปแลนด์' },
    { code: 'PT', name: 'โปรตุเกส' },
    { code: 'QA', name: 'กาตาร์' },
    { code: 'RU', name: 'รัสเซีย' },
    { code: 'SA', name: 'ซาอุดีอาระเบีย' },
    { code: 'SG', name: 'สิงคโปร์' },
    { code: 'ZA', name: 'แอฟริกาใต้' },
    { code: 'ES', name: 'สเปน' },
    { code: 'SE', name: 'สวีเดน' },
    { code: 'CH', name: 'สวิตเซอร์แลนด์' },
    { code: 'TH', name: 'ไทย' },
    { code: 'TR', name: 'ตุรกี' },
    { code: 'UA', name: 'ยูเครน' },
    { code: 'AE', name: 'สหรัฐอาหรับเอมิเรตส์' },
    { code: 'GB', name: 'สหราชอาณาจักร' },
    { code: 'US', name: 'สหรัฐอเมริกา' },
    { code: 'VN', name: 'เวียดนาม' },
    { code: 'ZW', name: 'ซิมบับเว' },
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private researchService: ResearchService
  ) {}

  ngOnInit() {
    this.loadSubjectAreas();
    this.loadResearchersData();

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');

      if (id) {
        this.isEdit = true;
        this.researchId = +id;
        this.loadAticleData(this.researchId);
      } else {
        this.isEdit = false;
      }
    });

    this.addInternal();
    this.addExternal();
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

  loadAticleData(id: number) {
    this.rows = [
      {
        name: 'นาย A',
        organization: 'ผู้เชี่ยวชาญ',
        responsibility: 'บริษัท ABC',
      },
    ];
  }

  addRow() {
    this.rows.push({ name: '', organization: '', responsibility: '' });
  }

  addRow2() {
    this.rows2.push({id: Date.now()+ Math.random(), name: '', responsibility: '' });
  }

  removeRow(index: number) {
    this.rows.splice(index, 1);
  }

  removeRow2(index: number) {
    this.rows2.splice(index, 1);
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
  reportFileName = '';

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

  selectValue<K extends keyof typeof this.article>(
    field: K,
    value: ArticleForm[K]
  ): void {
    if (
      field === 'responsibility' &&
      value === 'First Author (ผู้ประพันธ์อันดับแรก)'
    ) {
      if (this.isFirstAuthorTaken()) {
        return;
      }
    }

    this.article[field] = value;
    this.activeDropdown = null;
  }

  @HostListener('document:click')
  closeAll() {
    this.activeDropdown = null;
    this.activeMajor = null;
    this.activeRowIndex = null;
  }

  selectMajor(major: Major) {
    this.selectedMajor = major;
    this.selectedSub = null;
    this.searchMajor = '';
  }

  filteredMajor(): Major[] {
    if (!this.searchMajor) return this.majors;

    return this.majors.filter((m) =>
      m.name_en.toLowerCase().includes(this.searchMajor.toLowerCase())
    );
  }

  saveData() {
    Swal.fire({
      icon: 'success',
      title: 'บันทึกข้อมูลสำเร็จ',
      text: 'ระบบได้บันทึกข้อมูลเรียบร้อยแล้ว',
      showConfirmButton: false,
      timer: 1500,
      customClass: {
        title: 'swal-title-lg',
        htmlContainer: 'swal-text-2xl',
      },
    });
  }

  selectRowResponsibility(row: any, value: string) {
    if (
      value === 'First Author (ผู้ประพันธ์อันดับแรก)' &&
      this.isFirstAuthorTaken(row)
    ) {
      return;
    }

    row.responsibility = value;
    this.activeDropdown = null;
  }

  selectCountrie(c: { code: string; name: string }) {
    this.selectedCountries = c.name;
    this.searchCountries = '';

    this.activeDropdown = null;
  }

  filteredCountries() {
    const keyword = this.searchCountries.toLowerCase();

    return this.countries.filter(
      (c) =>
        c.name.toLowerCase().includes(keyword) ||
        c.code.toLowerCase().includes(keyword)
    );
  }

  isFirstAuthorTaken(currentRow?: any): boolean {
    if (
      this.article?.responsibility === 'First Author (ผู้ประพันธ์อันดับแรก)'
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

  loadSubjectAreas() {
    this.researchService.getSubjectArea().subscribe({
      next: (res) => {
        this.majors = res.data.subject_areas;
      },
      error: (err) => {
        console.error('โหลด subject area ไม่สำเร็จ', err);
      },
    });
  }

  selectSub(sub: SubArea) {
    this.selectedSub = sub;
    this.activeDropdown = null;
    this.activeMajor = null;

    this.article.major_id = sub.major_id;
    this.article.sub_id = sub.sub_id;
  }

  filteredSub() {
    if (!this.selectedMajor) return [];

    return this.selectedMajor.children.filter((s) =>
      s.name_en.toLowerCase().includes(this.searchSub.toLowerCase())
    );
  }

  toggleMajor(major: Major, event: Event) {
    event.stopPropagation();

    if (this.activeMajor?.major_id === major.major_id) {
      this.activeMajor = null; // กดซ้ำ = ปิด
    } else {
      this.activeMajor = major;
    }
  }

  loadResearchersData() {
    this.researchService.getResearchers().subscribe({
      next: (res) => {
        this.researchers = res.data.$researchers ?? [];
        this.filteredResearchers = this.researchers;
      },
    });
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
      r.full_name?.toLowerCase().includes(value.toLowerCase())
    );
  }

  selectResearcher(r: Researcher, j: any) {
    j.name = r.full_name;
    j.user_id = r.user_id;

    this.activeRowIndex = null;
  }

  // Send Data 
  createArticle() {
    const formData = new FormData();
  
    // ===== Basic Article =====
    formData.append('title_th', this.articleData.title_th);
    formData.append('title_en', this.articleData.title_en);
    formData.append('abstract', this.articleData.abstract);
    formData.append('year', this.articleData.year);
    formData.append('published_date', this.articleData.published_date);
    formData.append('call_other', this.articleData.call_other);
    formData.append('db_type', this.articleData.db_type);
    formData.append('country', this.articleData.country);
    formData.append('journal_name', this.articleData.journal_name);
    formData.append('pre_location', this.articleData.pre_location);
    formData.append('pages', this.articleData.pages);
    formData.append('year_published', this.articleData.year_published);
    formData.append('volume', this.articleData.volume);
    formData.append('volume_no', this.articleData.volume_no);
    formData.append('is_cooperation', this.articleData.is_cooperation);
    formData.append('doi', this.articleData.doi);
    formData.append('subject_area_id', this.articleData.subject_area_id);
    formData.append('responsibilities', this.articleData.responsibilities);
    formData.append('article_type', this.articleData.article_type);
  
    // ===== Internal Members =====
    const internal = this.rows2.map((r, index) => ({
      no: index + 1,
      user_id: r.id || 0,
      role: r.responsibility
    }));
  
    formData.append('internal_members', JSON.stringify(internal));
  
    // ===== External Members =====
    const external = this.rows.map((r, index) => ({
      no: index + 1,
      full_name: r.name,
      organization: r.organization,
      role: r.responsibility
    }));
  
    formData.append('external_members', JSON.stringify(external));
  
    // ===== File =====
    if (this.articleData.article_file) {
      formData.append('article_file', this.articleData.article_file);
    }
  
    if (this.articleData.image) {
      formData.append('image', this.articleData.image);
    }
  
    // ===== Call API =====
    this.researchService.createArticle(formData).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          showConfirmButton: false,
          timer: 1500,
        });
      },
      error: (err) => {
        console.error(err);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
        });
      }
    });
  }
}
