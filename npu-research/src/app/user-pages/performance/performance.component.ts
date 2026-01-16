import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
type WorkType = 'research' | 'article' | 'innovation';

@Component({
  selector: 'app-performance',
  standalone: false,
  templateUrl: './performance.component.html',
  styleUrl: './performance.component.css'
})
export class PerformanceComponent {
  type!: WorkType;
  id!: number;

  data: any; // mock data (แทน API)

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.type = this.route.snapshot.paramMap.get('type') as WorkType;
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    this.loadMockData();
  }

  loadMockData() {
    if (this.type === 'research') {
      this.data = {
        title: 'โครงการวิจัยระบบอัจฉริยะ',
        field: 'วิทยาการคอมพิวเตอร์',
        responsibility: 'หัวหน้าโครงการ',
        status: 'อยู่ระหว่างดำเนินการ',
        fundSource: 'ทุนภายใน',
        budget: '500,000',
        year: '2567',
        cooperation: 'ร่วมกับมหาวิทยาลัย X',
        area: 'จังหวัดเชียงใหม่',
        benefitArea: 'ภาคการศึกษา',
        internalMembers: [
          { name: 'อ.สมชาย', role: 'ผู้เชี่ยวชาญ' }
        ],
        externalMembers: [
          { name: 'ดร.สมศรี', role: 'ที่ปรึกษา', org: 'มหาวิทยาลัย Y' }
        ],
        files: {
          report: 'report.pdf',
          contract: 'contract.pdf'
        }
      };
    }

    if (this.type === 'article') {
      this.data = {
        title: 'บทความ AI Journal',
        articleType: 'วารสาร',
        publisher: 'IEEE',
        pages: '12-20',
        year: '2024',
        field: 'AI',
        responsibility: 'ผู้ร่วมโครงการ',
        weight: 'Q1',
        doi: 'https://doi.org/xxxx',
        files: { pdf: 'article.pdf' }
      };
    }

    if (this.type === 'innovation') {
      this.data = {
        title: 'ระบบตรวจจับอัจฉริยะ',
        field: 'นวัตกรรม',
        principle: 'ใช้ AI วิเคราะห์ภาพ',
        responsibility: 'หัวหน้าโครงการ',
        fundSource: 'ทุนภายนอก',
        budget: '1,000,000',
        year: '2566',
        patentNo: 'TH123456',
        requestNo: 'REQ789',
        patentUrl: 'https://patent.go.th',
        files: {
          report: 'innovation.pdf',
          image: 'image.png'
        }
      };
    }
  }

  goBack() {
    this.router.navigate(['/user-profile']);
  }

  goEdit() {
    this.router.navigate([`/user-add-${this.type}`, this.id]);
  }
}
