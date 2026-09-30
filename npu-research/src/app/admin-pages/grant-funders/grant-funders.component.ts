import { Component, DestroyRef, HostListener, OnInit, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged, firstValueFrom } from 'rxjs';
import { MainComponent } from '../../shared/layouts/main/main.component';
import { AdminGrantsService } from '../../services/admin-grants.service';
import {
  ApiFunderDetail,
  ApiPagination,
  FunderPayload,
} from '../../models/admin-grants.model';

interface FunderForm {
  code: string;
  nameTh: string;
  nameEn: string;
  shortName: string;
  type: string;
  websiteUrl: string;
  description: string;
  isActive: boolean;
}

@Component({
  selector: 'app-grant-funders',
  standalone: false,
  templateUrl: './grant-funders.component.html',
  // ใช้ CSS ชุดเดียวกับหน้าประกาศทุน (field-input, icon-btn, page-btn, thead-dark, drawer-backdrop, toast ฯลฯ)
  // ถ้าโฟลเดอร์ไม่ได้อยู่ระดับเดียวกัน ให้แก้ path ให้ตรง
  styleUrl: '../manage-grants/manage-grants.component.css',
})
export class GrantFundersComponent implements OnInit {
  private grantsService = inject(AdminGrantsService);
  private destroyRef = inject(DestroyRef);

  // ===== Data =====
  funders: ApiFunderDetail[] = [];
  pagination: ApiPagination | null = null;
  isLoading = true;
  typeOptions: { value: string; label: string }[] = [
    { value: 'government', label: 'รัฐ' },
    { value: 'private', label: 'เอกชน' },
    { value: 'international', label: 'ต่างประเทศ' },
    { value: 'other', label: 'อื่น ๆ' },
  ];

  // ===== Filters / pagination (ฝั่ง server) =====
  keyword = '';
  page = 1;
  perPage = 20;
  private search$ = new Subject<string>();
  /** กัน response ที่มาช้ากว่าเขียนทับผลล่าสุด */
  private loadSeq = 0;

  // ===== Modal (create / edit) =====
  isModalOpen = false;
  editingId: number | null = null;
  isSaving = false;
  submitted = false;
  form: FunderForm = this.emptyForm();
  /** API update รับ logo_path แต่ฟอร์มยังไม่มีช่องอัปโหลด จึงเก็บค่าเดิมไว้ส่งกลับ */
  private editingLogoPath: string | null = null;

  // ===== Toggle active =====
  togglingId: number | null = null;

  // ===== Delete =====
  deleteTarget: ApiFunderDetail | null = null;
  isDeleting = false;

