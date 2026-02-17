import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResearchService } from '../../services/research.service';
import { ResearchArticle } from '../../models/article-show.model';
import { AuthService } from '../../services/auth.service';

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
  selectedImage: string | null = null;

  selectedFile: File | null = null;
  previewImage: string | null = null;

  data: any; // mock data (แทน API)
  articleData: ResearchArticle | null = null;
  img: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articleService: ResearchService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.type = params.get('type') as WorkType;

      const id = params.get('id');

      if (id) {
        this.id = Number(id);
        this.loadArticleData(this.id);
      }
    });
  }

  loadArticleData(id: number) {
    this.articleService.getArticleById(id).subscribe({
      next: (res) => {
        this.articleData = res.data.researchArticle;
        console.log(this.articleData);
      },
      error: (err) => {
        console.error('Error fetching article data:', err);
      },
    });
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

  openImage(img: string) {
    this.selectedImage = img;
  }

  closeImage() {
    this.selectedImage = null;
  }

  // Update Image
  uploadImage() {
    if (!this.selectedFile) return;
  
    const formData = new FormData();
    formData.append('image', this.selectedFile);
  
    this.articleService.updateArticle(this.id, formData).subscribe({
      next: (res: any) => {
        this.img = res;
        
        this.previewImage = null;
        this.selectedFile = null;
  
        console.log('Upload success');
      },
      error: (err) => {
        console.error('Upload error:', err);
      }
    });
  }
  

  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      this.selectedFile = file;

      // แสดง preview
      const reader = new FileReader();
      reader.onload = () => {
        this.previewImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  editItem(id: number | undefined) {
    if (!id) return;

    const isAdmin = this.authService.isAdmin();
  const base = isAdmin ? '/admin' : '/user';

  let route = '';

  switch (this.type) {
    case 'research':
      route = `${base}/edit-research/${id}`;
      break;

    case 'article':
      route = `${base}/edit-aticle/${id}`;
      break;

    case 'innovation':
      route = `${base}/edit-innovation/${id}`;
      break;

    default:
      console.warn('Unknown type:', this.type);
      return;
  }

    this.router.navigateByUrl(route);
  }
}
