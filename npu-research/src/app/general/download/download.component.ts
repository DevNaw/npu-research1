import { Component } from '@angular/core';

@Component({
  selector: 'app-download',
  standalone: false,
  templateUrl: './download.component.html',
  styleUrl: './download.component.css'
})
export class DownloadComponent {
  documents = [
    {
      title: 'คู่มือทรัพย์สินทางปัญญาสำหรับบุคลากร มหาวิทยาลัยนครพนม',
      fileUrl: 'assets/files/doc1.pdf',
      downloads: 9722,
    },
    {
      title:
        'ขอเชิญสมัครเพื่อรับทุนช่วยเหลือทางด้านวิทยาศาสตร์และเทคโนโลยี ครั้งที่ 26 พ.ศ.2562',
      fileUrl: 'assets/files/doc2.pdf',
      downloads: 2026,
    },
  ];
}
