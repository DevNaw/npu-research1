import { Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-user-edit-study',
  standalone: false,
  templateUrl: './user-edit-study.component.html',
  styleUrl: './user-edit-study.component.css'
})
export class UserEditStudyComponent {
  isModalOpen = false;
  isModalOpenEdit = false;
  openDropdown: string | null = null;

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

  editEducationId = '';
  educationList = '';
  gpa = '';
  startYear = '';
  endYear = '';

  constructor(private router: Router) {}

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

  selectEducationLevel(e: string) {
    this.selectedEducationLevel = e;
    this.searchEducationLevel = '';
    this.openDropdown = null;
  }

  selectMajor(m: string) {
    this.selectedMajors = m;
    this.searchMajors = '';
    this.openDropdown = null;
  }

  selectQualification(q: string) {
    this.selectedQualifications = q;
    this.searchQualifications = '';
    this.openDropdown = null;
  }

  selectInstitution(i: string) {
    this.selectedInstitutions = i;
    this.searchInstitutions = '';
    this.openDropdown = null;
  }

  selectCountrie(c: { code: string; name: string }) {
    this.selectedCountries = c.name;
    this.searchCountries = '';
    this.openDropdown = null;
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  save() {
    Swal.fire({
      title: 'ยืนยันการบันทึกข้อมูล',
      text: 'คุณต้องการบันทึกข้อมูลการศึกษาทั้งหมดหรือไม่?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#22c55e',
      cancelButtonColor: '#9ca3af',
      reverseButtons: true,
    }).then((result) => {
      if (!result.isConfirmed) return;

      // ===== ตัวอย่างข้อมูลที่จะส่ง (ปรับตามจริง) =====
      const payload = this.educationList;
      // หรือ
      // const payload = this.form.value;

      console.log('SAVE EDUCATION LIST :', payload);

      // ===== ถ้ามี API =====
      // this.educationService.save(payload).subscribe({
      //   next: () => this.afterSave(),
      //   error: () => this.saveError()
      // });

      // ===== mock success =====
      this.afterSave();
    });
  }

  saveAdd() {
    Swal.fire({
      title: 'ยืนยันการบันทึกข้อมูล',
      text: 'คุณต้องการบันทึกข้อมูลการศึกษานี้ใช่หรือไม่?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#4f46e5', // indigo
      cancelButtonColor: '#9ca3af',
      reverseButtons: true,
    }).then((result) => {
      if (!result.isConfirmed) return;

      // ===== payload =====
      const payload = {
        educationLevel: this.selectedEducationLevel,
        major: this.selectedMajors,
        qualification: this.selectedQualifications,
        institution: this.selectedInstitutions,
        country: this.selectedCountries,
        gpa: this.gpa,
        startYear: this.startYear,
        endYear: this.endYear,
      };

      console.log('SAVE EDUCATION :', payload);

      // ===== success =====
      Swal.fire({
        icon: 'success',
        title: 'บันทึกสำเร็จ',
        text: 'ข้อมูลการศึกษาถูกบันทึกเรียบร้อยแล้ว',
        confirmButtonText: 'ตกลง',
        confirmButtonColor: '#22c55e',
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        // ปิด modal
        this.closeModal();

        // reset form (ถ้าต้องการ)
        this.resetForm();
      });
    });
  }

  saveEdit() {
    Swal.fire({
      title: 'ยืนยันการแก้ไขข้อมูล',
      text: 'คุณต้องการบันทึกการแก้ไขข้อมูลการศึกษานี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'บันทึกการแก้ไข',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#9ca3af',
      reverseButtons: true,
    }).then((result) => {
      if (!result.isConfirmed) return;

      // ===== payload สำหรับแก้ไข =====
      const payload = {
        id: this.editEducationId, // id ของรายการที่แก้ไข
        educationLevel: this.selectedEducationLevel,
        major: this.selectedMajors,
        qualification: this.selectedQualifications,
        institution: this.selectedInstitutions,
        country: this.selectedCountries,
        gpa: this.gpa,
        startYear: this.startYear,
        endYear: this.endYear,
      };

      console.log('EDIT EDUCATION :', payload);

      // ===== success =====
      Swal.fire({
        icon: 'success',
        title: 'แก้ไขสำเร็จ',
        text: 'ข้อมูลการศึกษาถูกแก้ไขเรียบร้อยแล้ว',
        confirmButtonColor: '#22c55e',
        timer: 1500,
        showConfirmButton: false,
      }).then(() => {
        this.closeModalEdit();
        this.resetForm();
      });
    });
  }

  resetForm() {
    this.selectedEducationLevel = '';
    this.selectedMajors = '';
    this.selectedQualifications = '';
    this.selectedInstitutions = '';
    this.selectedCountries = '';
    this.gpa = '';
    this.startYear = '';
    this.endYear = '';
  }

  openModalEdit() {
    this.isModalOpenEdit = true;
  }

  closeModalEdit() {
    this.isModalOpenEdit = false;
  }

  afterSave() {
    Swal.fire({
      icon: 'success',
      title: 'บันทึกสำเร็จ',
      text: 'ระบบได้บันทึกข้อมูลเรียบร้อยแล้ว',
      confirmButtonColor: '#4f46e5',
      timer: 1500,
      showConfirmButton: false,
    }).then(() => {
      this.router.navigate(['/user-profile']);
    });
  }

}
