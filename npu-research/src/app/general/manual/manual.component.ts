import { Component } from '@angular/core';

@Component({
  selector: 'app-manual',
  standalone: false,
  templateUrl: './manual.component.html',
  styleUrl: './manual.component.css',
})
export class ManualComponent {
  documents = [
    {
      title: 'คู่มือการใช้งานสำหรับนักวิจัย',
      fileUrl: 'assets/files/doc1.pdf',
      downloads: 9722,
    },
    {
      title:
        'คู่มือการใช้งานสำหรับแอดมิน',
      fileUrl: 'assets/files/doc2.pdf',
      downloads: 2026,
    },
    {
      title:
        'คู่มือการใช้งานสำหรับผู้บริหาร',
      fileUrl: 'assets/files/doc2.pdf',
      downloads: 2026,
    },
  ];
}