  // ===== Toast =====
  toast: { type: 'success' | 'error'; message: string } | null = null;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.search$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.page = 1;
        this.loadFunders();
      });

    MainComponent.showLoading();
    Promise.all([
      this.loadFunders(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).finally(() => MainComponent.hideLoading());
  }

  // ===== Loading =====
  async loadFunders(): Promise<void> {
    const seq = ++this.loadSeq;
    this.isLoading = true;
    try {
      const res = await firstValueFrom(
        this.grantsService.getFunders({
          page: this.page,
          per_page: this.perPage,
          keyword: this.keyword.trim(),
        })
      );
      if (seq !== this.loadSeq) return;
      if (res.result !== 1) throw new Error(res.message);

      this.funders = res.data.items;
      this.pagination = res.data.pagination;

      // หน้าปัจจุบันว่างหลังลบรายการสุดท้าย ให้ถอยไปหน้าก่อนหน้า
      const last = res.data.pagination.last_page;
      if (this.page > last && last > 0) {
        this.page = last;
        return this.loadFunders();
      }
    } catch (err) {
      if (seq !== this.loadSeq) return;
      console.error('load funders error:', err);
      this.funders = [];
      this.pagination = null;
      this.showToast('error', this.errorMessage(err, 'ไม่สามารถโหลดรายการแหล่งทุนได้'));
    } finally {
      if (seq === this.loadSeq) this.isLoading = false;
    }
  }

  onKeywordChange(value: string): void {
    this.search$.next(value.trim());
  }

  get totalPages(): number {
    return this.pagination?.last_page ?? 1;
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(p: number): void {
    if (p < 1 || p > this.totalPages || p === this.page) return;
    this.page = p;
    this.loadFunders();
  }

  // ===== Helpers =====
  typeLabel(f: ApiFunderDetail): string {
    return f.type_name || this.typeOptions.find((t) => t.value === f.type)?.label || f.type;
  }

  private toPayload(f: ApiFunderDetail, overrides: Partial<FunderPayload> = {}): FunderPayload {
    return {
      code: f.code,
      name_th: f.name_th,
      name_en: f.name_en,
      short_name: f.short_name,
      type: f.type,
      description: f.description,
      website_url: f.website_url,
      logo_path: f.logo_path,
      is_active: f.is_active,
      ...overrides,
    };
  }

  private replaceFunder(updated: ApiFunderDetail): void {
    this.funders = this.funders.map((f) =>
      f.id === updated.id ? { ...f, ...updated } : f
    );
  }

  /** ดึงข้อความ error จาก Laravel (validation error ตัวแรกก่อน แล้วค่อย message) */
  private errorMessage(err: unknown, fallback: string): string {
    if (err instanceof HttpErrorResponse) {
      const errors = err.error?.errors as Record<string, string[]> | undefined;
      const firstValidation = errors ? Object.values(errors)[0]?.[0] : undefined;
      return firstValidation || err.error?.message || fallback;
    }
    if (err instanceof Error) return err.message || fallback;
    return fallback;
  }

  // ===== Modal =====
  openCreate(): void {
    this.form = this.emptyForm();
    this.editingId = null;
    this.editingLogoPath = null;
    this.openModal();
  }

  openEdit(f: ApiFunderDetail): void {
    this.form = {
      code: f.code ?? '',
      nameTh: f.name_th ?? '',
      nameEn: f.name_en ?? '',
      shortName: f.short_name ?? '',
      type: f.type ?? '',
      websiteUrl: f.website_url ?? '',
      description: f.description ?? '',
      isActive: f.is_active,
    };
    this.editingId = f.id;
    this.editingLogoPath = f.logo_path;
    this.openModal();
  }

  private openModal(): void {
    this.submitted = false;
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal(): void {
    if (this.isSaving) return;
    this.isModalOpen = false;
    document.body.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.deleteTarget) this.cancelDelete();
    else if (this.isModalOpen) this.closeModal();
  }

  // ===== Validation =====
  get errors(): Record<string, string> {
    const e: Record<string, string> = {};
    const f = this.form;
    if (!f.code.trim()) e['code'] = 'กรุณากรอกรหัสแหล่งทุน';
    if (!f.nameTh.trim()) e['nameTh'] = 'กรุณากรอกชื่อแหล่งทุน';
    if (!f.type) e['type'] = 'กรุณาเลือกประเภทแหล่งทุน';
    if (f.websiteUrl.trim() && !/^https?:\/\/.+/i.test(f.websiteUrl.trim()))
      e['websiteUrl'] = 'ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://';
    return e;
  }

  hasError(key: string): boolean {
    return this.submitted && !!this.errors[key];
  }

  // ===== Save =====
  async save(): Promise<void> {
    this.submitted = true;
    if (this.isSaving || Object.keys(this.errors).length > 0) return;

    const f = this.form;
    const payload: FunderPayload = {
      code: f.code.trim().toUpperCase(),
      name_th: f.nameTh.trim(),
      name_en: f.nameEn.trim() || null,
      short_name: f.shortName.trim() || null,
      type: f.type,
      description: f.description.trim() || null,
      website_url: f.websiteUrl.trim() || null,
      is_active: f.isActive,
    };
    if (this.editingId !== null) payload.logo_path = this.editingLogoPath;

    const isEdit = this.editingId !== null;
    this.isSaving = true;
    try {
      const res = isEdit
        ? await firstValueFrom(this.grantsService.updateFunder(this.editingId!, payload))
        : await firstValueFrom(this.grantsService.createFunder(payload));
      if (res.result !== 1) throw new Error(res.message);

      this.isSaving = false;
      this.closeModal();
      this.showToast(
        'success',
        res.message || (isEdit ? 'บันทึกการแก้ไขแล้ว' : 'เพิ่มแหล่งทุนแล้ว')
      );
      if (isEdit && res.data) this.replaceFunder(res.data);
      else await this.loadFunders();
    } catch (err) {
      console.error('save funder error:', err);
      this.showToast('error', this.errorMessage(err, 'ไม่สามารถบันทึกแหล่งทุนได้'));
    } finally {
      this.isSaving = false;
    }
  }

  // ===== Toggle active =====
  async toggleActive(f: ApiFunderDetail): Promise<void> {
    if (this.togglingId !== null) return;
    this.togglingId = f.id;
    const nextActive = !f.is_active;
    try {
      const res = await firstValueFrom(
        this.grantsService.updateFunder(f.id, this.toPayload(f, { is_active: nextActive }))
      );
      if (res.result !== 1) throw new Error(res.message);
      this.replaceFunder(res.data ?? { ...f, is_active: nextActive });
      this.showToast('success', nextActive ? 'เปิดใช้งานแหล่งทุนแล้ว' : 'ปิดใช้งานแหล่งทุนแล้ว');
    } catch (err) {
      console.error('toggle funder error:', err);
      this.showToast('error', this.errorMessage(err, 'ไม่สามารถเปลี่ยนสถานะแหล่งทุนได้'));
    } finally {
      this.togglingId = null;
    }
  }

  // ===== Delete =====
  confirmDelete(f: ApiFunderDetail): void {
    this.deleteTarget = f;
  }

  cancelDelete(): void {
    if (!this.isDeleting) this.deleteTarget = null;
  }

  /** จากกล่องยืนยันลบ กรณีมีทุนผูกอยู่ ให้ปิดใช้งานแทน */
  async deactivateInstead(): Promise<void> {
    const target = this.deleteTarget;
    if (!target) return;
    this.deleteTarget = null;
    if (target.is_active) await this.toggleActive(target);
  }

  async deleteFunder(): Promise<void> {
    const target = this.deleteTarget;
    if (!target || this.isDeleting || target.grants_count > 0) return;

    this.isDeleting = true;
    try {
      const res = await firstValueFrom(this.grantsService.deleteFunder(target.id));
      if (res.result !== 1) throw new Error(res.message);

      this.isDeleting = false;
      this.deleteTarget = null;
      this.showToast('success', res.message || 'ลบแหล่งทุนแล้ว');
      await this.loadFunders();
    } catch (err) {
      console.error('delete funder error:', err);
      this.showToast('error', this.errorMessage(err, 'ไม่สามารถลบแหล่งทุนได้'));
    } finally {
      this.isDeleting = false;
    }
  }

  // ===== Toast =====
  private showToast(type: 'success' | 'error', message: string): void {
    this.toast = { type, message };
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => (this.toast = null), 3000);
  }

  trackById(_: number, item: { id: number }): number {
    return item.id;
  }

  private emptyForm(): FunderForm {
    return {
      code: '',
      nameTh: '',
      nameEn: '',
      shortName: '',
      type: '',
      websiteUrl: '',
      description: '',
      isActive: true,
    };
  }
}