import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-news-detail',
  standalone: false,
  templateUrl: './news-detail.component.html',
  styleUrl: './news-detail.component.css'
})
export class NewsDetailComponent implements OnInit {
  newsId!: number;
  news: any;

  newsList = [
    {
      id: 1,
      title: 'ประกาศผลการจัดสรรทุนสนับสนุนอาจารย์นักวิจัยต่างประเทศ',
      date: '01/09/2568',
      image: 'assets/news/news1.png',
      content: [
        'มหาวิทยาลัยขอประกาศผลการจัดสรรทุนสนับสนุนอาจารย์นักวิจัยต่างประเทศ',
        'โดยมีวัตถุประสงค์เพื่อส่งเสริมความร่วมมือทางวิชาการระดับนานาชาติ',
        'ผู้ที่ได้รับทุนสามารถเริ่มดำเนินโครงการได้ตามระยะเวลาที่กำหนด'
      ]
    },
    {
      id: 2,
      title: 'Sample Document for Visa and Work Permit Extension',
      date: '13/06/2568',
      image: 'assets/news/news2.png',
      content: [
        'เอกสารตัวอย่างสำหรับการขอขยายวีซ่าและใบอนุญาตทำงาน',
        'เหมาะสำหรับอาจารย์และนักวิจัยชาวต่างชาติ',
        'สามารถดาวน์โหลดเอกสารได้จากลิงก์ที่แนบ'
      ]
    }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.newsId = Number(this.route.snapshot.paramMap.get('id'));
    this.news = this.newsList.find(n => n.id === this.newsId);
  }
}
