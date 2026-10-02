// import { Component, Input, OnDestroy, OnInit } from '@angular/core';
// import { ActivatedRoute } from '@angular/router';
// import { Subscription } from 'rxjs';
// import {
//   CollaboratorRecommendation,
//   MatchLevel,
//   RecommenderEvaluation,
// } from '../../models/collaborator-recommendation.model';
// import { CollaboratorRecommendationService } from '../../services/collaborator-recommendation.service';
// import { MainComponent } from '../../shared/layouts/main/main.component';

// type ViewState = 'loading' | 'ready' | 'empty' | 'not_ready' | 'error';

// @Component({
//   selector: 'app-collaborator-recommendation',
//   standalone: false,
//   templateUrl: './collaborator-recommendation.component.html',
//   styleUrl: './collaborator-recommendation.component.css',
// })
// export class CollaboratorRecommendationComponent implements OnInit, OnDestroy {
//   /** Optional: when not passed in, the :id route param is used. */
//   @Input() researcherId?: number | null;
//   @Input() limit = 6;
//   /** Route of the researcher profile page; the researcher id is appended. */
//   @Input() profileRoute = '/researcher';

//   state: ViewState = 'loading';
//   items: CollaboratorRecommendation[] = [];
//   evaluation: RecommenderEvaluation | null = null;
//   showEvaluation = false;

//   readonly levelLabel: Record<MatchLevel, string> = {
//     high: 'เหมาะสมมาก',
//     medium: 'เหมาะสม',
//     low: 'น่าพิจารณา',
//   };

//   readonly levelClass: Record<MatchLevel, string> = {
//     high: 'bg-[#F2CB05] text-gray-900',
//     medium: 'bg-amber-100 text-amber-800',
//     low: 'bg-gray-100 text-gray-600',
//   };

//   private sub?: Subscription;
//   private routeSub?: Subscription;

//   constructor(
//     private service: CollaboratorRecommendationService,
//     private route: ActivatedRoute
//   ) {}

//   ngOnInit() {
//     MainComponent.showLoading();

//     this.routeSub = this.route.paramMap.subscribe((params) => {
//       const id = params.get('id');

//       if (id) {
//         this.researcherId = +id;
//       }

//       if (this.researcherId) {
//         this.loadRecommendations(this.researcherId);
//       } else {
//         this.items = [];
//         this.state = 'empty';
//         MainComponent.hideLoading();
//       }
//     });
//   }

//   ngOnDestroy(): void {
//     this.sub?.unsubscribe();
//     this.routeSub?.unsubscribe();
//     MainComponent.hideLoading();
//   }

//   loadRecommendations(researcherId: number): void {
//     this.sub?.unsubscribe();
//     this.state = 'loading';

//     this.sub = this.service.getRecommendations(researcherId, this.limit).subscribe({
//       next: (res) => {
//         this.items = res.data ?? [];
//         this.evaluation = res.meta?.evaluation ?? null;
//         if (res.meta?.status === 'not_ready') {
//           this.state = 'not_ready';
//         } else {
//           this.state = this.items.length ? 'ready' : 'empty';
//         }
//         MainComponent.hideLoading();
//       },
//       error: (err) => {
//         console.error('[CollaboratorRecommendation]', err);
//         this.items = [];
//         this.state = 'error';
//         MainComponent.hideLoading();
//       },
//     });
//   }

//   /** Used by the "ลองอีกครั้ง" button. */
//   load(): void {
//     if (this.researcherId) {
//       MainComponent.showLoading();
//       this.loadRecommendations(this.researcherId);
//     }
//   }

//   percent(value: number | undefined): string {
//     return `${Math.round((value ?? 0) * 100)}%`;
//   }

//   thaiDate(value: string): string {
//     const date = new Date((value || '').replace(' ', 'T'));
//     return isNaN(date.getTime())
//       ? ''
//       : date.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
//   }

//   initials(name: string): string {
//     return (name || '?').trim().charAt(0);
//   }

//   onImageError(event: Event): void {
//     (event.target as HTMLImageElement).style.display = 'none';
//   }

//   trackById(_: number, item: CollaboratorRecommendation): number {
//     return item.id;
//   }
// }
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import {
  CollaboratorRecommendation,
  MatchLevel,
  RecommenderEvaluation,
  RecommenderMetrics,
} from '../../models/collaborator-recommendation.model';
import { CollaboratorRecommendationService } from '../../services/collaborator-recommendation.service';
import { MainComponent } from '../../shared/layouts/main/main.component';

