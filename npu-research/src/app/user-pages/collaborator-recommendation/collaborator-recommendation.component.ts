import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';
import {
  CollaboratorRecommendation,
  LevelCounts,
  LevelFilter,
  LevelThresholds,
  MatchLevel,
  RecalculateResult,
  RecommendationScores,
  RecommenderEvaluation,
  RecommenderMetrics,
} from '../../models/collaborator-recommendation.model';
import { CollaboratorRecommendationService } from '../../services/collaborator-recommendation.service';
import { MainComponent } from '../../shared/layouts/main/main.component';

type ViewState = 'loading' | 'ready' | 'empty' | 'error';
type MethodKey = 'model' | 'popularity' | 'random';
type MetricKey = 'hit_rate' | 'ndcg' | 'recall';
type ScoreKey = keyof RecommendationScores;
/** accepted = รับคำสั่งแล้ว กำลังคำนวณเบื้องหลัง / done = คำนวณเสร็จทันที (200) */
type RecalcNotice = 'accepted' | 'done' | null;

@Component({
  selector: 'app-collaborator-recommendation',
  standalone: false,
  templateUrl: './collaborator-recommendation.component.html',
  styleUrl: './collaborator-recommendation.component.css',
})
export class CollaboratorRecommendationComponent implements OnInit, OnDestroy {
  /** Route of the researcher profile page; the researcher id is appended. */
  @Input() profileRoute = '/researcher';

  state: ViewState = 'loading';
  items: CollaboratorRecommendation[] = [];
  levelCounts: LevelCounts | null = null;
  thresholds: LevelThresholds | null = null;
  /** API ยังไม่ส่ง evaluation มา → บล็อกประเมินผลจะถูกซ่อนไว้ */
  evaluation: RecommenderEvaluation | null = null;
  showEvaluation = false;
  activeLevel: LevelFilter = 'all';

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

  /** สาขา OECD ที่ตรงกัน (คำนวณครั้งเดียวตอนโหลด) */
  private fieldsById: Record<number, string[]> = {};

  readonly levelClass: Record<MatchLevel, string> = {
    high: 'bg-[#F2CB05] text-gray-900',
    good: 'bg-amber-100 text-amber-800',
    consider: 'bg-gray-100 text-gray-700',
    other: 'bg-gray-50 text-gray-500',
  };

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

  constructor(
    private service: CollaboratorRecommendationService,
    private location: Location
  ) {}

  ngOnInit(): void {
    MainComponent.showLoading();
    this.loadRecommendations();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.recalcSub?.unsubscribe();
    if (this.cooldownTimer) {
      clearTimeout(this.cooldownTimer);
    }
    document.body.style.overflow = '';
    MainComponent.hideLoading();
  }

  /** สั่งอัปเดตครั้งเดียว แล้วแจ้งผลให้ผู้ใช้ทราบ (ไม่ poll) */
  recalculate(): void {
    if (this.recalculating || this.recalcCooldown) {
      return;
    }
    this.recalculating = true;
    this.recalcNotice = null;
    this.recalcResult = null;
    this.recalcError = null;
    document.body.style.overflow = 'hidden';

    this.recalcSub?.unsubscribe();
    this.recalcSub = this.service
      .recalculate()
      .pipe(
        finalize(() => {
          this.recalculating = false;
          document.body.style.overflow = '';
        })
      )
      .subscribe({
        next: (outcome) => {
          if (outcome.accepted) {
            // 202 / 409 → คำนวณอยู่เบื้องหลัง แจ้งผู้ใช้แล้วจบ
            this.recalcNotice = 'accepted';
            this.startCooldown();
          } else {
            // 200 → เสร็จแล้ว โหลดรายชื่อใหม่
            this.recalcNotice = 'done';
            this.recalcResult = outcome.result;
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
    this.load();
  }

  private startCooldown(): void {
    this.recalcCooldown = true;
    if (this.cooldownTimer) {
      clearTimeout(this.cooldownTimer);
    }
    this.cooldownTimer = setTimeout(() => (this.recalcCooldown = false), this.cooldownMs);
  }

  setLevel(level: LevelFilter): void {
    if (this.activeLevel === level || this.state === 'loading') {
      return;
    }
    this.activeLevel = level;
    this.loadRecommendations();
  }

  loadRecommendations(): void {
    this.sub?.unsubscribe();
    this.state = 'loading';

    const level = this.activeLevel === 'all' ? null : this.activeLevel;

    this.sub = this.service.getRecommendations(level).subscribe({
      next: (res) => {
        if (res?.result !== 1 || !res.data) {
          this.fail(res?.message);
          return;
        }

        const data = res.data;
        this.items = data.recommendations ?? [];
        this.levelCounts = data.level_counts ?? null;
        this.thresholds = data.thresholds ?? null;
        this.fieldsById = {};
        for (const r of this.items) {
          this.fieldsById[r.researcher.id] = this.extractFields(r);
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

  displayPosition(r: CollaboratorRecommendation): string {
    const work = r.researcher.work;
    return work?.academic_position || work?.position || 'นักวิจัย';
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

  thaiDate(value: string): string {
    const date = new Date((value || '').replace(' ', 'T'));
    return isNaN(date.getTime())
      ? ''
      : date.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  initials(r: CollaboratorRecommendation): string {
    return (r.researcher.first_name || r.researcher.full_name_th || '?').trim().charAt(0);
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  trackById(_: number, item: CollaboratorRecommendation): number {
    return item.researcher.id;
  }

  private extractFields(r: CollaboratorRecommendation): string[] {
    const names = (r.explain?.expertise?.top_matches ?? [])
      .map((m) => m.source_oecd?.name_th?.trim())
      .filter((n): n is string => !!n && n !== 'อื่นๆ');
    return Array.from(new Set(names));
  }

  private fail(err: unknown): void {
    console.error('[CollaboratorRecommendation]', err);
    this.items = [];
    this.state = 'error';
    MainComponent.hideLoading();
  }
}