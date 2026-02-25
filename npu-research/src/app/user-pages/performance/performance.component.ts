import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResearchService } from '../../services/research.service';
import { ResearchArticle } from '../../models/article-show.model';
import { AuthService } from '../../services/auth.service';
import { ProjectDetailApi } from '../../models/research-detai.model';
import { Observable, of, switchMap } from 'rxjs';
import { InnovationApi } from '../../models/innovation-detai.model';
import Swal from 'sweetalert2';

type WorkType = 'project' | 'article' | 'innovation';

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
  researchData: ProjectDetailApi | null = null;
  innovationData: InnovationApi| null = null;
  img: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ResearchService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const type = params.get('type') as WorkType;
          const id = params.get('id');
  
          if (!id || !type) return of(null);
  
          this.type = type;
          this.id = Number(id);
          
          return this.getRequestByType(type, this.id);
        })
      )
      .subscribe({
        next: (res) => {
          if (!res) return;

          this.handleResponseByType(res);
        },
        error: (err) => {
          console.error('Error loading data:', err);
        },
      });
  }
  

  openImage(img: string) {
    this.selectedImage = img;
  }

  closeImage() {
    this.selectedImage = null;
  }

  uploadImage(): void {
    if (!this.selectedFile) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาเลือกไฟล์ก่อนอัปโหลด',
        confirmButtonText: 'ตกลง'
      });
      return;
    }
  
    if (!this.id || !this.type) return;
  
    const formData = new FormData();
    formData.append('image', this.selectedFile);
  
    Swal.fire({
      title: 'กำลังอัปโหลด...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading()
    });
  
    let request$;
  
    if (this.type === 'article') {
      request$ = this.service.updateArticle(this.id, formData);
    } 
    else if (this.type === 'project') {
      request$ = this.service.updateProject(this.id, formData);
    } 
    else if (this.type === 'innovation') {
      request$ = this.service.updateInnovation(this.id, formData);
    }
  
    request$?.subscribe({
      next: (res: any) => {
        this.img = res;
  
        Swal.fire({
          icon: 'success',
          title: 'อัปโหลดสำเร็จ',
          showConfirmButton: false,
          timer: 1200
        }).then(() => {
          window.location.reload();
        });
      },
      error: (err) => {
        console.error('Upload error:', err);
  
        Swal.fire({
          icon: 'error',
          title: 'อัปโหลดไม่สำเร็จ',
          text: 'กรุณาลองใหม่อีกครั้ง'
        });
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
      case 'project':
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

  private getRequestByType(type: WorkType, id: number) {
    switch (type) {
      case 'article':
        return this.service.getArticleById(id);
  
      case 'project':
        return this.service.getProjectById(id);
  
      case 'innovation':
        return this.service.getInnovationById(id);
  
      default:
        return of(null);
    }
  }

  private handleResponseByType(res: any) {
    switch (this.type) {
      case 'article':
        this.articleData = res.data.researchArticle;
        
        break;
  
      case 'project':
        this.researchData = res.data.projectDetail;
        break;
  
      case 'innovation':
        this.innovationData = res.data.researchInnovation;
        break;
    }
  }
  
}
