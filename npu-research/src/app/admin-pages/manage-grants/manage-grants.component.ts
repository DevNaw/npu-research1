import { Component, HostListener, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { MainComponent } from '../../shared/layouts/main/main.component';
import { AdminGrantsService } from '../../services/admin-grants.service';
import {
  ApiFunder,
  ApiGrantDetail,
  ApiGrantListItem,
  ApiOecd,
  FunderPayload,
  GrantPayload,
} from '../../models/admin-grants.model';

// ===== Models =====
export type GrantStatus = 'draft' | 'published';
export type FunderType = 'รัฐ' | 'เอกชน' | 'ต่างประเทศ' | 'อื่น ๆ';

export interface ExternalFunding {
  id: number;
  code: string;
  name: string;
  shortName: string | null;
  type: FunderType;
}

export interface OecdOption {
  id: number;
  name: string;
}

export interface EligibilityItem {
  description: string;
  isRequired: boolean;
}

export interface GrantItem {
  id: number;
  code: string;
  title: string;
  titleEn: string | null;
  externalFundingId: number | null; // FK -> แหล่งทุนภายนอก
  summary: string;
  // ฟิลด์ที่ยังไม่มีในฟอร์ม แต่เก็บไว้เพื่อไม่ให้ค่าเดิมหายตอน update
  description: string | null;
  objective: string | null;
  applicationUrl: string | null;
  documentUrl: string | null;
  minBudget: number | null;
  maxBudget: number | null;
  openedAt: string; // yyyy-MM-dd
  deadline: string; // yyyy-MM-dd
  trlMin: number;
  trlMax: number;
  piQualifications: EligibilityItem[];
  oecdIds: number[];
  keywords: string[];
  sourceUrl: string; // announcement_url
  status: GrantStatus;
  publishedAt: string | null;
  updatedAt: string; // ISO
}

interface FunderForm {
  code: string;
  nameTh: string;
  nameEn: string;
  shortName: string;
  type: string;
  websiteUrl: string;
  description: string;
}

type StatusFilter = '' | 'published' | 'draft' | 'closed';

/** dropdown ที่เปิดอยู่ (เปิดได้ทีละตัว) ต้องตรงกับ data-menu ใน template */
type MenuKey = 'filterFunding' | 'formFunding' | 'funderType';

@Component({
  selector: 'app-manage-grants',
  standalone: false,
  templateUrl: './manage-grants.component.html',
  styleUrl: './manage-grants.component.css',
})
export class ManageGrantsComponent implements OnInit {
  // ===== Data =====
  grants: GrantItem[] = [];
  fundings: ExternalFunding[] = [];
  /** สาขา OECD ระดับ major จาก API (+ สาขาย่อยที่ทุนเดิมผูกไว้ ถูกเติมตอนเปิดแก้ไข) */
  oecdOptions: OecdOption[] = [];
  trlOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  funderTypeOptions: { value: string; label: FunderType }[] = [
    { value: 'government', label: 'รัฐ' },
    { value: 'private', label: 'เอกชน' },
    { value: 'international', label: 'ต่างประเทศ' },
    { value: 'other', label: 'อื่น ๆ' },
  ];
  isLoading = true;

  // ===== Filters =====
  keyword = '';
  statusFilter: StatusFilter = '';
  fundingFilter: number | '' = '';

  // ===== Custom dropdowns =====
  openMenu: MenuKey | null = null;

  // ===== Pagination =====
  page = 1;
  pageSize = 10;

  // ===== Drawer / form =====
  isDrawerOpen = false;
  isEditing = false;
  isSaving = false;
  isLoadingDetail = false;
  submitted = false;
  form: GrantItem = this.emptyForm();
  qualificationInput = '';
  keywordInput = '';

  // ===== Funder modal (เปิดจากฟอร์มประกาศทุนเท่านั้น) =====
  isFunderModalOpen = false;
  isSavingFunder = false;
  funderSubmitted = false;
  funderForm: FunderForm = this.emptyFunderForm();

  // ===== Publish / unpublish จากตาราง =====
  /** id ของทุนที่กำลังเปลี่ยนสถานะ (เผยแพร่หรือยกเลิกเผยแพร่) */
  statusChangingId: number | null = null;

  // ===== Delete confirm =====
  deleteTarget: GrantItem | null = null;
  isDeleting = false;

  // ===== Toast =====
  toast: { type: 'success' | 'error'; message: string } | null = null;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private grantsService: AdminGrantsService) {}

  ngOnInit(): void {
    MainComponent.showLoading();
    Promise.all([
      this.loadData(),
      this.loadOecdOptions(),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]).finally(() => MainComponent.hideLoading());
  }

  // ===== Loading =====
  async loadData(): Promise<void> {
    this.isLoading = true;
    try {
      const [items, funderOptions] = await Promise.all([
        this.fetchAllGrants(),
        this.fetchFunderOptions(),
      ]);
      // รวมแหล่งทุนจาก options กับที่ผูกกับทุนอยู่ (กันกรณีแหล่งทุนถูกปิดใช้งานแต่ยังมีทุนอ้างถึง)
      this.fundings = this.mergeFundings(
        funderOptions,
        items.filter((i) => i.funder).map((i) => this.mapFunder(i.funder!))
      );
      this.grants = items.map((item) => this.mapGrant(item));
      if (this.page > this.totalPages) this.page = this.totalPages;
    } catch (err) {
      console.error('load grants error:', err);
      this.grants = [];
      this.showToast(
        'error',
        this.errorMessage(err, 'ไม่สามารถโหลดรายการประกาศทุนได้')
      );
    } finally {
      this.isLoading = false;
    }
  }

  /** โหลดสาขา OECD ครั้งเดียวตอนเปิดหน้า ใช้เฉพาะระดับ major */
  private async loadOecdOptions(): Promise<void> {
    try {
      const res = await firstValueFrom(this.grantsService.getOecdCategories());
      if (res.result !== 1) throw new Error(res.message);

      const majors = (res.data?.oecd ?? [])
        .slice()
        .sort((a, b) => a.code.localeCompare(b.code))
        .map((m) => ({ id: m.major_id, name: m.name_th }));

      // เก็บสาขาที่อาจถูกเติมจาก openEdit ระหว่างรอ API ไว้ด้วย
      const extras = this.oecdOptions.filter(
        (o) => !majors.some((m) => m.id === o.id)
      );
      this.oecdOptions = [...majors, ...extras];
    } catch (err) {
      console.error('load oecd error:', err);
      this.showToast(
        'error',
        this.errorMessage(err, 'ไม่สามารถโหลดสาขาวิจัย OECD ได้')
      );
    }
  }

  /** ดึงทุกหน้าจาก API มารวมกัน เพื่อให้ stat card และตัวกรองฝั่ง client ทำงานกับข้อมูลครบ */
  private async fetchAllGrants(): Promise<ApiGrantListItem[]> {
    const first = await firstValueFrom(
      this.grantsService.getGrants({ page: 1, per_page: 100 })
    );
    if (first.result !== 1) throw new Error(first.message);

    const { items, pagination } = first.data;
    if (pagination.last_page <= 1) return items;

    const pages = Array.from(
      { length: pagination.last_page - 1 },
      (_, i) => i + 2
    );
    const rest = await Promise.all(
      pages.map((p) =>
        firstValueFrom(
          this.grantsService.getGrants({
            page: p,
            per_page: pagination.per_page,
          })
        )
      )
    );
    return [
      ...items,
      ...rest.flatMap((r) => (r.result === 1 ? r.data.items : [])),
    ];
  }

  /** ถ้าโหลดตัวเลือกแหล่งทุนไม่ได้ ไม่ให้ทั้งหน้าพัง ใช้แหล่งทุนจากรายการทุนแทน */
  private async fetchFunderOptions(): Promise<ExternalFunding[]> {
    try {
      const res = await firstValueFrom(this.grantsService.getFunderOptions());
      if (res.result !== 1) throw new Error(res.message);
      return res.data.map((f) => this.mapFunder(f));
    } catch (err) {
      console.error('load funder options error:', err);
      return [];
    }
  }

  // ===== Mapping (API -> UI) =====
  private mapGrant(item: ApiGrantListItem): GrantItem {
    return {
      ...this.emptyForm(),
      id: item.id,
      code: item.code ?? '',
      title: item.title_th ?? '',
      titleEn: item.title_en,
      externalFundingId: item.funder?.id ?? null,
      minBudget: item.min_budget,
      maxBudget: item.max_budget,
      openedAt: item.open_date ?? '',
      deadline: item.deadline ?? '',
      trlMin: item.trl?.min ?? 1,
      trlMax: item.trl?.max ?? 9,
      status: item.status === 'published' ? 'published' : 'draft',
      publishedAt: item.published_at,
      updatedAt: item.updated_at,
    };
  }

  private mapDetail(d: ApiGrantDetail): GrantItem {
    return {
      id: d.id,
      code: d.code ?? '',
      title: d.title_th ?? '',
      titleEn: d.title_en,
      externalFundingId: d.funder_id ?? d.funder?.id ?? null,
      summary: d.summary ?? '',
      description: d.description,
      objective: d.objective,
      applicationUrl: d.application_url,
      documentUrl: d.document_url,
      minBudget: d.min_budget,
      maxBudget: d.max_budget,
      openedAt: d.open_date ?? '',
      deadline: d.deadline ?? '',
      trlMin: d.trl_min ?? 1,
      trlMax: d.trl_max ?? 9,
      piQualifications: [...(d.eligibility_requirements ?? [])]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((r) => ({
          description: r.description,
          isRequired: r.is_required,
        })),
      oecdIds: (d.oecds ?? []).map((o) => o.id),
      keywords: (d.keywords ?? []).map((k) => k.keyword),
      sourceUrl: d.announcement_url ?? '',
      status: d.status === 'published' ? 'published' : 'draft',
      publishedAt: d.published_at,
      updatedAt: d.updated_at,
    };
  }

  private toPayload(f: GrantItem): GrantPayload {
    const textOrNull = (v: string | null | undefined) => v?.trim() || null;
    return {
      funder_id: f.externalFundingId,
      title_th: f.title.trim(),
      title_en: textOrNull(f.titleEn),
      summary: textOrNull(f.summary),
      description: textOrNull(f.description),
      objective: textOrNull(f.objective),
      min_budget: f.minBudget ?? null,
      max_budget: f.maxBudget ?? null,
      open_date: f.openedAt || null,
      deadline: f.deadline || null,
      trl_min: f.trlMin,
      trl_max: f.trlMax,
      announcement_url: textOrNull(f.sourceUrl),
      application_url: textOrNull(f.applicationUrl),
      document_url: textOrNull(f.documentUrl),
      oecd_ids: [...f.oecdIds],
      keywords: [...f.keywords],
      eligibility_requirements: f.piQualifications.map((q) => ({
        description: q.description,
        is_required: q.isRequired,
      })),
    };
  }

  private mapFunder(f: ApiFunder): ExternalFunding {
    return {
      id: f.id,
      code: f.code,
      name: f.name_th || f.name_en || f.short_name || '-',
      shortName: f.short_name,
      type: this.mapFunderType(f.type),
    };
  }

  private mapFunderType(type: string): FunderType {
    switch (type) {
      case 'government':
        return 'รัฐ';
      case 'private':
        return 'เอกชน';
      case 'international':
      case 'foreign':
        return 'ต่างประเทศ';
      default:
        return 'อื่น ๆ';
    }
  }

  /** รวมรายการแหล่งทุนโดยไม่ซ้ำ id (รายการแรกมีสิทธิ์ก่อน) แล้วเรียงตามชื่อภาษาไทย */
  private mergeFundings(...lists: ExternalFunding[][]): ExternalFunding[] {
    const map = new Map<number, ExternalFunding>();
    lists.flat().forEach((f) => {
      if (!map.has(f.id)) map.set(f.id, f);
    });
    return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'th'));
  }

  /** เพิ่มสาขา OECD ที่ทุนใช้อยู่แต่ไม่มีในรายการตัวเลือก (เช่นสาขาย่อยจากข้อมูลเดิม) เพื่อให้แสดงและไม่หลุดตอนบันทึก */
  private mergeOecdOptions(oecds: ApiOecd[]): void {
    const missing = oecds
      .filter((o) => !this.oecdOptions.some((x) => x.id === o.id))
      .map((o) => ({ id: o.id, name: o.name_th || o.name_en || o.code }));
    if (missing.length) this.oecdOptions = [...this.oecdOptions, ...missing];
  }

  // ===== Stats =====
  get countPublished(): number {
    return this.grants.filter(
      (g) => g.status === 'published' && !this.isClosed(g)
    ).length;
  }

  get countDraft(): number {
    return this.grants.filter((g) => g.status === 'draft').length;
  }

  get countClosingSoon(): number {
    return this.grants.filter((g) => {
      const d = this.daysLeft(g);
      return g.status === 'published' && d >= 0 && d <= 14;
    }).length;
  }

  get countClosed(): number {
    return this.grants.filter((g) => this.isClosed(g)).length;
  }

  // ===== Filtering =====
  get filteredGrants(): GrantItem[] {
    const kw = this.keyword.trim().toLowerCase();
    return this.grants
      .filter((g) => {
        if (kw) {
          const text = [
            g.title,
            g.titleEn ?? '',
            g.code,
            this.fundingName(g.externalFundingId),
            ...g.keywords,
          ]
            .join(' ')
            .toLowerCase();
          if (!text.includes(kw)) return false;
        }
        if (
          this.fundingFilter !== '' &&
          g.externalFundingId !== Number(this.fundingFilter)
        )
          return false;
        switch (this.statusFilter) {
          case 'published':
            return g.status === 'published' && !this.isClosed(g);
          case 'draft':
            return g.status === 'draft';
          case 'closed':
            return this.isClosed(g);
          default:
            return true;
        }
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }

  get pagedGrants(): GrantItem[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredGrants.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredGrants.length / this.pageSize));
  }

  get pageNumbers(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  onFilterChange(): void {
    this.page = 1;
  }

  setStatusFilter(s: StatusFilter): void {
    this.statusFilter = s;
    this.page = 1;
  }

  goToPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) this.page = p;
  }

  // ===== Custom dropdowns =====
  isMenuOpen(key: MenuKey): boolean {
    return this.openMenu === key;
  }

  toggleMenu(key: MenuKey): void {
    this.openMenu = this.openMenu === key ? null : key;
  }

  /** ปิด dropdown เมื่อคลิกนอกกรอบของเมนูที่เปิดอยู่ */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.openMenu) return;
    const target = event.target as HTMLElement | null;
    if (!target?.closest(`[data-menu="${this.openMenu}"]`))
      this.openMenu = null;
  }

  // ตัวกรองแหล่งทุน (toolbar)
  get selectedFundingLabel(): string {
    if (this.fundingFilter === '') return 'ทุกแหล่งทุน';
    return (
      this.fundings.find((f) => f.id === this.fundingFilter)?.name ??
      'ทุกแหล่งทุน'
    );
  }

  selectFunding(id: number | ''): void {
    this.fundingFilter = id;
    this.openMenu = null;
    this.onFilterChange();
  }

  // แหล่งทุนในฟอร์มประกาศทุน
  get formFundingLabel(): string {
    if (!this.form.externalFundingId) return 'เลือกแหล่งทุน';
    return this.fundingName(this.form.externalFundingId);
  }

  selectFormFunding(id: number): void {
    this.form.externalFundingId = id;
    this.openMenu = null;
  }

  // ประเภทแหล่งทุนใน modal
  get funderTypeLabel(): string {
    return (
      this.funderTypeOptions.find((t) => t.value === this.funderForm.type)
        ?.label ?? 'เลือกประเภท'
    );
  }

  selectFunderType(value: string): void {
    this.funderForm.type = value;
    this.openMenu = null;
  }

  // ===== Helpers =====
  fundingName(id: number | null): string {
    return this.fundings.find((f) => f.id === id)?.name ?? '-';
  }

  fundingType(id: number | null): string {
    return this.fundings.find((f) => f.id === id)?.type ?? '';
  }

  daysLeft(g: GrantItem): number {
    if (!g.deadline) return NaN;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(g.deadline);
    d.setHours(0, 0, 0, 0);
    return Math.round((d.getTime() - today.getTime()) / 86400000);
  }

  isClosed(g: GrantItem): boolean {
    return this.daysLeft(g) < 0;
  }

  statusLabel(g: GrantItem): string {
    if (g.status === 'draft') return 'ฉบับร่าง';
    if (this.isClosed(g)) return 'ปิดรับแล้ว';
    return 'เผยแพร่';
  }

  statusTone(g: GrantItem): string {
    if (g.status === 'draft') return 'bg-gray-100 text-gray-600';
    if (this.isClosed(g)) return 'bg-red-50 text-red-600';
    return 'bg-emerald-50 text-emerald-700';
  }

  formatDate(iso: string): string {
    if (!iso) return '-';
    return new Date(iso).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: '2-digit',
    });
  }

  formatBudget(v: number | null): string {
    if (!v) return '-';
    return v.toLocaleString('th-TH');
  }

  /** ดึงข้อความ error จาก Laravel (validation error ตัวแรกก่อน แล้วค่อย message) */
  private errorMessage(err: unknown, fallback: string): string {
    if (err instanceof HttpErrorResponse) {
      const errors = err.error?.errors as Record<string, string[]> | undefined;
      const firstValidation = errors
        ? Object.values(errors)[0]?.[0]
        : undefined;
      return firstValidation || err.error?.message || fallback;
    }
    if (err instanceof Error) return err.message || fallback;
    return fallback;
  }

  private lockBodyScroll(): void {
    document.body.style.overflow = 'hidden';
  }

  private unlockBodyScrollIfIdle(): void {
    if (!this.isDrawerOpen && !this.isFunderModalOpen)
      document.body.style.overflow = '';
  }

  // ===== Drawer =====
  openCreate(): void {
    this.form = this.emptyForm();
    this.isEditing = false;
    this.isLoadingDetail = false;
    this.openDrawer();
  }

  async openEdit(g: GrantItem): Promise<void> {
    // แสดงข้อมูลจากรายการไปก่อน แล้วค่อยเติมรายละเอียดเต็มจาก endpoint รายละเอียด
    this.form = {
      ...g,
      piQualifications: g.piQualifications.map((q) => ({ ...q })),
      oecdIds: [...g.oecdIds],
      keywords: [...g.keywords],
    };
    this.isEditing = true;
    this.isLoadingDetail = true;
    this.openDrawer();

    const requestedId = g.id;
    try {
      const res = await firstValueFrom(this.grantsService.getGrant(g.id));
      if (res.result !== 1) throw new Error(res.message);
      // ผู้ใช้อาจปิด drawer หรือเปิดทุนอื่นไปแล้วระหว่างรอ
      if (!this.isDrawerOpen || this.form.id !== requestedId) return;

      this.mergeOecdOptions(res.data.oecds ?? []);
      if (res.data.funder)
        this.fundings = this.mergeFundings(this.fundings, [
          this.mapFunder(res.data.funder),
        ]);
      this.form = this.mapDetail(res.data);
    } catch (err) {
      console.error('load grant detail error:', err);
      if (this.isDrawerOpen && this.form.id === requestedId) {
        // ปิด drawer เพื่อกันการบันทึกทับด้วยข้อมูลไม่ครบ
        this.closeDrawer();
        this.showToast(
          'error',
          this.errorMessage(err, 'ไม่สามารถโหลดรายละเอียดทุนได้')
        );
      }
    } finally {
      if (this.form.id === requestedId) this.isLoadingDetail = false;
    }
  }

  private openDrawer(): void {
    this.openMenu = null;
    this.submitted = false;
    this.qualificationInput = '';
    this.keywordInput = '';
    this.isDrawerOpen = true;
    this.lockBodyScroll();
  }

  closeDrawer(): void {
    if (this.isSaving) return;
    this.openMenu = null;
    this.isDrawerOpen = false;
    this.isLoadingDetail = false;
    this.unlockBodyScrollIfIdle();
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.openMenu) this.openMenu = null;
    else if (this.isFunderModalOpen) this.closeFunderModal();
    else if (this.deleteTarget) this.cancelDelete();
    else if (this.isDrawerOpen) this.closeDrawer();
  }

  // ===== Funder modal =====
  openCreateFunder(): void {
    this.openMenu = null;
    this.funderForm = this.emptyFunderForm();
    this.funderSubmitted = false;
    this.isFunderModalOpen = true;
    this.lockBodyScroll();
  }

  closeFunderModal(): void {
    if (this.isSavingFunder) return;
    this.openMenu = null;
    this.isFunderModalOpen = false;
    this.unlockBodyScrollIfIdle();
  }

  get funderErrors(): Record<string, string> {
    const e: Record<string, string> = {};
    const f = this.funderForm;
    const code = f.code.trim().toLowerCase();
    const nameTh = f.nameTh.trim().toLowerCase();

    if (!code) e['code'] = 'กรุณากรอกรหัสแหล่งทุน';
    else if (this.fundings.some((x) => x.code?.toLowerCase() === code))
      e['code'] = 'รหัสนี้ถูกใช้แล้ว';

    if (!nameTh) e['nameTh'] = 'กรุณากรอกชื่อแหล่งทุน';
    else if (this.fundings.some((x) => x.name.trim().toLowerCase() === nameTh))
      e['nameTh'] = 'มีแหล่งทุนชื่อนี้อยู่แล้ว';

    if (!f.type) e['type'] = 'กรุณาเลือกประเภทแหล่งทุน';

    if (f.websiteUrl.trim() && !/^https?:\/\/.+/i.test(f.websiteUrl.trim()))
      e['websiteUrl'] = 'ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://';
    return e;
  }

  hasFunderError(key: string): boolean {
    return this.funderSubmitted && !!this.funderErrors[key];
  }

  async saveFunder(): Promise<void> {
    this.funderSubmitted = true;
    if (this.isSavingFunder || Object.keys(this.funderErrors).length > 0)
      return;

    const f = this.funderForm;
    const payload: FunderPayload = {
      code: f.code.trim().toUpperCase(),
      name_th: f.nameTh.trim(),
      name_en: f.nameEn.trim() || null,
      short_name: f.shortName.trim() || null,
      type: f.type,
      description: f.description.trim() || null,
      website_url: f.websiteUrl.trim() || null,
      is_active: true,
    };

    this.isSavingFunder = true;
    try {
      const res = await firstValueFrom(
        this.grantsService.createFunder(payload)
      );
      if (res.result !== 1) throw new Error(res.message);

      // เพิ่มเข้ารายการ แล้วเลือกให้ในฟอร์มประกาศทุนอัตโนมัติ
      const created = this.mapFunder(res.data);
      this.fundings = this.mergeFundings(this.fundings, [created]);
      if (this.isDrawerOpen) this.form.externalFundingId = created.id;

      this.isSavingFunder = false;
      this.closeFunderModal();
      this.showToast('success', res.message || 'เพิ่มแหล่งทุนแล้ว');
    } catch (err) {
      console.error('create funder error:', err);
      this.showToast(
        'error',
        this.errorMessage(err, 'ไม่สามารถเพิ่มแหล่งทุนได้')
      );
    } finally {
      this.isSavingFunder = false;
    }
  }

  // ===== Form: list fields =====
  addQualification(): void {
    const v = this.qualificationInput.trim();
    if (v)
      this.form.piQualifications.push({ description: v, isRequired: true });
    this.qualificationInput = '';
  }

  removeQualification(i: number): void {
    this.form.piQualifications.splice(i, 1);
  }

  addKeyword(event?: Event): void {
    event?.preventDefault();
    const parts = this.keywordInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s && !this.form.keywords.includes(s));
    this.form.keywords.push(...new Set(parts));
    this.keywordInput = '';
  }

  removeKeyword(i: number): void {
    this.form.keywords.splice(i, 1);
  }

  isOecdSelected(id: number): boolean {
    return this.form.oecdIds.includes(id);
  }

  toggleOecd(id: number): void {
    const i = this.form.oecdIds.indexOf(id);
    if (i >= 0) this.form.oecdIds.splice(i, 1);
    else this.form.oecdIds.push(id);
  }

  onTrlMinChange(): void {
    if (this.form.trlMax < this.form.trlMin)
      this.form.trlMax = this.form.trlMin;
  }

  // ===== Validation =====
  get errors(): Record<string, string> {
    const e: Record<string, string> = {};
    const f = this.form;
    if (!f.title.trim()) e['title'] = 'กรุณากรอกชื่อทุน';
    if (!f.externalFundingId) e['funding'] = 'กรุณาเลือกแหล่งทุน';
    if (!f.maxBudget || f.maxBudget <= 0)
      e['budget'] = 'กรุณากรอกงบประมาณที่มากกว่า 0';
    if (!f.deadline) e['deadline'] = 'กรุณาเลือกวันปิดรับ';
    if (f.openedAt && f.deadline && f.deadline < f.openedAt)
      e['deadline'] = 'วันปิดรับต้องไม่ก่อนวันเปิดรับ';
    if (f.trlMax < f.trlMin) e['trl'] = 'TRL สูงสุดต้องไม่น้อยกว่า TRL ต่ำสุด';
    if (f.oecdIds.length === 0) e['oecd'] = 'เลือกสาขาอย่างน้อย 1 สาขา';
    if (!/^https?:\/\/.+/i.test(f.sourceUrl.trim()))
      e['sourceUrl'] = 'ลิงก์ต้องขึ้นต้นด้วย http:// หรือ https://';
    return e;
  }

  hasError(key: string): boolean {
    return this.submitted && !!this.errors[key];
  }

  // ===== Save =====
  async save(status: GrantStatus): Promise<void> {
    if (this.isSaving || this.isLoadingDetail) return;
    this.submitted = true;

    // ฉบับร่างต้องมีอย่างน้อยชื่อทุน ส่วนการเผยแพร่ต้องครบทุกช่อง
    if (status === 'draft' && !this.form.title.trim()) return;
    if (status === 'published' && Object.keys(this.errors).length > 0) {
      this.showToast('error', 'กรอกข้อมูลให้ครบก่อนเผยแพร่');
      return;
    }

    const wasPublished = this.isEditing && this.form.status === 'published';
    const payload = this.toPayload(this.form);
    let savedId: number | null = null;

    this.isSaving = true;
    try {
      // 1) บันทึกข้อมูลทุน
      const res = this.isEditing
        ? await firstValueFrom(
            this.grantsService.updateGrant(this.form.id, payload)
          )
        : await firstValueFrom(this.grantsService.createGrant(payload));
      if (res.result !== 1) throw new Error(res.message);

      savedId = this.isEditing ? this.form.id : res.data?.id ?? null;
      if (!this.isEditing && savedId) {
        // สร้างสำเร็จแล้ว ถ้าขั้นถัดไปล้มเหลว กดบันทึกซ้ำจะเป็นการ update ไม่สร้างซ้ำ
        this.form.id = savedId;
        this.isEditing = true;
      }

      // 2) เปลี่ยนสถานะ (API create/update ไม่รับ status)
      if (status === 'published' && !wasPublished) {
        if (!savedId)
          throw new Error('ไม่พบรหัสทุนหลังบันทึก จึงเผยแพร่ไม่ได้');
        const pub = await firstValueFrom(
          this.grantsService.publishGrant(savedId)
        );
        if (pub.result !== 1) throw new Error(pub.message);
      } else if (status === 'draft' && wasPublished) {
        const unpub = await firstValueFrom(
          this.grantsService.unpublishGrant(this.form.id)
        );
        if (unpub.result !== 1) throw new Error(unpub.message);
      }

      this.isSaving = false;
      this.closeDrawer();
      this.showToast(
        'success',
        status === 'published'
          ? wasPublished
            ? 'บันทึกการแก้ไขแล้ว'
            : 'บันทึกและเผยแพร่แล้ว'
          : wasPublished
          ? 'ยกเลิกเผยแพร่และบันทึกเป็นฉบับร่างแล้ว'
          : 'บันทึกฉบับร่างแล้ว'
      );
      await this.loadData();
    } catch (err) {
      console.error('save grant error:', err);
      const fallback = savedId
        ? 'บันทึกข้อมูลแล้ว แต่เปลี่ยนสถานะไม่สำเร็จ'
        : 'ไม่สามารถบันทึกประกาศทุนได้';
      this.showToast('error', this.errorMessage(err, fallback));
      if (savedId) this.loadData();
    } finally {
      this.isSaving = false;
    }
  }

  // ===== Publish / Unpublish (จากตาราง) =====
  /** ฉบับร่าง -> เผยแพร่, เผยแพร่ -> กลับเป็นฉบับร่าง */
  async togglePublish(g: GrantItem): Promise<void> {
    if (this.statusChangingId !== null) return;
    const toPublish = g.status === 'draft';
    this.statusChangingId = g.id;

    try {
      const res = await firstValueFrom(
        toPublish
          ? this.grantsService.publishGrant(g.id)
          : this.grantsService.unpublishGrant(g.id)
      );
      if (res.result !== 1) throw new Error(res.message);

      const now = new Date().toISOString();
      this.grants = this.grants.map((x) =>
        x.id === g.id
          ? {
              ...x,
              status: toPublish ? 'published' : 'draft',
              publishedAt: toPublish ? now : null,
              updatedAt: now,
            }
          : x
      );
      // ถ้ากรองสถานะอยู่ รายการอาจหายจากหน้าปัจจุบัน
      if (this.page > this.totalPages) this.page = this.totalPages;

      this.showToast(
        'success',
        res.message || (toPublish ? 'เผยแพร่แล้ว' : 'ยกเลิกเผยแพร่แล้ว')
      );
    } catch (err) {
      console.error('toggle publish error:', err);
      this.showToast(
        'error',
        this.errorMessage(
          err,
          toPublish ? 'ไม่สามารถเผยแพร่ทุนได้' : 'ไม่สามารถยกเลิกเผยแพร่ได้'
        )
      );
    } finally {
      this.statusChangingId = null;
    }
  }

  // ===== Delete =====
  confirmDelete(g: GrantItem): void {
    this.deleteTarget = g;
  }

  cancelDelete(): void {
    if (!this.isDeleting) this.deleteTarget = null;
  }

  async deleteGrant(): Promise<void> {
    if (!this.deleteTarget || this.isDeleting) return;
    const id = this.deleteTarget.id;

    this.isDeleting = true;
    try {
      const res = await firstValueFrom(this.grantsService.deleteGrant(id));
      if (res.result !== 1) throw new Error(res.message);

      this.grants = this.grants.filter((g) => g.id !== id);
      if (this.page > this.totalPages) this.page = this.totalPages;
      this.isDeleting = false;
      this.deleteTarget = null;
      this.showToast('success', res.message || 'ลบทุนแล้ว');
    } catch (err) {
      console.error('delete grant error:', err);
      this.showToast('error', this.errorMessage(err, 'ไม่สามารถลบทุนได้'));
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

  // ===== Form defaults =====
  private emptyForm(): GrantItem {
    return {
      id: 0,
      code: '',
      title: '',
      titleEn: null,
      externalFundingId: null,
      summary: '',
      description: null,
      objective: null,
      applicationUrl: null,
      documentUrl: null,
      minBudget: null,
      maxBudget: null,
      openedAt: new Date().toISOString().slice(0, 10),
      deadline: '',
      trlMin: 1,
      trlMax: 9,
      piQualifications: [],
      oecdIds: [],
      keywords: [],
      sourceUrl: '',
      status: 'draft',
      publishedAt: null,
      updatedAt: new Date().toISOString(),
    };
  }

  private emptyFunderForm(): FunderForm {
    return {
      code: '',
      nameTh: '',
      nameEn: '',
      shortName: '',
      type: '',
      websiteUrl: '',
      description: '',
    };
  }
}
