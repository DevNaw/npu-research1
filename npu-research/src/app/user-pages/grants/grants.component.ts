import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription, forkJoin, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  finalize,
  map,
  switchMap,
  takeUntil,
  tap,
  timeout,
} from 'rxjs/operators';
import { MainComponent } from '../../shared/layouts/main/main.component';
import { UserGratsService } from '../../services/user-grats.service';
import {
  ApiPagination,
  FUNDER_TYPE_LABELS,
  FunderType,
  Grant,
  GrantQuery,
  mapGrantDetail,
  mapGrantListItem,
} from '../../models/grants.model';
import {
  GrantFilterOptions,
  OecdMajor,
  SelectOption,
} from '../../models/grant-filter.model';

type Tab = 'all' | 'recommended' | 'closing' | 'saved';
type DropdownKey = 'oecd' | 'trl' | 'budget' | 'sort';

interface DropdownOption {
  value: number | string;
  label: string;
  indent?: boolean;
}

interface OecdOption {
  id: number;
  name: string;
  level: number;
}

// ค่า default ของ backend — ถ้าตรงกับค่านี้จะไม่ส่ง param ไป
const DEFAULT_VIEW = 'all';
const DEFAULT_SORT = 'deadline';

// sort ที่คำนวณจากโปรไฟล์ผู้ใช้ → แสดงเฉพาะตอน login
const LOGIN_ONLY_SORTS = ['relevance'];

// fallback เมื่อโหลด filter-options ไม่ได้ — ค่าต้องตรงกับ validation ของ backend
const FALLBACK_SORTS: SelectOption[] = [
  { value: 'deadline', label: 'วันปิดรับใกล้ที่สุด' },
  { value: 'newest', label: 'ประกาศล่าสุด' },
  { value: 'budget_high', label: 'งบประมาณสูงสุด' },
  { value: 'budget_low', label: 'งบประมาณต่ำสุด' },
];
const FALLBACK_VIEWS = ['all', 'closing_soon'];

// quick keywords: ใช้ tag (keywords) จากทุนจริง -> ไม่มีข้อมูลค่อยใช้ชุดนี้
const DEFAULT_QUICK_KEYWORDS = [
  'AI',
  'เกษตร',
  'ผู้สูงอายุ',
  'Mekong',
  'Climate Change',
];
const QUICK_KEYWORD_LIMIT = 8;

// ตัวเลือกงบ: ก่อนโหลด filter-options ใช้ชุด default
// โหลดแล้ว -> min จาก API + ขั้นที่อยู่ในช่วง (min, max] จาก BUDGET_STEPS + max จาก API
const DEFAULT_BUDGET_PRESETS = [500000, 1000000, 3000000, 5000000];
const BUDGET_STEPS = [
  100000, 300000, 500000, 1000000, 2000000, 3000000, 5000000, 10000000,
  20000000, 50000000,
];

// รอ recalculate matching ได้นานสุดเท่านี้ เกินแล้วโหลดรายการไปก่อน
const RECALC_WAIT_MS = 5000;

