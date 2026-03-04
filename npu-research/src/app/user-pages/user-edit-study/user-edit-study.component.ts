import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { EducationService } from '../../services/education.service';
import { EducationInfo } from '../../models/education.model';

@Component({
  selector: 'app-user-edit-study',
  standalone: false,
  templateUrl: './user-edit-study.component.html',
  styleUrl: './user-edit-study.component.css',
})
export class UserEditStudyComponent implements OnInit {
  userId!: string | null;
  isModalOpen = false;
  isEditMode = false;
  openDropdown: string | null = null;

  educationData: EducationInfo = {
    highest_education: '',
    field_of_study: '',
    qualification: '',
    gpa: '',
    institution: '',
    date_enrollment: '',
    date_graduation: '',
  };

  education: string[] = [
    'ต่ำกว่าประถมศึกษา',
    'ประถมศึกษา',
    'มัธยมศึกษาตอนต้น',
    'มัธยมศึกษาตอนปลาย',
    'ประกาศนียบัตรวิชาชีพ (ปวช.)',
    'ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)',
    'อนุปริญญา',
    'ปริญญาตรี',
    'ประกาศนียบัตรบัณฑิต',
    'ประกาศนียบัตรบัณฑิตชั้นสูง',
    'ปริญญาโท',
    'ปริญญาเอก',
    'หลังปริญญาเอก (Postdoctoral)',
  ];

  majors: string[] = [
    'วิทยาการคอมพิวเตอร์',
    'เทคโนโลยีสารสนเทศ',
    'วิศวกรรมคอมพิวเตอร์',
    'วิศวกรรมซอฟต์แวร์',
    'ปัญญาประดิษฐ์และวิทยาการข้อมูล',
    'ระบบสารสนเทศ',
    'คณิตศาสตร์',
    'สถิติ',
    'ฟิสิกส์',
    'เคมี',
    'ชีววิทยา',
    'เทคโนโลยีชีวภาพ',
    'วิทยาศาสตร์สิ่งแวดล้อม',
    'วิศวกรรมไฟฟ้า',
    'วิศวกรรมเครื่องกล',
    'วิศวกรรมโยธา',
    'บริหารธุรกิจ',
    'การจัดการ',
    'เศรษฐศาสตร์',
    'บัญชี',
    'รัฐศาสตร์',
    'นิติศาสตร์',
    'ศึกษาศาสตร์',
    'ครุศาสตร์',
    'แพทยศาสตร์',
    'พยาบาลศาสตร์',
    'สาธารณสุขศาสตร์',
    'เภสัชศาสตร์',
    'สัตวแพทยศาสตร์',
    'ศิลปศาสตร์',
    'มนุษยศาสตร์',
    'สังคมศาสตร์',
  ];

  qualifications: string[] = [
    'วุฒิการศึกษาทั่วไป',
    'วุฒิวิชาชีพ',
    'วุฒิครู',
    'วุฒิวิศวกร',
    'วุฒิวิชาชีพเฉพาะทาง',
    'วุฒิทางการแพทย์',
    'วุฒิทางการพยาบาล',
    'วุฒิทางกฎหมาย',
    'วุฒิวิชาการ',
    'วุฒิวิจัย',
    'วุฒิผู้เชี่ยวชาญ',
    'วุฒิหลังปริญญา',
    'วุฒิบัตร (Certificate)',
    'วุฒิบัตรวิชาชีพ (Professional Certificate)',
  ];

  institutions: string[] = [
    'โรงเรียนประถมศึกษา',
    'โรงเรียนมัธยมศึกษา',
    'วิทยาลัยเทคนิค',
    'วิทยาลัยอาชีวศึกษา',
    'วิทยาลัยชุมชน',
    'มหาวิทยาลัยของรัฐ',
    'มหาวิทยาลัยเอกชน',
    'สถาบันเทคโนโลยี',
    'สถาบันการพลศึกษา',
    'สถาบันราชภัฏ',
    'สถาบันเทคโนโลยีพระจอมเกล้า',
    'สถาบันการศึกษาในต่างประเทศ',
    'สถาบันฝึกอบรมวิชาชีพ',
    'สถาบันวิจัย',
  ];

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

  selectedEducationLevel = '';
  selectedMajors = '';
  selectedQualifications = '';
  selectedInstitutions = '';
  selectedCountries = '';

