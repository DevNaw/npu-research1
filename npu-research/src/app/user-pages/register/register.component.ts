import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  open = false;
  constructor(private router: Router) {}

  goToLogin() {
    this.router.navigate(['/login']);
  }

  majors = [
    { value: 'cs', label: 'สาขาเกษตรศาสตร์และชีววิทยา' },
    { value: 'it', label: 'สาขาวิศวกรรมศาสตร์และอุตสาหกรรมวิจัย' },
    { value: 'se', label: 'สาขาปรัชญา' },
    { value: 'ce', label: 'สาขานิติศาสตร์' },
    { value: 'is', label: 'สาขารัฐศาสตร์และรัฐประศาสนศาสตร์' },
    { value: 'ai', label: 'สาขาเศรษฐศาสตร์' },
    { value: 'ds', label: 'สาขาสังคมวิทยา' },
    { value: 'mc', label: 'สาขาเทคโนโลยีสารสนเทศและนิเทศศาสตร์' },
    { value: 'gd', label: 'สาขาการศึกษา' },
    { value: 'ba', label: 'ดนตรีวิทยา' },
    { value: 'ba', label: 'มานุษยดุริยางควิทยา' },
    { value: 'ba', label: 'มนุษยศาสตร์และสังคมศาสตร์' },
    { value: 'ba', label: 'การจัดการการบิน' },
    { value: 'ba', label: 'บริหารธุรกิจ' },
    { value: 'ba', label: 'เทคโนโลยีอาหาร/โภชณาการอาหาร' },
    { value: 'ba', label: 'วิศวกรรมขนส่งและโลจิสติกส์' },
    { value: 'ba', label: 'พยาบาลศาสตร์' },
    { value: 'ba', label: 'การพัฒนาระบบสุขภาพชุมชน' },
    { value: 'ba', label: 'ท่องเที่ยว - ชุมชนผู้สูงอายุ' },
    { value: 'ba', label: 'วิศวกรรมศาสตร์ - พลังงาน' },
    { value: 'ba', label: 'สาขาวิศวกรรมศาสตร์และอุตสาหกรรมวิจัย - ช่างยนต์' },
  ];

  selectedMajor: any = null;

  toggle() {
    this.open = !this.open;
  }

  selectMajor(major: any) {
    this.selectedMajor = major;
    this.open = false;
  }
}
