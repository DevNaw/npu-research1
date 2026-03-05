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
  styleUrl: './news-edit.component.css',
})
export class NewsEditComponent implements OnInit, OnDestroy {
  newsData!: NewsDetail;
  newsForm!: FormGroup;

  isEdit = false;
  newsId!: number;

  coverPreview: string | null = null;
  galleryPreview: string[] = [];
  selectedCoverFile!: File;
  selectedGalleryFiles: File[] = [];

  editor!: Editor;

  toolbar: Toolbar = [
    ['bold', 'italic', 'underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private service: AdminNewsService
  ) {}

  ngOnInit(): void {
    this.editor = new Editor();

    this.newsForm = this.fb.group({
      title: [''],
      description: [''],
      content: [''],
      sourceUrl: [''],
      publishedAt: [''],
      expiresAt: [''],
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
          expiresAt: news.expires_date,
        });

        // ✅ แสดงรูปปก
        this.coverPreview = news.news_cover;

        // ✅ แสดง gallery
        this.galleryPreview = news.news_photos?.map((p) => p.img_url) || [];
      },
    });
  }

  onCoverChange(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;
  
    // ✅ เก็บไฟล์จริง
    this.selectedCoverFile = file;
  
    // ✅ ทำ preview
    const reader = new FileReader();
    reader.onload = () => {
      this.coverPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onGalleryChange(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;
  
    // 🔥 รีเซ็ตก่อนทุกครั้ง
    this.selectedGalleryFiles = [];
    this.galleryPreview = [];
  
    // ✅ เก็บไฟล์ทั้งหมด
    this.selectedGalleryFiles = Array.from(files);
  
    // ✅ ทำ preview
    this.selectedGalleryFiles.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        this.galleryPreview.push(reader.result as string);
      };
      reader.readAsDataURL(file);
    });
  }

  submit() {
    if (this.newsForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบ',
        text: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        confirmButtonColor: '#3085d6'
      });
      return;
    }
  
    const formValue = this.newsForm.value;
    const formData = new FormData();
  
    formData.append('title', formValue.title);
    formData.append('description', formValue.description);
    formData.append('published_date', formValue.publishedAt);
    formData.append('expires_date', formValue.expiresAt);
  
    if (this.selectedCoverFile) {
      formData.append('news_cover', this.selectedCoverFile);
    }
  
    if (this.selectedGalleryFiles?.length) {
      this.selectedGalleryFiles.forEach((file: File) => {
        formData.append('news_photos[]', file);
      });
    }
  
    // 🔵 แสดง loading
    Swal.fire({
      title: 'กำลังบันทึกข้อมูล...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    console.log('formData', formData);
    
  
    const request$ = this.isEdit
      ? this.service.updateNews(this.newsId, formData)
      : this.service.createNews(formData);
  
    request$.subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: this.isEdit ? 'แก้ไขสำเร็จ' : 'เพิ่มข่าวสำเร็จ',
          timer: 1000,
          showConfirmButton: false,
        }).then(() => {
          this.router.navigate(['/admin/news']);
        });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: err?.error?.message || 'ไม่สามารถบันทึกข้อมูลได้',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/admin/news']);
  }
}
