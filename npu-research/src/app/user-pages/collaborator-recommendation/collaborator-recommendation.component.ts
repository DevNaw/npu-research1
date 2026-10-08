import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import {
  CollaboratorExplainData,
  CollaboratorRecommendation,
  ConfidenceCode,
  ExplainScores,
  LevelCounts,
  LevelFilter,
  LevelThresholds,
  MatchLevel,
  Pagination,
  RankThresholds,
  RecalculateResult,
  RecommendationScores,
  RecommenderEvaluation,
  RecommenderMetrics,
  ResearchOutput,
  ResearchType,
  TopicItem,
} from '../../models/collaborator-recommendation.model';
import { CollaboratorRecommendationService } from '../../services/collaborator-recommendation.service';
import { MainComponent } from '../../shared/layouts/main/main.component';

type ViewState = 'loading' | 'ready' | 'empty' | 'error';
type MethodKey = 'model' | 'popularity' | 'random';
type MetricKey = 'hit_rate' | 'ndcg' | 'recall';
type ScoreKey = keyof RecommendationScores;
type ExplainScoreKey = Exclude<keyof ExplainScores, 'activity_factor'>;
/** accepted = รับคำสั่งแล้ว กำลังคำนวณเบื้องหลัง / done = คำนวณเสร็จทันที (200) */
type RecalcNotice = 'accepted' | 'done' | null;

/** แถวหลักฐานใน drawer */
interface EvidenceRow {
  label: string;
  detail: string;
  ok: boolean;
}

@Component({
  selector: 'app-collaborator-recommendation',
  standalone: false,
  templateUrl: './collaborator-recommendation.component.html',
  styleUrl: './collaborator-recommendation.component.css',
})
export class CollaboratorRecommendationComponent implements OnInit, AfterViewInit, OnDestroy {
  /** Route of the researcher profile page; the researcher id is appended. */
  @Input() profileRoute = '/researcher';

  /** ที่วาง drawer + modal — ย้ายไปใต้ <body> กัน header ของ layout บัง */
  @ViewChild('overlayHost') private overlayHost?: ElementRef<HTMLElement>;

  state: ViewState = 'loading';
  items: CollaboratorRecommendation[] = [];
  levelCounts: LevelCounts | null = null;
  thresholds: LevelThresholds | null = null;
  rankThresholds: RankThresholds | null = null;
  /** API ยังไม่ส่ง evaluation มา → บล็อกประเมินผลจะถูกซ่อนไว้ */
  evaluation: RecommenderEvaluation | null = null;
  showEvaluation = false;
  activeLevel: LevelFilter = 'all';

  /** หน้าปัจจุบัน + ข้อมูลแบ่งหน้าจาก API */
  page = 1;
  pagination: Pagination | null = null;
  pageNumbers: number[] = [];
  private readonly pageWindow = 5;

  /** ปุ่ม "อัปเดตผู้ร่วมวิจัยใหม่" */
  recalculating = false;
  recalcNotice: RecalcNotice = null;
  /** ตัวเลขสรุป — มีเฉพาะกรณี API ตอบ 200 */
  recalcResult: RecalculateResult | null = null;
  recalcError: string | null = null;
  /** กันกดซ้ำหลังสั่งอัปเดตแล้ว (หน่วงไว้ช่วงหนึ่ง) */
  recalcCooldown = false;
  private readonly cooldownMs = 60_000;
  private cooldownTimer?: ReturnType<typeof setTimeout>;

  /** Drawer "ทำไมถึงแนะนำ" */
  explainOpen = false;
  explainLoading = false;
  explainError: string | null = null;
  explainTarget: CollaboratorRecommendation | null = null;
  explainData: CollaboratorExplainData | null = null;
  /** cache ต่อ researcher id — ล้างเมื่อโหลดรายการใหม่ */
  private explainCache: Record<number, CollaboratorExplainData> = {};
  private readonly maxDrawerTopics = 8;
  private readonly maxDrawerOutputs = 5;

  /** สาขา OECD / หัวข้อที่ตรงกัน (คำนวณครั้งเดียวตอนโหลด) */
  private fieldsById: Record<number, string[]> = {};
  private topicsById: Record<number, string[]> = {};
  private readonly maxTopics = 5;

