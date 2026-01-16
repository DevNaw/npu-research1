import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-news-edit',
  standalone: false,
  templateUrl: './news-edit.component.html',
  styleUrl: './news-edit.component.css'
})
export class NewsEditComponent implements OnInit {
  newsForm!: FormGroup;
  isEdit: boolean = false;
  newsId! : number;
  
  coverPreview: string | null = null;
  galleryPreview: string[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.newsForm = this.fb.group({
      title: [''],
      description: [''],
      content: [''],
      sourceUrl: [''],
      publishedAt: ['']
    });

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEdit = true;
        this.newsId = +id;
        this.loadNews();
      }
    });
  }

  loadNews() {
    // mock data
    this.newsForm.patchValue({
      title: 'ข่าวตัวอย่าง',
      description: 'คำอธิบายข่าว',
      content: 'เนื้อหาข่าว',
      sourceUrl: 'https://example.com',
      publishedAt: '2026-01-01'
    });
  }

  onCoverChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.coverPreview = URL.createObjectURL(file);
    }
  }

  onGalleryChange(event: any) {
    this.galleryPreview = [];
    for (const file of event.target.files) {
      this.galleryPreview.push(URL.createObjectURL(file));
    }
  }

  submit() {
    if (this.newsForm.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบ',
        text: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        confirmButtonText: 'ตกลง',
      });
      return;
    }
  
    const actionText = this.isEdit ? 'แก้ไขข่าว' : 'เพิ่มข่าว';
  
    Swal.fire({
      title: `ยืนยันการ${actionText}`,
      text: 'คุณต้องการบันทึกข้อมูลนี้ใช่หรือไม่?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'บันทึก',
      cancelButtonText: 'ยกเลิก',
      confirmButtonColor: '#4f46e5', // indigo-600
      cancelButtonColor: '#9ca3af',  // gray-400
    }).then((result) => {
      if (result.isConfirmed) {
  
        if (this.isEdit) {
          // 🔧 TODO: call update API
          console.log('แก้ไขข่าว ID:', this.newsId, this.newsForm.value);
        } else {
          // 🔧 TODO: call create API
          console.log('เพิ่มข่าวใหม่:', this.newsForm.value);
        }
  
        Swal.fire({
          icon: 'success',
          title: 'บันทึกสำเร็จ',
          text: 'ข้อมูลข่าวถูกบันทึกเรียบร้อยแล้ว',
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          this.router.navigate(['/admin-news']);
        });
      }
    });
  }
  
}
