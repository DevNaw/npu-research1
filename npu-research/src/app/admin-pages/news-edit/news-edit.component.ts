import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { Editor, Toolbar } from 'ngx-editor';
import { AdminNewsService } from '../../services/admin-news.service';
import { NewsDetail, NewsPhoto } from '../../models/admin-news.model';

@Component({
  selector: 'app-news-edit',
  standalone: false,
  templateUrl: './news-edit.component.html',
  styleUrl: './news-edit.component.css'
})
export class NewsEditComponent implements OnInit, OnDestroy  {
  newsData!: NewsDetail;
  newsForm!: FormGroup;

  isEdit = false;
  newsId!: number;

  coverPreview: string | null = null;
  galleryPreview: string[] = [];

  editor!: Editor;

  toolbar: Toolbar = [
    ['bold', 'italic', 'underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1','h2','h3','h4','h5','h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left','align_center','align_right','align_justify'],
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: AdminNewsService,
  ) {}

  ngOnInit(): void {
    this.editor = new Editor();
  
    this.newsForm = this.fb.group({
      title: [''],
      description: [''],
      content: [''],
      sourceUrl: [''],
      publishedAt: [''],
      expiresAt: ['']
    });
  
    const id = this.route.snapshot.paramMap.get('id');
  
    if (id) {
      this.isEdit = true;
      this.newsId = +id;
      this.loadNews();
    }
  }

  ngOnDestroy(): void {
    this.editor.destroy();
  }

  loadNews() {
    this.service.getnewsById(this.newsId).subscribe({
      next: (res) => {
        const news = res.data.news;
  
        console.log(news); // ข้อมูลที่คุณแปะมา
  
        // ✅ patch ค่าเข้า form
        this.newsForm.patchValue({
          title: news.title,
          description: news.description,
          publishedAt: news.published_date,
          expiresAt: news.expires_date
        });
  
        // ✅ แสดงรูปปก
        this.coverPreview = news.news_cover;
  
        // ✅ แสดง gallery
        this.galleryPreview = news.news_photos?.map(p => p.img_url) || [];
      }
    });
  }


  onCoverChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => (this.coverPreview = reader.result as string);
    reader.readAsDataURL(file);
  }

  onGalleryChange(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files) return;

    this.galleryPreview = [];

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () =>
        this.galleryPreview.push(reader.result as string);
      reader.readAsDataURL(file);
    });
  }

  submit() {
    if (this.newsForm.invalid) {
      return;
    }
  
    const formValue = this.newsForm.value;
  
    const payload = {
      title: formValue.title,
      description: formValue.description,
      published_date: formValue.publishedAt,
      expires_date: formValue.expiresAt,
    };
  
    if (this.isEdit) {
      this.service.updateNews(this.newsId, payload).subscribe({
        next: () => {
          this.router.navigate(['/admin/news']);
        },
        error: (err) => console.error(err)
      });
    } else {
      this.service.createNews(payload).subscribe({
        next: () => {
          this.router.navigate(['/admin/news']);
        },
        error: (err) => console.error(err)
      });
    }
  }

  goBack() {
    this.router.navigate(['/admin/news']);
  }
}