  readonly levelClass: Record<MatchLevel, string> = {
    high: 'bg-[#F2CB05] text-gray-900',
    good: 'bg-amber-100 text-amber-800',
    consider: 'bg-gray-100 text-gray-700',
    other: 'bg-gray-50 text-gray-500',
  };

  readonly confidenceClass: Record<ConfidenceCode, string> = {
    high: 'text-emerald-700',
    medium: 'text-amber-700',
    low: 'text-gray-500',
  };

  readonly researchTypeLabel: Record<ResearchType, string> = {
    ARTICLE: 'บทความ',
    PROJECT: 'โครงการวิจัย',
    INNOVATION: 'นวัตกรรม',
  };

  readonly researchTypes: ResearchType[] = ['ARTICLE', 'PROJECT', 'INNOVATION'];

  readonly filters: { key: LevelFilter; label: string }[] = [
    { key: 'all', label: 'ทั้งหมด' },
    { key: 'high', label: 'เหมาะสมมาก' },
    { key: 'good', label: 'เหมาะสม' },
    { key: 'consider', label: 'น่าพิจารณา' },
    { key: 'other', label: 'อื่นๆ' },
  ];

  readonly scoreParts: { key: ScoreKey; label: string }[] = [
    { key: 'expertise', label: 'ความเชี่ยวชาญตรงกัน' },
    { key: 'network', label: 'เครือข่ายร่วม' },
    { key: 'activity', label: 'ผลงานต่อเนื่อง' },
  ];

  /** แถบคะแนนละเอียดใน drawer */
  readonly explainScoreParts: { key: ExplainScoreKey; label: string; hint: string }[] = [
    { key: 'expertise', label: 'ความเชี่ยวชาญ', hint: 'รวมสาขา OECD และหัวข้อวิจัย' },
    { key: 'oecd', label: 'สาขา OECD', hint: 'ความใกล้เคียงของสาขาวิจัย' },
    { key: 'topic', label: 'หัวข้อวิจัย', hint: 'คำสำคัญ/ชื่อผลงานที่ตรงกัน' },
    { key: 'network', label: 'เครือข่ายร่วม', hint: 'ผู้ร่วมงานที่รู้จักร่วมกัน' },
    { key: 'activity', label: 'ผลงานต่อเนื่อง', hint: 'ปริมาณและความต่อเนื่องของผลงาน' },
  ];

  readonly evaluationMetrics: { key: MetricKey; label: string }[] = [
    { key: 'hit_rate', label: 'พบผู้ร่วมงานจริงอย่างน้อย 1 คน' },
    { key: 'ndcg', label: 'คุณภาพการจัดอันดับ' },
    { key: 'recall', label: 'สัดส่วนผู้ร่วมงานจริงที่พบ' },
  ];

  readonly evaluationMethods: { key: MethodKey; label: string }[] = [
    { key: 'model', label: 'ระบบนี้' },
    { key: 'popularity', label: 'แนะนำคนที่มีผลงานมาก' },
    { key: 'random', label: 'สุ่มแนะนำ' },
  ];

  private sub?: Subscription;
  private recalcSub?: Subscription;
  private explainSub?: Subscription;

  constructor(
    private service: CollaboratorRecommendationService,
    private location: Location
  ) {}

  ngOnInit(): void {
    MainComponent.showLoading();
    this.loadRecommendations();
  }

  ngAfterViewInit(): void {
    // ย้าย DOM ไปไว้ท้าย <body> → หลุดจาก stacking context ของ layout
    // binding ของ Angular ยังทำงานปกติ เพราะ view tree ไม่ได้เปลี่ยน
    const host = this.overlayHost?.nativeElement;
    if (host) {
      document.body.appendChild(host);
    }
  }

