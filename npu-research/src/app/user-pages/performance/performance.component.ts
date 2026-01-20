import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
type WorkType = 'research' | 'article' | 'innovation';

@Component({
  selector: 'app-performance',
  standalone: false,
  templateUrl: './performance.component.html',
  styleUrl: './performance.component.css',
})
export class PerformanceComponent {
  type!: WorkType;
  id!: number;

  data: any; // mock data (แทน API)

  constructor(private route: ActivatedRoute, private router: Router) {}

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
        status: 'เสร็จสิ้น',
        fundSource: 'ทุนภายใน',
        budget: 500000,
        year: '2567',
        cooperation: 'ร่วมกับมหาวิทยาลัย X',
        area: 'จังหวัดเชียงใหม่',
        benefitArea: 'ภาคการศึกษา',
        internalMembers: [{ name: 'อ.สมชาย', role: 'ผู้เชี่ยวชาญ' }],
        externalMembers: [
          { name: 'ดร.สมศรี', role: 'ที่ปรึกษา', org: 'มหาวิทยาลัย Y' },
        ],
        files: {
          report: 'report.pdf',
          contract: 'contract.pdf',
        },
      };
    }

    if (this.type === 'article') {
      this.data = {
        title: 'บทความ AI Journal',
        articleType: 'วารสาร',
        publisher: 'IEEE',
        pages: '12-20',
        year: '2024',
        field: 'วิทยาการคอมพิวเตอร์',
        responsibility: 'ผู้ร่วมโครงการ',
        location: 'Journal of Interdisciplinary Mathematics',
        weight: 'Q1',
        doi: 'https://doi.org/xxxx',
        internalMembers: [{ name: 'อ.สมชาย', role: 'ผู้เชี่ยวชาญ' }],
        externalMembers: [
          { name: 'ดร.สมศรี', role: 'ที่ปรึกษา', org: 'มหาวิทยาลัย Y' },
        ],
        collaboration: [],
        files: { pdf: 'article.pdf' },
      };
    }

    if (this.type === 'innovation') {
      this.data = {
        title: 'ระบบตรวจจับอัจฉริยะ',
        field: 'สาขาวิศวกรรมศาสตร์และอุตสาหกรรมวิจัย',
        principle:
          'ปัจจุบันกระบวนการผลิตเมล็ดแมคคาเดเมียก่อนนำไปแปรรูปเป็นผลิตภัณฑ์ต่าง ๆ ในอุตสาหกรรมส่วนใหญ่ยังคงอาศัยการคัดแยกขนาดด้วยแรงงานคนเป็นหลัก จากการสำรวจพบว่า กระบวนการดังกล่าวทำให้เกิดเมล็ดแมคคาเดเมียที่ไม่ได้ขนาดตามมาตรฐานประมาณร้อยละ 10–15 ซึ่งมักปะปนกับเศษหิน ดิน ไม้ และสิ่งแปลกปลอมอื่น ๆ ส่งผลให้ไม่สามารถนำไปใช้ในกระบวนการแปรรูปได้อย่างมีประสิทธิภาพ อีกทั้งยังประสบปัญหาการตกหล่นจากข้อจำกัดด้านความแม่นยำของการคัดแยกด้วยแรงงานคน ด้วยเหตุนี้ จึงได้มีแนวคิดในการพัฒนาเครื่องจักรสำหรับคัดแยกขนาดเมล็ดแมคคาเดเมีย เพื่อลดการสูญเสีย เพิ่มความแม่นยำ และสามารถรองรับการผลิตในเชิงพาณิชย์ได้อย่างมีประสิทธิภาพ โดยเครื่องจักรดังกล่าวสามารถนำไปประยุกต์ใช้กับการคัดแยกขนาดของผลิตภัณฑ์ทางการเกษตรอื่น ๆ ที่มีลักษณะและขนาดแตกต่างกันได้ เครื่องจักรที่ใช้ในการคัดแยกขนาดเมล็ดหรือผลิตภัณฑ์โดยทั่วไปสามารถจำแนกได้เป็น 2 ลักษณะหลัก ได้แก่ เครื่องจักรที่มีลักษณะเป็นสายพานลำเลียงพร้อมตะแกรงคัดขนาด โดยเมล็ดหรือผลิตภัณฑ์จะเคลื่อนที่ไปตามแผ่นตะแกรงที่มีรูขนาดแตกต่างกัน เมล็ดที่มีขนาดใหญ่ที่สุดจะตกลงสู่ช่องคัดขนาดใหญ่ ส่วนเมล็ดขนาดเล็กจะตกผ่านรูตะแกรงตามลำดับจนถึงขนาดที่ต้องการ วิธีการนี้มักใช้มอเตอร์ไฟฟ้าในการช่วยขับเคลื่อนระบบคัดแยก เครื่องจักรที่อาศัยหลักการของลูกกลิ้งหมุนร่วมกับสายพานลำเลียง โดยใช้ระยะห่างระหว่างลูกกลิ้งที่แตกต่างกันเพื่อคัดแยกขนาดเมล็ด ซึ่งสามารถให้ความแม่นยำในระดับหนึ่ง อย่างไรก็ตาม เครื่องจักรทั้งสองลักษณะยังคงมีข้อจำกัด โดยเครื่องจักรแบบตะแกรงคัดขนาดมักมีช่องคัดขนาดที่มีระยะห่างใกล้เคียงกัน ส่งผลให้ประสิทธิภาพการคัดแยกต่ำเมื่อเปรียบเทียบกับเครื่องจักรแบบลูกกลิ้ง ขณะที่เครื่องจักรแบบลูกกลิ้งพบปัญหาในการควบคุมการทำงานของเครื่องให้มีความเร็วรอบที่เหมาะสม หากปรับความเร็วสูงเกินไป เมล็ดอาจกลิ้งผ่านสายพานเร็วเกินไปทำให้การคัดแยกขาดความแม่นยำ และอาจก่อให้เกิดความเสียหายต่อเมล็ดผลิตภัณฑ์ได้',
        responsibility: 'หัวหน้าโครงการ',
        fundSource: 'ทุนภายนอก',
        budget: 1000000,
        year: '2566',
        patentNo: 'TH123456',
        requestNo: 'REQ789',
        patentUrl: 'https://patent.go.th',
        files: {
          report: 'innovation.pdf',
          images: ['/assets/news1.jpg', '/assets/news2.jpg'],
        },
      };
    }
  }

  goEdit() {
    let route = '';

    switch (this.type) {
      case 'research':
        route = '/user-edit-research';
        break;

      case 'article':
        route = '/user-edit-aticle';
        break;

      case 'innovation':
        route = '/user-edit-innovation';
        break;
    }

    this.router.navigate([route, this.id]);
  }

  selectedImage: string | null = null;

  openImage(img: string) {
    this.selectedImage = img;
  }

  closeImage() {
    this.selectedImage = null;
  }
}
