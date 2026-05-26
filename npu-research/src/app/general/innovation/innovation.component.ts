import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ResearchService } from '../../services/research.service';
import { Innovation } from '../../models/innovation-public.model';
import { MainComponent } from '../../shared/layouts/main/main.component';

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
  isLoading = true; // 👈 เริ่มต้น true เพื่อให้ตารางพร้อมแสดง loader ทันที

  innovations: Innovation[] = [];
  filteredInnovations: Innovation[] = [];
  paginatedInnovations: Innovation[] = [];

  constructor(
    private router: Router,
    private researchService: ResearchService
  ) {}

  ngOnInit(): void {
    // ===== Step 1: แสดง MainComponent loading (เปิดหน้า) =====
    MainComponent.showLoading();

    // ===== Step 2: รอ 1 วินาทีให้หน้าเปิดเสร็จ แล้วซ่อน MainComponent =====
    setTimeout(() => {
      MainComponent.hideLoading();

      // ===== Step 3: เริ่มโหลดข้อมูลในตาราง (แสดง animation ในตาราง) =====
      this.getDataInnovation();
    }, 1000);
  }

  // 👈 ปรับให้คืนค่าเป็น Promise และจัดการ isLoading
  getDataInnovation(): Promise<void> {
    this.isLoading = true;
    return new Promise((resolve) => {
      this.researchService.getDataInnovationPublic().subscribe({
        next: (res) => {
          this.innovations = res.data.innovations;
          this.filteredInnovations = [...this.innovations];
          this.updatePagination();
          this.isLoading = false;
          resolve();
        },
        error: (err) => {
          console.error('โหลดข้อมูลล้มเหลว', err);
          this.isLoading = false;
          resolve();
        },
      });
    });
  }

  // ===== SEARCH (แก้บั๊กแล้ว) =====
  onSearch(): void {
    const keyword = this.searchText.toLowerCase().trim();

    this.filteredInnovations = this.innovations.filter((i) => {
      const fields = [
        i.title_th,
        i.title_en,
        i.research_code,
        i.funding?.source_funds,
        i.oecd?.[0]?.name_th,
        this.mapInnovation(i.own),
      ];

      return fields.some((field) => field?.toLowerCase().includes(keyword));
    });

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
    if (page === this.currentPage) return;

    this.currentPage = page;
    this.updatePagination();

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  get totalPages(): number {
    return Math.ceil(this.filteredInnovations.length / this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  viewDetails(id: number): void {
    if (!id) {
      console.error('Innovation ID undefined');
      return;
    }
    this.router.navigate(['/performance-public/innovation', id]);
  }

  mapInnovation(owners: any[]): string {
    if (!owners || owners.length === 0) return '-';

    return owners.map((o) => o.full_name).join(', ');
  }

  formatThaiDate(dateString: string): string {
    if (!dateString) return '-';

    const d = new Date(dateString);

    const day = d.getDate();
    const month = d.toLocaleDateString('th-TH', { month: 'long' });
    const year = d.getFullYear() + 543;

    return `${day} ${month} ${year}`;
  }

  get visiblePages(): (number | string)[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const pages: (number | string)[] = [];

    if (total <= 5) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    pages.push(1);

    if (current > 3) pages.push('...');

    for (
      let i = Math.max(2, current - 1);
      i <= Math.min(total - 1, current + 1);
      i++
    ) {
      pages.push(i);
    }

    if (current < total - 2) pages.push('...');

    pages.push(total);

    return pages;
  }
}
