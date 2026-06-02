import { Component, OnInit, OnDestroy } from '@angular/core';
import { Researcher, ResearcherGraph } from '../../models/search-researchers.model';
import { Router } from '@angular/router';
import { SearchService } from '../../services/search.service';
import { MainComponent } from '../../shared/layouts/main/main.component';
import Swal from 'sweetalert2';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-all-researcher',
  standalone: false,
  templateUrl: './all-researcher.component.html',
  styleUrl: './all-researcher.component.css',
})
export class AllResearcherComponent implements OnInit, OnDestroy {
  loading = false;
  graph: ResearcherGraph[] = [];

  // ข้อมูลดิบทั้งหมดจาก API
  private allResearchers: Researcher[] = [];

  // search / paging (client-side)
  keyword = '';
  page = 1;
  perPage = 10;

  private initTimer?: ReturnType<typeof setTimeout>;

  constructor(
    private apiService: SearchService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    MainComponent.showLoading();

    this.initTimer = setTimeout(() => {
      MainComponent.hideLoading();

      if (!this.authService.isLoggedIn()) {
        this.showUnauthorizedModal();
        return;
      }
      this.fetch();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.initTimer) clearTimeout(this.initTimer);
  }

  /** รายการที่ผ่านการ filter ด้วย keyword */
  get filteredResearchers(): Researcher[] {
    const kw = this.keyword.trim().toLowerCase();
    if (!kw) return this.allResearchers;

    return this.allResearchers.filter((r) => {
      const name = (r.name || '').toLowerCase();
      const org = (r.organization || '').toLowerCase();
      const exp = (r.expertises || '').toLowerCase();
      const pos = (r.position || '').toLowerCase();
      return (
        name.includes(kw) ||
        org.includes(kw) ||
        exp.includes(kw) ||
        pos.includes(kw)
      );
    });
  }

  /** จำนวนรายการหลัง filter */
  get total(): number {
    return this.filteredResearchers.length;
  }

  /** รายการเฉพาะหน้าปัจจุบัน (10 รายการ) */
  get researchers(): Researcher[] {
    const start = (this.page - 1) * this.perPage;
    return this.filteredResearchers.slice(start, start + this.perPage);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.perPage));
  }

  get fromIndex(): number {
    return this.total === 0 ? 0 : (this.page - 1) * this.perPage + 1;
  }

  get toIndex(): number {
    return Math.min(this.page * this.perPage, this.total);
  }

  /** page numbers to show: 1 ... current ... last */
  get pageList(): (number | '...')[] {
    const last = this.totalPages;
    const cur = this.page;
    const out: (number | '...')[] = [];
    const push = (n: number | '...') => out.push(n);

    push(1);
    if (cur > 3) push('...');
    for (let i = cur - 1; i <= cur + 1; i++) {
      if (i > 1 && i < last) push(i);
    }
    if (cur < last - 2) push('...');
    if (last > 1) push(last);
    return out;
  }

  fetch(): void {
    this.loading = true;
    const payload = { keyword: '' };

    this.apiService.searchResearchers(payload).subscribe({
      next: (res) => {
        this.allResearchers = res?.data?.result ?? [];
        this.graph = res?.data?.graph ?? [];
        this.page = 1;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.allResearchers = [];
        this.graph = [];
        this.loading = false;

        if (err?.status === 401) {
          this.showUnauthorizedModal();
        } else {
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถโหลดข้อมูลนักวิจัยได้ กรุณาลองใหม่อีกครั้ง',
            confirmButtonColor: '#f2cb05',
            confirmButtonText: 'ปิด',
          });
        }
      },
    });
  }

  private showUnauthorizedModal(): void {
    Swal.fire({
      icon: 'warning',
      title: 'ไม่มีสิทธิ์เข้าถึง',
      text: 'กรุณาเข้าสู่ระบบก่อนใช้งานหน้านี้',
      confirmButtonColor: '#f2cb05',
      confirmButtonText: 'เข้าสู่ระบบ',
      showCancelButton: true,
      cancelButtonText: 'ย้อนกลับ',
      cancelButtonColor: '#9ca3af',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.router.navigate(['/login']);
      } else {
        this.router.navigate(['/']);
      }
    });
  }

  /** ค้นหา: filter ฝั่ง client แล้วรีเซ็ตกลับหน้าแรก */
  onSearch(): void {
    this.page = 1;
  }

  goTo(p: number | '...'): void {
    if (p === '...' || p < 1 || p > this.totalPages || p === this.page) return;
    this.page = p;
  }

  prev(): void {
    this.goTo(this.page - 1);
  }

  next(): void {
    this.goTo(this.page + 1);
  }

  openResearcher(r: Researcher): void {
    this.router.navigate(['/researcher', r.id]);
  }

  initials(name: string): string {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    const a = parts[0]?.[0] ?? '';
    const b = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (a + b).toUpperCase();
  }

  trackById(_: number, r: Researcher): number {
    return r.id;
  }
}