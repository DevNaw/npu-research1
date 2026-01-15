import { Component } from '@angular/core';

interface Innovation {
  title: string;
  researchers: string;
}

@Component({
  selector: 'app-innovation',
  standalone: false,
  templateUrl: './innovation.component.html',
  styleUrl: './innovation.component.css',
})
export class InnovationComponent {
  pageSize = 10;
  currentPage = 1;

  searchText: string = '';

  innovations: Innovation[] = [
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
    return Math.ceil(this.innovations.length / this.pageSize);
  }

  get paginatedInnovations() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.innovations.slice(startIndex, startIndex + this.pageSize);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  filteredInnovations = [...this.innovations];

  onSearch() {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredInnovations = this.innovations.filter(
      (i) =>
        i.title.toLowerCase().includes(keyword) ||
        i.researchers.toLowerCase().includes(keyword)
    );
  }
}
