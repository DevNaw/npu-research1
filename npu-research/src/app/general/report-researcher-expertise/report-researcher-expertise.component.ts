import { Component } from '@angular/core';
import * as XLSX from 'xlsx';

interface DocumentReport {
  title: string;
  academic: number;
}

@Component({
  selector: 'app-report-researcher-expertise',
  standalone: false,
  templateUrl: './report-researcher-expertise.component.html',
  styleUrl: './report-researcher-expertise.component.css',
})
export class ReportResearcherExpertiseComponent {
  pageSize = 10;
  currentPage = 1;
  searchText: string = '';
  today = new Date();

  documents: DocumentReport[] = [
    {
      title: 'เทคโนโลยีอาหาร/โภชณาการอาหาร',
      academic: 16,
    },
    {
      title: 'สาขาเศรษฐศาสตร์',
      academic: 21,
    },
  ];

  filteredDocuments = [...this.documents];

  onSearch() {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredDocuments = this.documents.filter((p) =>
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
    this.currentPage = page;
    // window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  exportExcel() {
    const data = this.filteredDocuments.map((r, index) => ({
      ลำดับ: index + 1,
      สาขาวิชาที่่เชี่ยวชาญ: r.title,
      รวม: r.academic,
    }));

    // เพิ่มแถวรวมท้ายตาราง
    data.push({
      ลำดับ: 1,
      สาขาวิชาที่่เชี่ยวชาญ: 'รวมทั้งหมด',
      รวม: this.totalAcademic,
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {
      Sheets: { รายงานนักวิจัย: worksheet },
      SheetNames: ['รายงานนักวิจัย'],
    };

    XLSX.writeFile(
      workbook,
      'รายงานข้อมูลนักวิจัยแยกตามสาขาวิชาที่เชี่ยวชาญ.xlsx'
    );
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
}
