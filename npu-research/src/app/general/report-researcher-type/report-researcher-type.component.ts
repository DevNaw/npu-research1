import { Component } from '@angular/core';
import * as XLSX from 'xlsx';

interface DocumentReport {
  title: string;
  downloads: number;
  academic: number;
  support: number;
}


@Component({
  selector: 'app-report-researcher-type',
  standalone: false,
  templateUrl: './report-researcher-type.component.html',
  styleUrl: './report-researcher-type.component.css'
})
export class ReportResearcherTypeComponent {
  pageSize = 10;
  currentPage = 1;
  searchText: string = '';
  today = new Date();


  documents: DocumentReport[] = [
    {
      title: 'สำนักงานอธิการบดี-กองกลาง',
      downloads: 9722,
      academic: 5,
      support: 3,
    },
    {
      title: 'ขอเชิญสมัครเพื่อรับทุน...',
      downloads: 2026,
      academic: 0,
      support: 0,
    },
  ];
  

  filteredDocuments = [...this.documents];

  onSearch() {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredDocuments = this.documents.filter(
      (p) =>
        p.title.toLowerCase().includes(keyword)
    );
  }

  get totalPages(): number {
    return Math.ceil(this.documents.length / this.pageSize);
  }

  get paginatedReseacrchs() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    return this.documents.slice(startIndex, startIndex + this.pageSize);
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    if (page === this.currentPage) return;

    this.currentPage = page;
  }

  
  exportExcel() {
    const data = this.filteredDocuments.map((r, index) => ({
      'ลำดับ': index + 1,
      'หน่วยงาน': r.title,
      'สายวิชาการ': r.academic,
      'สายสนับสนุน': r.support,
      'รวม': r.academic + r.support,
    }));
  
    // เพิ่มแถวรวมท้ายตาราง
    data.push({
      'ลำดับ': 1,
      'หน่วยงาน': 'รวมทั้งหมด',
      'สายวิชาการ': this.totalAcademic,
      'สายสนับสนุน': this.totalSupport,
      'รวม': this.totalAcademic + this.totalSupport,
    });
  
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {
      Sheets: { 'รายงานนักวิจัย': worksheet },
      SheetNames: ['รายงานนักวิจัย'],
    };
  
    XLSX.writeFile(workbook, 'รายงานข้อมูลนักวิจัย.xlsx');
  }
  
  
  printPage() {
    window.print();
  }

  get totalAcademic(): number {
    return this.filteredDocuments.reduce(
      (sum: number, r: any) => sum + r.academic,
      0
    );
  }
  
  get totalSupport(): number {
    return this.filteredDocuments.reduce(
      (sum: number, r: any) => sum + r.support,
      0
    );
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

}
