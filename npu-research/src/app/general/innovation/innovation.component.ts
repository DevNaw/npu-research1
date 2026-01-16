import { Component, OnInit } from '@angular/core';

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
export class InnovationComponent implements OnInit {
  pageSize = 10;
  currentPage = 1;
  searchText = '';

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

  filteredInnovations: Innovation[] = [];
  paginatedInnovations: Innovation[] = [];

  ngOnInit(): void {
    this.filteredInnovations = [...this.innovations];
    this.updatePagination();
  }

  onSearch(): void {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredInnovations = this.innovations.filter(
    (i) =>
      i.title.toLowerCase().includes(keyword) ||
      i.researchers.toLowerCase().includes(keyword)
    );

    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;

    this.paginatedInnovations = this.filteredInnovations.slice(start, end);
  }

  changePage(page: number): void {
    if (page < 1 || page > this.totalPages) return;

    this.currentPage = page;
    this.updatePagination();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get totalPages(): number {
    return Math.ceil(this.innovations.length / this.pageSize);
  }
}
