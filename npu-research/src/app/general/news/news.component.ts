import { Component } from '@angular/core';

@Component({
  selector: 'app-news',
  standalone: false,
  templateUrl: './news.component.html',
  styleUrl: './news.component.css'
})
export class NewsComponent {
  currentPage = 1;
  pageSize = 8;
  
  newsList = [
    {
      id: 1,
      title: 'ประกาศผลการจัดสรรทุนสนับสนุนอาจารย์นักวิจัยต่างประเทศ',
      date: '01/09/2568',
      image: 'assets/news1.jpg'
    },
    {
      id: 2,
      title: 'Sample Document for Visa and Work Permit Extension',
      date: '13/06/2568',
      image: 'assets/news2.jpg'
    },
    {
      id: 3,
      title: 'ประกาศผลการจัดสรรทุนพัฒนานักวิจัยรุ่นใหม่ รอบ 2',
      date: '10/06/2568',
      image: 'assets/news.jpeg'
    },
    {
      id: 4,
      title: 'มช. เปิดรับข้อเสนอโครงการทุน Visiting Professor 2025',
      date: '09/04/2568',
      image: 'assets/news1.jpg'
    },
    // เพิ่มได้เรื่อย ๆ
  ];
  
  get totalPages() {
    const pageCount = Math.ceil(this.newsList.length / this.pageSize);
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }
  
  get paginatedNews() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.newsList.slice(start, start + this.pageSize);
  }
  
  changePage(page: number) {
    if (page < 1 || page > this.totalPages.length) return;
    if (page === this.currentPage) return;

    this.currentPage = page;
  }
  
}
