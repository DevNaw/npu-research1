import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResearchService } from '../../services/research.service';
import { ResearchArticle } from '../../models/article-show.model';
import { AuthService } from '../../services/auth.service';
import { ProjectDetailApi } from '../../models/research-detai.model';
import { Observable, of, switchMap } from 'rxjs';
import { InnovationApi } from '../../models/innovation-detai.model';

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
          console.log(this.handleResponseByType(res));
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

  // Update Image
  // uploadImage() {
  //   if (!this.selectedFile) return;

  //   const formData = new FormData();
  //   formData.append('image', this.selectedFile);

  //   this.service.updateArticle(this.id, formData).subscribe({
  //     next: (res: any) => {
  //       this.img = res;

  //       this.previewImage = null;
  //       this.selectedFile = null;

  //       console.log('Upload success');
  //     },
  //     error: (err) => {
  //       console.error('Upload error:', err);
  //     },
  //   });
  // }

uploadImage(): void {
  if (!this.selectedFile || !this.id || !this.type) return;

  const formData = new FormData();
  formData.append('image', this.selectedFile);

  if (this.type === 'article') {
    this.service.updateArticle(this.id, formData).subscribe({
      next: (res: any) => {
        this.img = res;

        this.previewImage = null;
        this.selectedFile = null;
      },
      error: (err) => {
        console.error('Upload error:', err);
      }
    });
  }

  if (this.type === 'research') {
    this.service.updateProject(this.id, formData).subscribe({
      next: (res: any) => {
        this.img = res;

        this.previewImage = null;
        this.selectedFile = null;
      }, error: (err) => {
        console.error('Upload error:', err);
      }
    });
  }

  if (this.type === 'innovation') {
    this.service.updateInnovation(this.id, formData).subscribe({
      next: (res: any) => {
        this.img = res;

        this.previewImage = null;
        this.selectedFile = null;
      }, error: (err) => {
        console.error('Upload error:', err);
      }
    })
  }
  
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

  private getRequestByType(type: WorkType, id: number) {
    switch (type) {
      case 'article':
        return this.service.getArticleById(id);
  
      case 'research':
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
  
      case 'research':
        this.researchData = res.data.projectDetail;
        break;
  
      case 'innovation':
        this.innovationData = res.data.researchInnovation;
        console.log(this.innovationData);
        break;
    }
  }
  
}