type ViewState = 'loading' | 'ready' | 'empty' | 'not_ready' | 'error';
type LevelFilter = 'all' | MatchLevel;
type MethodKey = 'model' | 'popularity' | 'random';
type MetricKey = 'hit_rate' | 'ndcg' | 'recall';
type ScoreKey = 'content' | 'network' | 'activity';

@Component({
  selector: 'app-collaborator-recommendation',
  standalone: false,
  templateUrl: './collaborator-recommendation.component.html',
  styleUrl: './collaborator-recommendation.component.css',
})
export class CollaboratorRecommendationComponent implements OnInit, OnDestroy {
  /** Optional: when not passed in, the :id route param is used (if any). */
  @Input() researcherId?: number | null;
  @Input() limit = 6;
  /** Route of the researcher profile page; the researcher id is appended. */
  @Input() profileRoute = '/researcher';

  state: ViewState = 'loading';
  items: CollaboratorRecommendation[] = [];
  evaluation: RecommenderEvaluation | null = null;
  showEvaluation = false;
  activeLevel: LevelFilter = 'all';

  readonly levelLabel: Record<MatchLevel, string> = {
    high: 'เหมาะสมมาก',
    medium: 'เหมาะสม',
    low: 'น่าพิจารณา',
  };

  readonly levelClass: Record<MatchLevel, string> = {
    high: 'bg-[#F2CB05] text-gray-900',
    medium: 'bg-amber-100 text-amber-800',
    low: 'bg-gray-100 text-gray-600',
  };

  readonly filters: { key: LevelFilter; label: string }[] = [
    { key: 'all', label: 'ทั้งหมด' },
    { key: 'high', label: 'เหมาะสมมาก' },
    { key: 'medium', label: 'เหมาะสม' },
    { key: 'low', label: 'น่าพิจารณา' },
  ];

  readonly scoreParts: { key: ScoreKey; label: string }[] = [
    { key: 'content', label: 'ความเชี่ยวชาญตรงกัน' },
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
  private routeSub?: Subscription;

  constructor(
    private service: CollaboratorRecommendationService,
    private route: ActivatedRoute,
    private location: Location
  ) {}

  ngOnInit() {
    MainComponent.showLoading();

    this.routeSub = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.researcherId = +id;
      }
      // Mock mode: load even without an id.
      this.loadRecommendations();
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.routeSub?.unsubscribe();
    MainComponent.hideLoading();
  }

  get filteredItems(): CollaboratorRecommendation[] {
    return this.activeLevel === 'all'
      ? this.items
      : this.items.filter((r) => r.level === this.activeLevel);
  }

  countBy(level: LevelFilter): number {
    return level === 'all' ? this.items.length : this.items.filter((r) => r.level === level).length;
  }

  metricValue(method: MethodKey, metric: MetricKey): number {
    if (!this.evaluation) {
      return 0;
    }
    const source: RecommenderMetrics =
      method === 'model' ? this.evaluation.metrics : this.evaluation.baselines[method];
    return source?.[metric] ?? 0;
  }

  loadRecommendations(): void {
    this.sub?.unsubscribe();
    this.state = 'loading';
    this.activeLevel = 'all';

    this.sub = this.service.getRecommendations(this.researcherId, this.limit).subscribe({
      next: (res) => {
        this.items = res.data ?? [];
        this.evaluation = res.meta?.evaluation ?? null;
        if (res.meta?.status === 'not_ready') {
          this.state = 'not_ready';
        } else {
          this.state = this.items.length ? 'ready' : 'empty';
        }
        MainComponent.hideLoading();
      },
      error: (err) => {
        console.error('[CollaboratorRecommendation]', err);
        this.items = [];
        this.state = 'error';
        MainComponent.hideLoading();
      },
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

  percent(value: number | undefined): string {
    return `${Math.round((value ?? 0) * 100)}%`;
  }

  thaiDate(value: string): string {
    const date = new Date((value || '').replace(' ', 'T'));
    return isNaN(date.getTime())
      ? ''
      : date.toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  initials(name: string): string {
    return (name || '?').trim().charAt(0);
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).style.display = 'none';
  }

  trackById(_: number, item: CollaboratorRecommendation): number {
    return item.id;
  }
}