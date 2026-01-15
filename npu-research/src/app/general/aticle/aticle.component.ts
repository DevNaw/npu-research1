import { Component } from '@angular/core';

interface Aticle {
  title: string;
  researchers: string;
}

@Component({
  selector: 'app-aticle',
  standalone: false,
  templateUrl: './aticle.component.html',
  styleUrl: './aticle.component.css',
})
export class AticleComponent {
  pageSize = 10;
  currentPage = 1;

  searchText: string = '';

  aticles: Aticle[] = [
    {
      title: 'การพัฒนาระบบฐานข้อมูลวิจัย',
      researchers: 'ดร.เศริยา มั่งมี',
    },
    {
      title: 'ผลกระทบของการเปลี่ยนแปลงสภาพภูมิอากาศต่อการเกษตร',
      researchers: 'ผศ.สมชาย ใจดีผศ.สมชาย ใจดีผศ.สมชาย ใจดีผศ.สมชาย ใจดี',
    },
    {
      title: 'นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์',
      researchers: 'ดร.สมหญิง แก้วใส',
    },
    {
      title: 'นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์',
      researchers: 'ดร.สมหญิง แก้วใส',
    },
    {
      title: 'นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์',
      researchers: 'ดร.สมหญิง แก้วใส',
    },
    {
      title:
        'นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์',
      researchers: 'ดร.สมหญิง แก้วใส',
    },
    {
      title: 'นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์',
      researchers: 'ดร.สมหญิง แก้วใส',
    },
    {
      title: 'นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์',
      researchers: 'ดร.สมหญิง แก้วใส',
    },
    {
      title: 'นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์',
      researchers: 'ดร.สมหญิง แก้วใส',
    },
    {
      title: 'นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์',
      researchers: 'ดร.สมหญิง แก้วใส',
    },
    {
      title: 'นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์',
      researchers: 'ดร.สมหญิง แก้วใส',
    },
    {
      title: 'นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์',
      researchers: 'ดร.สมหญิง แก้วใส',
    },
    {
      title:
        'นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์นวัตกรรมการผลิตพลังงานจากขยะอินทรีย์',
      researchers: 'ดร.สมหญิง แก้วใส',
    },
  ];

  get totalPages(): number {
    return Math.ceil(this.aticles.length / this.pageSize);
  }

  get paginatedAticles() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.aticles.slice(startIndex, startIndex + this.pageSize);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  filteredAticles = [...this.aticles];

  onSearch() {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredAticles = this.aticles.filter(
      (p) =>
        p.title.toLowerCase().includes(keyword)
    );
  }
}