  ngOnDestroy(): void {
    // DOM ที่ย้ายออกไปจะไม่ถูกลบอัตโนมัติ → ลบเอง
    this.overlayHost?.nativeElement.remove();
    this.sub?.unsubscribe();
    this.recalcSub?.unsubscribe();
    this.explainSub?.unsubscribe();
    if (this.cooldownTimer) {
      clearTimeout(this.cooldownTimer);
    }
    document.body.style.overflow = '';
    MainComponent.hideLoading();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.explainOpen) {
      this.closeExplain();
    }
  }

  // -------------------------------------------------------------------------
  // Recalculate
  // -------------------------------------------------------------------------

  /** สั่งอัปเดตครั้งเดียว แล้วแจ้งผลให้ผู้ใช้ทราบ (ไม่ poll) */
  recalculate(): void {
    if (this.recalculating || this.recalcCooldown) {
      return;
    }
    this.recalculating = true;
    this.recalcNotice = null;
    this.recalcResult = null;
    this.recalcError = null;
    this.syncBodyScroll();

    this.recalcSub?.unsubscribe();
    this.recalcSub = this.service
      .recalculate()
      .pipe(
        finalize(() => {
          this.recalculating = false;
          this.syncBodyScroll();
        })
      )
      .subscribe({
        next: (outcome) => {
          if (outcome.accepted) {
            // 202 / 409 → คำนวณอยู่เบื้องหลัง แจ้งผู้ใช้แล้วจบ
            this.recalcNotice = 'accepted';
            this.startCooldown();
          } else {
            // 200 → เสร็จแล้ว โหลดรายชื่อใหม่ตั้งแต่หน้าแรก
            this.recalcNotice = 'done';
            this.recalcResult = outcome.result;
            this.page = 1;
            this.loadRecommendations();
          }
        },
        error: (err) => {
          console.error('[CollaboratorRecommendation:recalculate]', err);
          this.recalcError = err?.message || 'อัปเดตผู้ร่วมวิจัยไม่สำเร็จ กรุณาลองอีกครั้ง';
        },
      });
  }

  dismissRecalc(): void {
    this.recalcNotice = null;
    this.recalcResult = null;
    this.recalcError = null;
  }

  /** ปุ่ม "โหลดรายชื่อใหม่" ในกล่องแจ้งเตือน — ผู้ใช้กดเองเมื่อพร้อม */
  reloadAfterRecalc(): void {
    this.dismissRecalc();
    this.page = 1;
    this.load();
  }

  private startCooldown(): void {
    this.recalcCooldown = true;
    if (this.cooldownTimer) {
      clearTimeout(this.cooldownTimer);
    }
    this.cooldownTimer = setTimeout(() => (this.recalcCooldown = false), this.cooldownMs);
  }

  // -------------------------------------------------------------------------
  // Explain drawer
  // -------------------------------------------------------------------------

  openExplain(r: CollaboratorRecommendation): void {
    this.explainTarget = r;
    this.explainOpen = true;
    this.explainError = null;
    this.syncBodyScroll();

    const cached = this.explainCache[r.researcher.id];
    if (cached) {
      this.explainData = cached;
      this.explainLoading = false;
      return;
    }
    this.fetchExplain(r.researcher.id);
  }

  retryExplain(): void {
    if (this.explainTarget) {
      this.fetchExplain(this.explainTarget.researcher.id);
    }
  }

  closeExplain(): void {
    this.explainSub?.unsubscribe();
    this.explainOpen = false;
    this.explainLoading = false;
    this.explainError = null;
    this.explainData = null;
    this.explainTarget = null;
    this.syncBodyScroll();
  }

  private fetchExplain(researcherId: number): void {
    this.explainSub?.unsubscribe();
    this.explainLoading = true;
    this.explainData = null;
    this.explainError = null;

    this.explainSub = this.service
      .explain(researcherId)
      .pipe(finalize(() => (this.explainLoading = false)))
      .subscribe({
        next: (res) => {
          if (res?.result !== 1 || !res.data) {
            this.explainError = res?.message || 'ไม่พบรายละเอียดการจับคู่';
            return;
          }
          this.explainCache[researcherId] = res.data;
          this.explainData = res.data;
        },
        error: (err) => {
          console.error('[CollaboratorRecommendation:explain]', err);
          this.explainError = err?.error?.message || 'โหลดรายละเอียดไม่สำเร็จ';
        },
      });
  }

  /** ชื่อหัวข้อที่ตรงกัน */
  explainSharedTopics(d: CollaboratorExplainData): string[] {
    return (d.explain?.expertise?.topic?.shared_topics ?? []).map((t) => t.topic);
  }

  /** หัวข้อเด่นของผู้ใช้ปัจจุบัน (researcher = เจ้าของหน้า) */
  myTopics(d: CollaboratorExplainData): TopicItem[] {
    return (d.explain?.expertise?.topic?.researcher_top_topics ?? []).slice(0, this.maxDrawerTopics);
  }

  /** หัวข้อเด่นของคนที่ถูกแนะนำ (candidate) */
  candidateTopics(d: CollaboratorExplainData): TopicItem[] {
    return (d.explain?.expertise?.topic?.candidate_top_topics ?? []).slice(0, this.maxDrawerTopics);
  }

  isSharedTopic(d: CollaboratorExplainData, topic: string): boolean {
    return this.explainSharedTopics(d).includes(topic);
  }

  /** ตัดผลงานชื่อซ้ำ (API ส่งชื่อเดียวกันหลาย id) */
  latestOutputs(d: CollaboratorExplainData): ResearchOutput[] {
    const seen = new Set<string>();
    const result: ResearchOutput[] = [];
    for (const o of d.explain?.activity?.latest_outputs ?? []) {
      const key = (this.outputTitle(o) || String(o.id)).replace(/\s+/g, '');
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      result.push(o);
      if (result.length >= this.maxDrawerOutputs) {
        break;
      }
    }
    return result;
  }

  outputTitle(o: ResearchOutput): string {
    const th = o.title_th?.trim();
    const en = o.title_en?.trim();
    return th && th !== '-' ? th : en && en !== '-' ? en : '';
  }

  evidenceRows(d: CollaboratorExplainData): EvidenceRow[] {
    const s = d.confidence?.signals;
    if (!s) {
      return [];
    }
    return [
      {
        label: 'สาขาวิจัย (OECD)',
        detail: s.oecd.available ? `คะแนน ${this.num(s.oecd.score)}` : 'ไม่มีข้อมูลสาขา',
        ok: s.oecd.available,
      },
      {
        label: 'หัวข้อวิจัย',
        detail: `คะแนน ${this.num(s.topic.score)} (เกณฑ์ ${s.topic.support_threshold})`,
        ok: s.topic.supporting,
      },
      {
        label: 'เครือข่ายร่วม',
        detail:
          `ผู้ร่วมงานร่วมกัน ${s.network.common_collaborator_count} คน ` +
          `(เกณฑ์ ${s.network.common_collaborator_support_threshold} คน)`,
        ok: s.network.supporting,
      },
      {
        label: 'เคยร่วมงานกันโดยตรง',
        detail: s.direct_collaboration.value ? 'เคย' : 'ยังไม่เคย',
        ok: s.direct_collaboration.value,
      },
    ];
  }

  hasGenericOecd(d: CollaboratorExplainData): boolean {
    return (d.explain?.expertise?.top_matches ?? []).some((m) => m.is_generic_pair);
  }

  // -------------------------------------------------------------------------
  // List
  // -------------------------------------------------------------------------

  setLevel(level: LevelFilter): void {
    if (this.activeLevel === level || this.state === 'loading') {
      return;
    }
    this.activeLevel = level;
    this.page = 1;
    this.loadRecommendations();
  }

  goToPage(page: number): void {
    const last = this.pagination?.last_page ?? 1;
    if (page < 1 || page > last || page === this.page || this.state === 'loading') {
      return;
    }
    this.page = page;
    this.loadRecommendations();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  loadRecommendations(): void {
    this.sub?.unsubscribe();
    this.state = 'loading';

    const level = this.activeLevel === 'all' ? null : this.activeLevel;

    this.sub = this.service.getRecommendations(level, this.page).subscribe({
      next: (res) => {
        if (res?.result !== 1 || !res.data) {
          this.fail(res?.message);
          return;
        }

        const data = res.data;
        this.items = data.recommendations ?? [];
        this.levelCounts = data.level_counts ?? null;
        this.thresholds = data.thresholds ?? null;
        this.rankThresholds = data.rank_thresholds ?? null;
        this.pagination = data.pagination ?? null;
        this.page = this.pagination?.current_page ?? this.page;
        this.pageNumbers = this.buildPageNumbers();
        this.explainCache = {};

        this.fieldsById = {};
        this.topicsById = {};
        for (const r of this.items) {
          this.fieldsById[r.researcher.id] = this.extractFields(r);
          this.topicsById[r.researcher.id] = this.extractTopics(r);
        }

        // ถ้ากรองระดับแล้วว่าง ยังคงแสดงตัวกรองไว้ (state = ready + ข้อความ "ไม่มีนักวิจัยในระดับนี้")
        this.state = this.items.length || this.activeLevel !== 'all' ? 'ready' : 'empty';
        MainComponent.hideLoading();
      },
      error: (err) => this.fail(err),
    });
  }

  /** Used by the "ลองอีกครั้ง" button. */
  load(): void {
    MainComponent.showLoading();
    this.loadRecommendations();
  }

  goBack(): void {
    this.location.back();
  }

  countBy(level: LevelFilter): number {
    return this.levelCounts?.[level] ?? 0;
  }

  thresholdHint(level: LevelFilter): string | null {
    if (!this.thresholds || level === 'all' || level === 'other') {
      return null;
    }
    return `คะแนนรวมตั้งแต่ ${this.thresholds[level]} ขึ้นไป`;
  }

  sharedFields(r: CollaboratorRecommendation): string[] {
    return this.fieldsById[r.researcher.id] ?? [];
  }

  sharedTopics(r: CollaboratorRecommendation): string[] {
    return this.topicsById[r.researcher.id] ?? [];
  }

  /** แสดงป้ายอันดับเฉพาะกลุ่มบน (มี top_percent) */
  showRank(r: CollaboratorRecommendation): boolean {
    return r.rank?.top_percent != null;
  }

  recentYears(r: CollaboratorRecommendation): number {
    return r.explain?.activity?.period?.recent_years || 5;
  }

  displayPosition(r: Pick<CollaboratorRecommendation, 'researcher'>): string {
    const work = r.researcher.work;
    const academic = work?.academic_position;
    // "ไม่มีตำแหน่ง" ไม่ใช่ตำแหน่ง → ใช้ position แทน
    if (academic && academic !== 'ไม่มีตำแหน่ง') {
      return academic;
    }
    return work?.position || 'นักวิจัย';
  }

  metricValue(method: MethodKey, metric: MetricKey): number {
    if (!this.evaluation) {
      return 0;
    }
    const source: RecommenderMetrics =
      method === 'model' ? this.evaluation.metrics : this.evaluation.baselines[method];
    return source?.[metric] ?? 0;
  }

  /** ค่า 0–1 (ใช้กับ evaluation) */
  percent(value: number | undefined): string {
    return `${Math.round((value ?? 0) * 100)}%`;
  }

  /** ค่า 0–100 (ใช้กับคะแนนจาก API) */
  scoreText(value: number | undefined): string {
    return `${Math.round(value ?? 0)}%`;
  }

  scoreWidth(value: number | undefined): number {
    return Math.max(0, Math.min(100, value ?? 0));
  }

  num(value: number | undefined, digits = 2): string {
    return (value ?? 0).toLocaleString('th-TH', { maximumFractionDigits: digits });
  }

  thaiDate(value: string): string {
    const date = new Date((value || '').replace(' ', 'T'));
    return isNaN(date.getTime())
      ? ''
      : date.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  initials(r: Pick<CollaboratorRecommendation, 'researcher'>): string {
    return (r.researcher.first_name || r.researcher.full_name_th || '?').trim().charAt(0);
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  trackById(_: number, item: CollaboratorRecommendation): number {
    return item.researcher.id;
  }

  private syncBodyScroll(): void {
    document.body.style.overflow = this.recalculating || this.explainOpen ? 'hidden' : '';
  }

  private buildPageNumbers(): number[] {
    const last = this.pagination?.last_page ?? 1;
    if (last <= 1) {
      return [];
    }
    const half = Math.floor(this.pageWindow / 2);
    let start = Math.max(1, this.page - half);
    const end = Math.min(last, start + this.pageWindow - 1);
    start = Math.max(1, end - this.pageWindow + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  /** หน้ารายการไม่มี explain แล้ว → คืน [] ถ้าไม่มี */
  private extractFields(r: CollaboratorRecommendation): string[] {
    const names = (r.explain?.expertise?.top_matches ?? [])
      .map((m) => m.source_oecd?.name_th?.trim())
      .filter((n): n is string => !!n && n !== 'อื่นๆ');
    return Array.from(new Set(names));
  }

  private extractTopics(r: CollaboratorRecommendation): string[] {
    const names = (r.shared_topics ?? [])
      .map((t) => (typeof t === 'string' ? t : t?.topic)?.trim())
      .filter((n): n is string => !!n);
    return Array.from(new Set(names)).slice(0, this.maxTopics);
  }

  private fail(err: unknown): void {
    console.error('[CollaboratorRecommendation]', err);
    this.items = [];
    this.pagination = null;
    this.pageNumbers = [];
    this.state = 'error';
    MainComponent.hideLoading();
  }
}