// สร้าง formatter ครั้งเดียว (toLocaleDateString / toLocaleString สร้างใหม่ทุกครั้งที่เรียก)
const DATE_FORMAT = new Intl.DateTimeFormat('th-TH', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const NUMBER_FORMAT = new Intl.NumberFormat('th-TH');

// map แท็บ UI -> ค่า view ที่ API รับ
// null = backend ยังไม่รองรับ -> ซ่อนแท็บ และไม่ยิงค่านั้นไป API
// TODO: เปิดใช้ recommended เมื่อ backend เพิ่มค่าใน validation rule ของ view แล้ว
const TAB_TO_VIEW: Record<Tab, string | null> = {
  all: 'all',
  recommended: 'recommended',
  closing: 'closing_soon',
  saved: 'saved',
};

// แท็บที่ผูกกับผู้ใช้ -> แสดง/ยิง API เฉพาะตอน login
const LOGIN_ONLY_TABS: Tab[] = ['recommended', 'saved'];

@Component({
  selector: 'app-grants',
  standalone: false,
  templateUrl: './grants.component.html',
  styleUrl: './grants.component.css',
})
export class GrantsComponent implements OnInit, OnDestroy {
  // ===== Context =====
  basePath = ''; // '', '/user', '/admin'
  isLoggedIn = false;

  // ===== Data =====
  grants: Grant[] = [];
  oecdOptions: OecdOption[] = [];
  pagination = { currentPage: 1, lastPage: 1, total: 0 };
  stats = { open: 0, closingSoon: 0, recommended: 0, saved: 0 };
  private oecdFromApi = false;

  // ===== Options (จาก filter-options) =====
  sortOptions: SelectOption[] = [...FALLBACK_SORTS];
  availableViews: string[] = [...FALLBACK_VIEWS];
  budgetRange = { min: 0, max: 0 };

  // ===== Filters =====
  keyword = '';
  selectedOecd: number | '' = '';
  selectedTrl: number | '' = '';
  budgetFilter: number | '' = '';
  selectedFunderType: FunderType | '' = '';
  openOnly = true;
  activeTab: Tab = 'all';
  sortBy: string = DEFAULT_SORT;

  quickKeywords: string[] = [...DEFAULT_QUICK_KEYWORDS];
  private quickKeywordsFromTags = false;
  trlOptions: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  budgetOptions: { label: string; value: number | '' }[] = [];
  funderTypes: { value: FunderType; label: string }[] = [
    { value: 'government', label: 'รัฐ' },
    { value: 'private', label: 'เอกชน' },
    { value: 'international', label: 'ต่างประเทศ' },
  ];

  // ===== UI state =====
  isLoading = true;
  isLoadingMore = false;
  loadError = '';
  isFilterOpen = false; // mobile filter panel
  selectedGrant: Grant | null = null;
  isDetailLoading = false;
  detailError = '';
  savingIds = new Set<number>();

  // ===== Custom dropdown =====
  openDropdown: DropdownKey | null = null;
  dropdownSearch = '';
  dropdownOptions: Record<DropdownKey, DropdownOption[]> = {
    oecd: [],
    trl: [],
    budget: [],
    sort: [],
  };

  // ===== Streams =====
  private readonly reload$ = new Subject<void>();
  private readonly keyword$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();
  private detailSub?: Subscription;
  private queryVersion = 0;
  private lastSearchedKeyword = '';
  private firstLoad = true;

  /** query ของหน้าแรกที่โหลดสำเร็จล่าสุด — loadMore ใช้ค่านี้ ไม่อ่าน filter สด (กันผลปนกัน) */
  private currentQuery: GrantQuery = {};

  /** cache ของ filteredGrants — คำนวณใหม่เฉพาะเมื่อ input เปลี่ยน */
  private filteredCache: {
    src: Grant[] | null;
    openOnly: boolean;
    saved: boolean;
    out: Grant[];
  } = { src: null, openOnly: true, saved: false, out: [] };

  constructor(private router: Router, private grantService: UserGratsService) {}

  ngOnInit(): void {
    MainComponent.showLoading();
    this.detectContext();
    this.budgetOptions = this.buildBudgetOptions(0, 0);
    this.buildDropdownOptions();
    this.bindStreams();
    this.loadFilterOptions();
    this.initData();
  }

  /**
   * login แล้ว -> คำนวณคะแนน matching ก่อน แล้วค่อยโหลดรายการ/สถิติ เพื่อให้ % และแท็บแนะนำเป็นค่าล่าสุด
   * ถ้าคำนวณนานเกิน RECALC_WAIT_MS -> โหลดรายการไปก่อน แล้วโหลดซ้ำเมื่อคำนวณเสร็จ
   */
  private initData(): void {
    if (!this.isLoggedIn) {
      this.loadData();
      return;
    }

    let loadedEarly = false;
    this.grantService
      .recalculateMatchingOnce()
      .pipe(
        timeout({
          first: RECALC_WAIT_MS,
          with: () => {
            loadedEarly = true;
            this.loadData();
            // รอ request เดิมต่อ (shareReplay -> ไม่ยิงซ้ำ)
            return this.grantService.recalculateMatchingOnce();
          },
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((res) => {
        // ปกติ: โหลดครั้งเดียวหลังคำนวณเสร็จ
        // โหลดไปก่อนแล้ว: โหลดซ้ำเฉพาะเมื่อคำนวณสำเร็จ (ล้มเหลว = ค่าเดิมยังใช้ได้)
        if (!loadedEarly || res) this.loadData();
      });
  }

  private loadData(): void {
    this.loadStats();
    this.reload$.next();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.detailSub?.unsubscribe();
    document.body.style.overflow = '';
  }

  // ===== Context =====
  private detectContext(): void {
    const url = this.router.url;
    if (url.startsWith('/admin')) this.basePath = '/admin';
    else if (url.startsWith('/user')) this.basePath = '/user';
    else this.basePath = '';
    this.isLoggedIn = this.basePath !== '';
  }

  // ===== Feature availability (ตาม API) =====
  isTabAvailable(tab: Tab): boolean {
    if (LOGIN_ONLY_TABS.includes(tab) && !this.isLoggedIn) return false;
    const view = TAB_TO_VIEW[tab];
    return view !== null && this.availableViews.includes(view);
  }

  isSortAvailable(value: string): boolean {
    if (LOGIN_ONLY_SORTS.includes(value) && !this.isLoggedIn) return false;
    return this.sortOptions.some((o) => o.value === value);
  }

  // ===== Filter options =====
  private loadFilterOptions(): void {
    this.grantService
      .getFilterOptions()
      .pipe(
        catchError(() => of(null)),
        takeUntil(this.destroy$)
      )
      .subscribe((res) => {
        const d: GrantFilterOptions | null =
          res && res.result === 1 && res.data ? res.data : null;

        if (!d) {
          this.loadOecd(); // fallback: ใช้ endpoint OECD เดิม
          return;
        }

        if (d.sorts?.length) this.sortOptions = d.sorts;
        if (d.views?.length) this.availableViews = d.views.map((v) => v.value);
        if (d.funder_types?.length) {
          this.funderTypes = d.funder_types.map((t) => ({
            value: t.value as FunderType,
            label: t.label,
          }));
        }
        if (d.trl?.length) this.trlOptions = d.trl;
        if (d.budget) {
          this.budgetRange = d.budget;
          this.budgetOptions = this.buildBudgetOptions(
            d.budget.min,
            d.budget.max
          );
        }

        if (d.oecd?.length) {
          this.oecdOptions = this.mapOecdMajors(d.oecd);
          this.oecdFromApi = true;
        } else {
          this.loadOecd();
        }

        this.buildDropdownOptions();
        this.ensureValidState();
      });
  }

  /** ค่าที่เลือกอยู่ไม่มีใน options จาก API -> reset แล้วโหลดใหม่ (กัน 422 จาก validation) */
  private ensureValidState(): void {
    let changed = false;

    if (!this.isSortAvailable(this.sortBy)) {
      this.sortBy = this.isSortAvailable(DEFAULT_SORT)
        ? DEFAULT_SORT
        : this.dropdownOptions.sort[0]?.value?.toString() ?? DEFAULT_SORT;
      changed = true;
    }

    if (!this.isTabAvailable(this.activeTab)) {
      this.activeTab = 'all';
      changed = true;
    }

    if (
      this.budgetFilter !== '' &&
      !this.budgetOptions.some((o) => o.value === this.budgetFilter)
    ) {
      this.budgetFilter = '';
      changed = true;
    }

    if (
      this.selectedTrl !== '' &&
      !this.trlOptions.includes(this.selectedTrl)
    ) {
      this.selectedTrl = '';
      changed = true;
    }

    if (changed) this.reload$.next();
  }

  /** สร้างตัวเลือกงบจากช่วง min–max ของ API เช่น 300k–3M -> 300k, 500k, 1M, 2M, 3M */
  private buildBudgetOptions(
    min: number,
    max: number
  ): { label: string; value: number | '' }[] {
    let values: number[];
    if (min > 0 && max >= min) {
      values = [min, ...BUDGET_STEPS.filter((v) => v > min && v < max), max];
    } else {
      values = DEFAULT_BUDGET_PRESETS;
    }
    const unique = [...new Set(values)].sort((a, b) => a - b);
    return [
      { label: 'ทุกช่วงงบ', value: '' },
      ...unique.map((v) => ({
        label: `${this.formatBudget(v)}ขึ้นไป`,
        value: v,
      })),
    ];
  }

  /** OECD สาขาหลักจาก filter-options — แสดงครบทุกตัว เรียงตาม code */
  private mapOecdMajors(majors: OecdMajor[]): OecdOption[] {
    return (
      [...majors]
        .sort((a, b) => a.code.localeCompare(b.code))
        // เอาแค่ 6 สาขาหลัก (ตัด 07 อื่นๆ) -> เปิดบรรทัดล่าง
        // .filter((m) => m.code !== '07')
        .map((m) => ({
          id: m.major_id,
          name: m.name_th || m.name_en || m.code,
          level: 1,
        }))
    );
  }

  // ===== Streams =====
  private bindStreams(): void {
    // พิมพ์ค้นหา -> รอ 400ms แล้วค่อยยิง API
    this.keyword$
      .pipe(debounceTime(400), takeUntil(this.destroy$))
      .subscribe(() => {
        if (this.keyword.trim() !== this.lastSearchedKeyword)
          this.reload$.next();
      });

    // โหลดหน้าแรกใหม่ทุกครั้งที่ filter เปลี่ยน (switchMap ยกเลิก request เก่า)
    // ส่ง query ผ่าน stream ไปพร้อมผลลัพธ์ -> รู้แน่ว่าผลนี้มาจาก query ไหน
    this.reload$
      .pipe(
        map(() => this.buildQuery()),
        tap(() => {
          this.queryVersion++;
          this.isLoading = true;
          this.loadError = '';
        }),
        switchMap((query) =>
          this.grantService.getUserGrats(query).pipe(
            map((res) => ({ query, res })),
            catchError((err: HttpErrorResponse) => {
              this.loadError = this.extractErrorMessage(err);
              return of({ query, res: null });
            })
          )
        ),
        takeUntil(this.destroy$)
      )
      .subscribe(({ query, res }) => {
        if (res && res.result === 1 && res.data) {
          this.currentQuery = query;
          this.grants = (res.data.items ?? []).map(mapGrantListItem);
          this.setPagination(res.data.pagination);
          this.mergeOecdFromGrants();
          this.updateQuickKeywordsFromTags();

          // query ว่าง = request เดียวกับตัวนับ "ทุนที่เปิดรับ" -> ใช้ total ได้เลย ไม่ต้องยิงแยก
          if (this.isDefaultQuery(query)) {
            this.stats = { ...this.stats, open: this.pagination.total };
          }
        } else {
          this.grants = [];
          this.pagination = { currentPage: 1, lastPage: 1, total: 0 };
          this.loadError =
            this.loadError ||
            res?.message ||
            'โหลดข้อมูลทุนไม่สำเร็จ กรุณาลองใหม่';
        }
        this.isLoading = false;
        if (this.firstLoad) {
          this.firstLoad = false;
          MainComponent.hideLoading();
        }
      });
  }

  /** ดึงข้อความ error จาก Laravel (message / errors) */
  private extractErrorMessage(err: HttpErrorResponse): string {
    const body = err?.error;
    const firstFieldError = body?.errors
      ? (Object.values(body.errors)[0] as string[] | undefined)?.[0]
      : undefined;
    return (
      body?.message || firstFieldError || 'โหลดข้อมูลทุนไม่สำเร็จ กรุณาลองใหม่'
    );
  }

  /** ส่งเฉพาะเงื่อนไขที่ผู้ใช้เลือก — ไม่เลือกอะไรเลยจะได้ query ว่าง = ค้นหาทั้งหมด (หน้า 1) */
  private buildQuery(): GrantQuery {
    const search = this.keyword.trim();
    this.lastSearchedKeyword = search;

    const view = TAB_TO_VIEW[this.activeTab] ?? DEFAULT_VIEW;
    const sort = this.isSortAvailable(this.sortBy) ? this.sortBy : DEFAULT_SORT;

    return {
      search: search || undefined,
      oecd_id: this.selectedOecd === '' ? undefined : Number(this.selectedOecd),
      trl: this.selectedTrl === '' ? undefined : Number(this.selectedTrl),
      funder_type: this.selectedFunderType || undefined,
      view: view === DEFAULT_VIEW ? undefined : view,
      max_budget:
        this.budgetFilter === '' ? undefined : Number(this.budgetFilter),
      sort: sort === DEFAULT_SORT ? undefined : sort,
    };
  }

  private isDefaultQuery(query: GrantQuery): boolean {
    return Object.values(query).every((v) => v === undefined);
  }

  private setPagination(p: ApiPagination | undefined): void {
    this.pagination = {
      currentPage: p?.current_page ?? 1,
      lastPage: p?.last_page ?? 1,
      total: p?.total ?? this.grants.length,
    };
  }

  reload(): void {
    this.reload$.next();
  }

  // ===== Pagination =====
  get hasMore(): boolean {
    return this.pagination.currentPage < this.pagination.lastPage;
  }

  loadMore(): void {
    // หน้าแรกกำลังโหลด -> currentQuery ยังเป็นของชุดเก่า ห้ามโหลดต่อ
    if (this.isLoading || this.isLoadingMore || !this.hasMore) return;
    const version = this.queryVersion;
    const query: GrantQuery = {
      ...this.currentQuery,
      page: this.pagination.currentPage + 1,
    };
    this.isLoadingMore = true;

    this.grantService
      .getUserGrats(query)
      .pipe(
        finalize(() => (this.isLoadingMore = false)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          if (version !== this.queryVersion) return; // filter เปลี่ยนระหว่างโหลด
          if (res?.result !== 1 || !res.data) {
            this.loadError = res?.message || 'โหลดทุนเพิ่มไม่สำเร็จ กรุณาลองใหม่';
            return;
          }
          const existing = new Set(this.grants.map((g) => g.id));
          const items = (res.data.items ?? [])
            .map(mapGrantListItem)
            .filter((g) => !existing.has(g.id));
          this.grants = [...this.grants, ...items];
          this.setPagination(res.data.pagination);
        },
        error: () => (this.loadError = 'โหลดทุนเพิ่มไม่สำเร็จ กรุณาลองใหม่'),
      });
  }

  // ===== Stats (ตัวเลขบน header) =====
  /**
   * stats.open ไม่ต้องยิงแยก — ได้จาก total ของ list ตอน query ว่าง (ดู bindStreams)
   * TODO: ถ้า backend มี GET /grants/stats จะเหลือ request เดียวแทน 3
   */
  private loadStats(): void {
    const countTab = (tab: Tab, needLogin = false): Observable<number> => {
      const view = TAB_TO_VIEW[tab];
      if (!view || (needLogin && !this.isLoggedIn)) return of(0);
      return this.grantService.getUserGrats({ view }).pipe(
        map((r) => r?.data?.pagination?.total ?? 0),
        catchError(() => of(0))
      );
    };

    forkJoin({
      closingSoon: countTab('closing'),
      recommended: countTab('recommended', true),
      saved: countTab('saved', true),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe((s) => (this.stats = { ...this.stats, ...s }));
  }

  get openCount(): number {
    return this.stats.open;
  }

  get closingSoonCount(): number {
    return this.stats.closingSoon;
  }

  get recommendedCount(): number {
    return this.stats.recommended;
  }

  // ===== Quick keywords (จาก tag ของทุน) =====
  /**
   * นับ tag จากทุนที่โหลดมา เรียงตามจำนวนทุนที่ใช้ tag นั้น -> เอา top N
   * คำนวณจากผลที่ไม่มี filter เท่านั้น แล้วล็อกไว้ (chip ไม่เปลี่ยนตามผลค้นหา)
   */
  private updateQuickKeywordsFromTags(): void {
    if (this.quickKeywordsFromTags) return;
    if (
      this.keyword.trim() ||
      this.activeFilterCount > 0 ||
      this.activeTab !== 'all'
    )
      return;

    const count = new Map<string, { label: string; n: number }>();
    this.grants.forEach((g) => {
      // กัน tag ซ้ำในทุนเดียวกัน (ต่างตัวพิมพ์)
      const seen = new Set<string>();
      g.keywords.forEach((raw) => {
        const label = raw.trim();
        const key = label.toLowerCase();
        if (!label || seen.has(key)) return;
        seen.add(key);
        const cur = count.get(key);
        count.set(key, { label: cur?.label ?? label, n: (cur?.n ?? 0) + 1 });
      });
    });

    const tags = [...count.values()]
      .sort((a, b) => b.n - a.n || a.label.localeCompare(b.label, 'th'))
      .slice(0, QUICK_KEYWORD_LIMIT)
      .map((t) => t.label);

    if (tags.length) {
      this.quickKeywords = tags;
      this.quickKeywordsFromTags = true;
    }
  }

  // ===== OECD (fallback) =====
  private loadOecd(): void {
    this.grantService
      .getOecdCategories()
      .pipe(
        catchError(() => of(null)),
        takeUntil(this.destroy$)
      )
      .subscribe((res) => {
        const options = this.flattenOecd(res?.data);
        if (options.length) {
          this.oecdOptions = options;
          this.oecdFromApi = true;
          this.buildDropdownOptions();
        }
      });
  }

  /**
   * รองรับ tree ได้หลายรูปแบบ: array ตรง ๆ หรือ { oecd | items | tree } และลูกใน children
   * id ใช้ id หรือ major_id — แสดงเฉพาะสาขาหลัก (level 1) เรียงตาม code
   */
  private flattenOecd(tree: unknown): OecdOption[] {
    const out: (OecdOption & { code: string })[] = [];
    const walk = (nodes: any[], depth: number) => {
      for (const n of nodes ?? []) {
        const id = n?.id ?? n?.major_id;
        if (id === null || id === undefined) continue;
        out.push({
          id: Number(id),
          name: n.name_th || n.name_en || n.name || n.code || '-',
          level: Number(n.level ?? depth),
          code: String(n.code ?? ''),
        });
        const kids = n.children ?? n.childrens ?? n.sub_categories;
        if (Array.isArray(kids)) walk(kids, depth + 1);
      }
    };
    const root: any = tree;
    walk(
      Array.isArray(root)
        ? root
        : root?.oecd ?? root?.items ?? root?.tree ?? [],
      1
    );
    return (
      out
        .filter((o) => o.level === 1)
        // เอาแค่ 6 สาขาหลัก (ตัด 07 อื่นๆ) -> เปิดบรรทัดล่าง
        // .filter((o) => o.code !== '07')
        .sort((a, b) => a.code.localeCompare(b.code))
        .map(({ id, name, level }) => ({ id, name, level }))
    );
  }

  /** fallback สุดท้าย: โหลด OECD จาก API ไม่ได้ ใช้สาขาจากทุนที่โหลดมาแทน */
  private mergeOecdFromGrants(): void {
    if (this.oecdFromApi) return;
    const byId = new Map(this.oecdOptions.map((o) => [o.id, o]));
    this.grants
      .flatMap((g) => g.oecds)
      .filter((o) => o.level === 1)
      .forEach((o) => {
        if (!byId.has(o.id))
          byId.set(o.id, { id: o.id, name: o.name, level: 1 });
      });
    this.oecdOptions = [...byId.values()].sort((a, b) =>
      a.name.localeCompare(b.name, 'th')
    );
    this.buildDropdownOptions();
  }

  // ===== Custom dropdown =====
  /** สร้างรายการตัวเลือกเก็บไว้ครั้งเดียว (ไม่สร้าง array ใหม่ทุกรอบ change detection) */
  private buildDropdownOptions(): void {
    this.dropdownOptions = {
      oecd: [
        { value: '', label: 'ทุกสาขา' },
        ...this.oecdOptions.map((o) => ({
          value: o.id,
          label: o.name,
          indent: o.level > 1,
        })),
      ],
      trl: [
        { value: '', label: 'ทุกระดับ' },
        ...this.trlOptions.map((t) => ({ value: t, label: `TRL ${t}` })),
      ],
      budget: this.budgetOptions.map((b) => ({
        value: b.value,
        label: b.label,
      })),
      sort: this.sortOptions
        .filter((o) => this.isSortAvailable(o.value))
        .map((o) => ({ value: o.value, label: o.label })),
    };
  }

  /** รายการที่แสดงจริง — OECD ค้นหาได้ */
  visibleOptions(key: DropdownKey): DropdownOption[] {
    const options = this.dropdownOptions[key];
    const q = this.dropdownSearch.trim().toLowerCase();
    if (key !== 'oecd' || !q) return options;
    return options.filter(
      (o) => o.value !== '' && o.label.toLowerCase().includes(q)
    );
  }

  private currentValue(key: DropdownKey): number | string {
    switch (key) {
      case 'oecd':
        return this.selectedOecd;
      case 'trl':
        return this.selectedTrl;
      case 'budget':
        return this.budgetFilter;
      case 'sort':
        return this.sortBy;
    }
  }

  isSelected(key: DropdownKey, value: number | string): boolean {
    return this.currentValue(key) === value;
  }

  hasValue(key: DropdownKey): boolean {
    return key === 'sort' || this.currentValue(key) !== '';
  }

  selectedLabel(key: DropdownKey): string {
    const current = this.currentValue(key);
    const found = this.dropdownOptions[key].find((o) => o.value === current);
    return found?.label ?? this.dropdownOptions[key][0]?.label ?? '-';
  }

  toggleDropdown(key: DropdownKey): void {
    if (this.openDropdown === key) {
      this.closeDropdown();
      return;
    }
    this.openDropdown = key;
    this.dropdownSearch = '';
    if (key === 'oecd') this.focusLater('[data-dd-search]');
  }

  closeDropdown(focusTrigger = false): void {
    const key = this.openDropdown;
    this.openDropdown = null;
    this.dropdownSearch = '';
    if (focusTrigger && key) this.focusLater(`[data-dd-trigger="${key}"]`);
  }

  selectOption(key: DropdownKey, value: number | string): void {
    switch (key) {
      case 'oecd':
        this.onOecdChange(value as number | '');
        break;
      case 'trl':
        this.onTrlChange(value as number | '');
        break;
      case 'budget':
        this.onBudgetChange(value as number | '');
        break;
      case 'sort':
        this.onSortChange(String(value));
        break;
    }
    this.closeDropdown(true);
  }

  onDropdownSearch(value: string): void {
    this.dropdownSearch = value;
  }

  /** กันไม่ให้คลิกใน dropdown ไปปิดตัวเองผ่าน document:click */
  keepOpen(event: Event): void {
    event.stopPropagation();
  }

  /** ปุ่มเปิด: ลูกศรลง/ขึ้น = เปิดแล้วโฟกัสตัวเลือกที่เลือกอยู่ */
  onTriggerKeydown(event: Event, key: DropdownKey): void {
    const k = (event as KeyboardEvent).key;
    if (k !== 'ArrowDown' && k !== 'ArrowUp') return;
    event.preventDefault();
    if (this.openDropdown !== key) {
      this.openDropdown = key;
      this.dropdownSearch = '';
    }
    this.focusLater(
      `[data-dd-panel="${key}"] [aria-selected="true"], [data-dd-panel="${key}"] [data-dd-option]`
    );
  }

  /** ในแผงตัวเลือก: ลูกศรขึ้น/ลงเลื่อนโฟกัส, Tab ปิด */
  onPanelKeydown(event: Event): void {
    const k = (event as KeyboardEvent).key;
    if (k === 'Tab') {
      this.closeDropdown();
      return;
    }
    if (k !== 'ArrowDown' && k !== 'ArrowUp') return;
    event.preventDefault();
    const panel = event.currentTarget as HTMLElement;
    const options = Array.from(
      panel.querySelectorAll<HTMLElement>('[data-dd-option]')
    );
    if (!options.length) return;
    const idx = options.indexOf(document.activeElement as HTMLElement);
    const next =
      k === 'ArrowDown'
        ? options[Math.min(idx + 1, options.length - 1)]
        : idx <= 0
        ? options[0]
        : options[idx - 1];
    next.focus();
  }

  private focusLater(selector: string): void {
    setTimeout(() => document.querySelector<HTMLElement>(selector)?.focus());
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.openDropdown) this.closeDropdown();
  }

  trackByOption(_: number, o: DropdownOption): number | string {
    return o.value;
  }

  // ===== Filters =====
  /**
   * API ไม่มี param กรองทุนที่ปิดแล้ว จึงกรองฝั่ง client
   * แท็บ "บันทึกไว้" แสดงทุกทุนที่บันทึก รวมที่ปิดรับแล้ว (ไม่งั้นทุนที่บันทึกจะหายเงียบ ๆ)
   * memoize: คืน array เดิมถ้า input ไม่เปลี่ยน (ไม่ filter ใหม่ทุกรอบ change detection)
   */
  get filteredGrants(): Grant[] {
    const saved = this.activeTab === 'saved';
    const c = this.filteredCache;
    if (
      c.src !== this.grants ||
      c.openOnly !== this.openOnly ||
      c.saved !== saved
    ) {
      this.filteredCache = {
        src: this.grants,
        openOnly: this.openOnly,
        saved,
        out:
          saved || !this.openOnly
            ? this.grants
            : this.grants.filter((g) => g.daysRemaining >= 0),
      };
    }
    return this.filteredCache.out;
  }

  get activeFilterCount(): number {
    return [
      this.selectedOecd,
      this.selectedTrl,
      this.budgetFilter,
      this.selectedFunderType,
    ].filter((v) => v !== '').length;
  }

  onKeywordChange(value: string): void {
    this.keyword = value;
    this.keyword$.next(value);
  }

  searchNow(): void {
    this.reload$.next();
  }

  // ใช้ (keydown) + เช็ก key เอง แทน (keydown.enter) เลี่ยงปัญหา type-check ของ ngtsc
  onSearchKeydown(event: Event): void {
    if ((event as KeyboardEvent).key === 'Enter') this.searchNow();
  }

  onCardKeydown(event: Event, g: Grant): void {
    const key = (event as KeyboardEvent).key;
    if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      this.openDetail(g);
    }
  }

  clearKeyword(): void {
    this.keyword = '';
    this.reload$.next();
  }

  applyQuickKeyword(kw: string): void {
    this.keyword = this.keyword === kw ? '' : kw;
    this.reload$.next();
  }

  onFilterChange(): void {
    this.reload$.next();
  }

  // setter แยกเป็น method แทนการ assign ใน template (เลี่ยงปัญหา type-check ของ ngtsc)
  onOecdChange(value: number | ''): void {
    this.selectedOecd = value;
    this.onFilterChange();
  }

  onTrlChange(value: number | ''): void {
    this.selectedTrl = value;
    this.onFilterChange();
  }

  onBudgetChange(value: number | ''): void {
    this.budgetFilter = value;
    this.onFilterChange();
  }

  /** กรองฝั่ง client อย่างเดียว ไม่ต้องยิง API ใหม่ */
  onOpenOnlyChange(value: boolean): void {
    this.openOnly = value;
  }

  onSortChange(value: string): void {
    if (!this.isSortAvailable(value) || this.sortBy === value) return;
    this.sortBy = value;
    this.onFilterChange();
  }

  toggleFilterPanel(): void {
    this.isFilterOpen = !this.isFilterOpen;
  }

  setFunderType(type: FunderType | ''): void {
    if (this.selectedFunderType === type) return;
    this.selectedFunderType = type;
    this.reload$.next();
  }

  setTab(tab: Tab): void {
    if (this.activeTab === tab || !this.isTabAvailable(tab)) return;
    this.activeTab = tab;
    this.reload$.next();
  }

  clearFilters(): void {
    this.keyword = '';
    this.selectedOecd = '';
    this.selectedTrl = '';
    this.budgetFilter = '';
    this.selectedFunderType = '';
    this.openOnly = true;
    this.activeTab = 'all';
    this.reload$.next();
  }

  // ===== Matching =====
  matchTone(score: number): string {
    if (score >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (score >= 60)
      return 'text-[#8a6f00] bg-[#F2E7AC]/50 border-[#F2CB05]/40';
    return 'text-gray-500 bg-gray-50 border-gray-200';
  }

  // ===== Dates & formatting =====
  deadlineTone(g: Grant): string {
    const d = g.daysRemaining;
    if (d < 0) return 'bg-gray-100 text-gray-400';
    if (d <= 7) return 'bg-red-50 text-red-600';
    if (d <= 14) return 'bg-orange-50 text-orange-600';
    return 'bg-[#394250] text-white';
  }

  formatDate(iso: string | null): string {
    if (!iso) return '-';
    const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
    if (!y || !m || !d) return '-';
    return DATE_FORMAT.format(new Date(y, m - 1, d));
  }

  formatBudget(value: number | null): string {
    if (value === null || value === undefined) return 'ไม่ระบุ';
    if (value >= 1000000) {
      const m = value / 1000000;
      return `${Number.isInteger(m) ? m : m.toFixed(1)} ล้านบาท`;
    }
    return `${NUMBER_FORMAT.format(value)} บาท`;
  }

  trlLabel(g: Grant): string {
    if (g.trlMin === null && g.trlMax === null) return 'ไม่ระบุ';
    if (g.trlMin === g.trlMax || g.trlMax === null) return `${g.trlMin}`;
    if (g.trlMin === null) return `${g.trlMax}`;
    return `${g.trlMin}–${g.trlMax}`;
  }

  /** label จาก API ก่อน -> ค่าคงที่เดิม -> ค่าดิบ */
  funderTypeLabel(type: string): string {
    return (
      this.funderTypes.find((t) => t.value === type)?.label ??
      FUNDER_TYPE_LABELS[type] ??
      type ??
      '-'
    );
  }

  // ===== Saved =====
  toggleSave(g: Grant, event?: Event): void {
    event?.stopPropagation();
    if (!this.isLoggedIn) {
      this.goToLogin();
      return;
    }
    if (this.savingIds.has(g.id)) return;

    const next = !g.isSaved;
    this.applySaved(g.id, next); // optimistic
    this.savingIds.add(g.id);

    const request$ = next
      ? this.grantService.saveGrant(g.id)
      : this.grantService.unsaveGrant(g.id);

    request$
      .pipe(
        finalize(() => this.savingIds.delete(g.id)),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (res) => {
          // backend ตอบ 200 แต่ result !== 1 -> ถือว่าไม่สำเร็จ -> rollback
          if (res?.result !== 1) {
            this.applySaved(g.id, !next);
            return;
          }
          this.stats = {
            ...this.stats,
            saved: Math.max(0, this.stats.saved + (next ? 1 : -1)),
          };
          if (!next && this.activeTab === 'saved') {
            this.grants = this.grants.filter((x) => x.id !== g.id);
            this.pagination = {
              ...this.pagination,
              total: Math.max(0, this.pagination.total - 1),
            };
          }
        },
        error: (err: HttpErrorResponse) => {
          this.applySaved(g.id, !next); // rollback
          if (err.status === 401) this.goToLogin(); // token หมดอายุ
        },
      });
  }

  private applySaved(id: number, value: boolean): void {
    this.grants = this.grants.map((x) =>
      x.id === id ? { ...x, isSaved: value } : x
    );
    if (this.selectedGrant?.id === id) {
      this.selectedGrant = { ...this.selectedGrant, isSaved: value };
    }
  }

  // ===== Drawer =====
  openDetail(g: Grant): void {
    this.selectedGrant = g;
    this.detailError = '';
    document.body.style.overflow = 'hidden';
    this.detailSub?.unsubscribe();
    if (g.hasDetail) return;

    this.isDetailLoading = true;
    this.detailSub = this.grantService
      .getUserGratsById(g.id)
      .pipe(finalize(() => (this.isDetailLoading = false)))
      .subscribe({
        next: (res) => {
          if (!res?.data) return;
          const detail = mapGrantDetail(res.data);
          // เก็บไว้ใน list ด้วย เปิดซ้ำจะได้ไม่ต้องยิงใหม่
          this.grants = this.grants.map((x) =>
            x.id === detail.id ? detail : x
          );
          if (this.selectedGrant?.id === detail.id) this.selectedGrant = detail;
        },
        error: () => (this.detailError = 'โหลดรายละเอียดทุนไม่สำเร็จ'),
      });
  }

  closeDetail(): void {
    this.detailSub?.unsubscribe();
    this.isDetailLoading = false;
    this.selectedGrant = null;
    document.body.style.overflow = '';
  }

  retryDetail(): void {
    if (this.selectedGrant) this.openDetail(this.selectedGrant);
  }

  @HostListener('document:keydown.escape')
  onEsc(): void {
    if (this.openDropdown) {
      this.closeDropdown(true);
      return;
    }
    if (this.selectedGrant) this.closeDetail();
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  trackById(_: number, item: Grant): number {
    return item.id;
  }
}