  searchEducationLevel = '';
  searchMajors = '';
  searchQualifications = '';
  searchInstitutions = '';
  searchCountries = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: EducationService
  ) {}

  ngOnInit(): void {
    this.loadEducation();
  }

  loadEducation() {
    this.service.getEducation().subscribe({
      next: (res) => {
        const data = res.data.education_info;
        if (data.date_graduation) {
          data.date_graduation = this.convertToISO(data.date_graduation);
        }

        if (data.date_enrollment) {
          data.date_enrollment = this.convertToISO(data.date_enrollment);
        }

        this.educationData = data;
      },
      error: (err) => console.error(err),
    });
  }

  toggle(el: string, event: MouseEvent) {
    event.stopPropagation();
    this.openDropdown = this.openDropdown === el ? null : el;
  }

  isOpen(e: string) {
    return this.openDropdown === e;
  }

  @HostListener('document:click')
  closeAll() {
    this.openDropdown = null;
  }

  filteredEducationLevel() {
    return this.education.filter((e) => e.includes(this.searchEducationLevel));
  }

  filteredMajor() {
    return this.majors.filter((m) => m.includes(this.searchMajors));
  }

  filteredQualification() {
    return this.qualifications.filter((q) =>
      q.includes(this.searchQualifications)
    );
  }

  filteredInstitution() {
    return this.institutions.filter((i) => i.includes(this.searchInstitutions));
  }

  filteredCountries() {
    const keyword = this.searchCountries.toLowerCase();

    return this.countries.filter(
      (c) =>
        c.name.toLowerCase().includes(keyword) ||
        c.code.toLowerCase().includes(keyword)
    );
  }

  openEditModal(data: EducationInfo) {
    this.isEditMode = true;
    this.educationData = { ...data };
    this.isModalOpen = true;
  }

  openAddModal() {
    this.isEditMode = false;

    this.educationData = {
      highest_education: '',
      field_of_study: '',
      qualification: '',
      gpa: '',
      institution: '',
      date_enrollment: '',
      date_graduation: '',
    };

    this.isModalOpen = true;
  }

  save() {
    Swal.fire({
      icon: 'question',
      title: 'ยืนยันการบันทึกข้อมูล',
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
    }).then((result) => {
      if (!result.isConfirmed) return;

      const payload = { ...this.educationData };

      const request$ = this.service.updateEducation(payload);

      request$.subscribe({
        next: () => this.handleSaveSuccess(),
        error: () => Swal.fire('ผิดพลาด', 'ไม่สามารถบันทึกข้อมูลได้', 'error'),
      });
    });
  }

  private handleSaveSuccess() {
    Swal.fire({
      icon: 'success',
      title: this.isEditMode ? 'แก้ไขสำเร็จ' : 'เพิ่มข้อมูลสำเร็จ',
      timer: 1500,
      showConfirmButton: false,
    }).then(() => {
      this.isModalOpen = false;
      this.resetForm();
      this.loadEducation();
    });
  }

  resetForm() {
    this.educationData = {
      highest_education: '',
      field_of_study: '',
      qualification: '',
      gpa: '',
      institution: '',
      date_enrollment: '',
      date_graduation: '',
    };

    this.searchEducationLevel = '';
    this.searchMajors = '';
    this.searchQualifications = '';
    this.searchInstitutions = '';
    this.searchCountries = '';
  }

  closeModal() {
    this.isModalOpen = false;
    this.loadEducation();
  }

  selectEducationLevel(e: string) {
    this.educationData.highest_education = e;
    this.searchEducationLevel = '';
    this.openDropdown = null;
  }

  selectMajor(m: string) {
    this.educationData.field_of_study = m;
    this.searchMajors = '';
    this.openDropdown = null;
  }

  selectQualification(q: string) {
    this.educationData.qualification = q;
    this.searchQualifications = '';
    this.openDropdown = null;
  }

  selectInstitution(i: string) {
    this.educationData.institution = i;
    this.searchInstitutions = '';
    this.openDropdown = null;
  }

  selectCountrie(c: { code: string; name: string }) {
    (this.educationData as any).country = c.name;
    this.searchCountries = '';
    this.openDropdown = null;
  }

  async saveGotoProfile() {
    await Swal.fire({
      title: 'กำลังบันทึกข้อมูล',
      timer: 800,
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    await Swal.fire({
      icon: 'success',
      title: 'สำเร็จ',
      text: 'อัปเดตข้อมูลเรียบร้อยแล้ว',
      timer: 1500,
      showConfirmButton: false,
    });

    const role = localStorage.getItem('role');

    this.router.navigateByUrl(
      role === 'admin' ? '/admin/profile' : '/user/profile'
    );
  }

  private convertToISO(thaiDate: string): string {
    if (!thaiDate) return '';

    const months: any = {
      มกราคม: '01',
      กุมภาพันธ์: '02',
      มีนาคม: '03',
      เมษายน: '04',
      พฤษภาคม: '05',
      มิถุนายน: '06',
      กรกฎาคม: '07',
      สิงหาคม: '08',
      กันยายน: '09',
      ตุลาคม: '10',
      พฤศจิกายน: '11',
      ธันวาคม: '12',
    };

    const parts = thaiDate.split(' ');
    const day = parts[0].padStart(2, '0');
    const month = months[parts[1]];
    const year = (parseInt(parts[2], 10) - 543).toString();

    return `${year}-${month}-${day}`;
  }
}
