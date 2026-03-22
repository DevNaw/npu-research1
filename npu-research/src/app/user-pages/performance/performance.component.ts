import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ResearchService } from '../../services/research.service';
import { ResearchArticle, ResearchOwner } from '../../models/article-show.model';
import { AuthService } from '../../services/auth.service';
import { OecdMajorApi, OecdMajorUI, ProjectDetailApi, ResearchOwnerProject } from '../../models/research-detai.model';
import { of, switchMap } from 'rxjs';
import { InnovationApi, ResearchOwnerInnovation } from '../../models/innovation-detai.model';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';
import { MainComponent } from '../../shared/layouts/main/main.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

type WorkType = 'project' | 'article' | 'innovation';

@Component({
  selector: 'app-performance',
  standalone: false,
  templateUrl: './performance.component.html',
  styleUrl: './performance.component.css',
})
export class PerformanceComponent {
  safeDescription!: SafeHtml;
  type!: WorkType;
  id!: number;
  selectedImage: string | null = null;

  selectedFile: File | null = null;
  previewImage: string | null = null;

  data: any;
  articleData: ResearchArticle | null = null;
  researchData: ProjectDetailApi | null = null;
  innovationData: InnovationApi | null = null;

  ownerArticle: ResearchOwner | null = null;
    ownerProject: ResearchOwnerProject | null = null;
    ownerInnovation: ResearchOwnerInnovation | null = null;
  img: any;

  galleryImages: string[] = [];

  oecdUI: OecdMajorUI[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private service: ResearchService,
    private authService: AuthService,
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    MainComponent.showLoading();
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
          MainComponent.hideLoading();
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
        confirmButtonText: 'ตกลง',
      });
      return;
    }

    if (!this.id || !this.type) return;

    const formData = new FormData();
    formData.append('image', this.selectedFile);

    Swal.fire({
      title: 'กำลังอัปโหลด...',
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    let request$;

    if (this.type === 'article') {
      request$ = this.service.updateArticle(this.id, formData);
    } else if (this.type === 'project') {
      request$ = this.service.updateProject(this.id, formData);
    } else if (this.type === 'innovation') {
      request$ = this.service.updateInnovation(this.id, formData);
    }

    request$?.subscribe({
      next: (res: any) => {
        this.img = res;

        Swal.fire({
          icon: 'success',
          title: 'อัปโหลดสำเร็จ',
          showConfirmButton: false,
          timer: 1200,
        }).then(() => {
          window.location.reload();
        });
      },
      error: (err) => {
        console.error('Upload error:', err);

        Swal.fire({
          icon: 'error',
          title: 'อัปโหลดไม่สำเร็จ',
          text: 'กรุณาลองใหม่อีกครั้ง',
        });
      },
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
        return this.service.getArticles(id);

      case 'project':
        return this.service.getProjects(id);

      case 'innovation':
        return this.service.getInnovations(id);

      default:
        return of(null);
    }
  }

  private handleResponseByType(res: any) {
    switch (this.type) {
      case 'article':
        this.articleData = res.data.researchArticle;
        this.safeDescription = this.formatAbstract(
          this.articleData?.abstract_en || this.articleData?.abstract
        );
        this.ownerArticle = res.data.owner;
        this.oecdUI = this.mapOecdApiToUI(this.articleData?.oecd || []);

        if (this.articleData?.internal_members?.length) {
          this.articleData.internal_members = this.sortFirstAuthorFirst(
            this.articleData.internal_members
          );
        }
        break;

      case 'project':
        this.researchData = res.data.projectDetail;
        this.safeDescription = this.formatAbstract(
          this.researchData?.abstract_en || this.researchData?.abstract
        );
        this.oecdUI = this.mapOecdApiToUI(this.researchData?.oecd || []);
        this.ownerProject = res.data.owner;

        if (this.researchData?.internal_members?.length) {
          this.researchData.internal_members = this.sortFirstAuthorFirst(
            this.researchData.internal_members
          );
        }
        break;

      case 'innovation':
        this.innovationData = res.data.researchInnovation;
        this.safeDescription = this.formatAbstract(
          this.innovationData?.abstract_en || this.innovationData?.abstract
        );
        this.ownerInnovation = res.data.owner;
        this.oecdUI = this.mapOecdApiToUI(this.innovationData?.oecd || []);

        if (this.innovationData?.internal_members?.length) {
          this.innovationData.internal_members = this.sortFirstAuthorFirst(
            this.innovationData.internal_members
          );
        }

        this.galleryImages =
          this.innovationData?.innovation_images?.map(
            (img: any) => img.get_url
          ) || [];
        break;
    }
  }

  private sortFirstAuthorFirst(members: any[]) {
    return members.sort((a, b) => {
      const isAFirst = a.role?.includes('First Author');
      const isBFirst = b.role?.includes('First Author');

      if (isAFirst && !isBFirst) return -1;
      if (!isAFirst && isBFirst) return 1;
      return 0;
    });
  }

  onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    img.src = '/assets/default_image.png';
  }

  openPDF() {
    const map: any = {
      project: this.researchData?.full_report?.get_url,
      article: this.articleData?.article_file?.get_url,
      innovation: this.innovationData?.full_report?.get_url,
    };

    const getUrl = map[this.type];

    if (!getUrl) return;

    this.http.post<any>(getUrl, {}).subscribe({
      next: (res) => {
        const signedUrl = res?.data?.url;
        if (signedUrl) window.open(signedUrl, '_blank');
      },
      error: (err) => console.error(err),
    });
  }

  get owner() {
    if (this.type === 'article') return this.ownerArticle;
    if (this.type === 'project') return this.ownerProject;
    if (this.type === 'innovation') return this.ownerInnovation;
    return null;
  }

  mapOecdApiToUI(oecd: OecdMajorApi[]): OecdMajorUI[] {
    return oecd.map(m => ({
      major_id: m.major_id,
      name_th: m.name_th,
      children: m.children
        ? [{
            sub_id: m.children.sub_id,
            name_th: m.children.name_th,
            children: m.children.children
              ? [{
                  child_id: m.children.children.child_id,
                  name_th: m.children.children.name_th
                }]
              : []
          }]
        : []
    }));
  }

  formatAbstract(text: string | null | undefined): SafeHtml {
    if (!text) return '-';
  
    const html = text
      .split('\n')
      .map(line => {
        const trimmed = line.trimEnd();
        if (!trimmed) return '<p>&nbsp;</p>'; // บรรทัดว่าง = เว้นวรรค
        return `<p style="text-indent: 2.5em;">${trimmed}</p>`;
      })
      .join('');
  
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
