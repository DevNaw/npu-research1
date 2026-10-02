// import { HttpClient, HttpParams } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Observable, of } from 'rxjs';
// import { delay } from 'rxjs/operators';
// import { environment } from '../../environments/environment';
// import { CollaboratorRecommendationResponse } from '../models/collaborator-recommendation.model';
// import { buildMockResponse } from '../models/Collaborator recommendation.mock';

// @Injectable({ providedIn: 'root' })
// export class CollaboratorRecommendationService {
//   /** Set to false once the API endpoint is available. */
//   private readonly useMock = true;
//   private readonly baseUrl = environment.apiBaseUrl;

//   constructor(private http: HttpClient) {}

//   getRecommendations(researcherId: number, limit = 6): Observable<CollaboratorRecommendationResponse> {
//     if (this.useMock) {
//       // Small delay so the loading skeleton is visible, like a real request.
//       return of(buildMockResponse(researcherId, limit)).pipe(delay(600));
//     }

//     const params = new HttpParams().set('limit', limit);
//     return this.http.get<CollaboratorRecommendationResponse>(
//       `${this.baseUrl}/researchers/${researcherId}/collaborator-recommendations`,
//       { params }
//     );
//   }
// }

import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  CollaboratorRecommendation,
  CollaboratorRecommendationResponse,
  RecommenderEvaluation,
} from '../models/collaborator-recommendation.model';

// ---------------- MOCK DATA (remove when the API is ready) ----------------
const MOCK_RECOMMENDATIONS: CollaboratorRecommendation[] = [
  {
    id: 101,
    name: 'ผศ.ดร.ธนพล ศรีวงศ์',
    position: 'ผู้ช่วยศาสตราจารย์',
    department: 'คณะวิศวกรรมศาสตร์',
    photo_url: null,
    score: 0.62,
    level: 'high',
    components: { content: 0.71, network: 0.55, activity: 0.38 },
    reasons: {
      shared_topics: ['เครือข่ายเซ็นเซอร์ไร้สาย', 'โพรโทคอล CoAP'],
      mutual_collaborators: 2,
      recent_works: 6,
    },
  },
  {
    id: 102,
    name: 'ดร.พิมพ์ชนก แก้วประเสริฐ',
    position: 'อาจารย์',
    department: 'คณะเทคโนโลยีอุตสาหกรรม',
    photo_url: null,
    score: 0.51,
    level: 'high',
    components: { content: 0.64, network: 0.2, activity: 0.45 },
    reasons: {
      shared_topics: ['การสื่อสารไร้สาย', 'อินเทอร์เน็ตของสรรพสิ่ง'],
      mutual_collaborators: 1,
      recent_works: 4,
    },
  },
  {
    id: 103,
    name: 'ผศ.วรวุฒิ ทองมา',
    position: 'ผู้ช่วยศาสตราจารย์',
    department: 'คณะวิทยาศาสตร์',
    photo_url: null,
    score: 0.39,
    level: 'medium',
    components: { content: 0.48, network: 0, activity: 0.6 },
    reasons: {
      shared_topics: ['การเข้ารหัสลับ', 'ความมั่นคงปลอดภัยสารสนเทศ'],
      mutual_collaborators: 0,
      recent_works: 8,
    },
  },
  {
    id: 104,
    name: 'ดร.สุนิสา บุญเรือง',
    position: 'อาจารย์',
    department: 'สถาบันวิจัยและพัฒนา',
    photo_url: null,
    score: 0.33,
    level: 'medium',
    components: { content: 0.36, network: 0.4, activity: 0.2 },
    reasons: {
      shared_topics: ['การพยากรณ์วาตภัย'],
      mutual_collaborators: 3,
      recent_works: 2,
    },
  },
  {
    id: 105,
    name: 'อ.กิตติศักดิ์ พลเยี่ยม',
    position: 'อาจารย์',
    department: 'คณะเกษตรและเทคโนโลยี',
    photo_url: null,
    score: 0.22,
    level: 'low',
    components: { content: 0.27, network: 0, activity: 0.3 },
    reasons: {
      shared_topics: ['ระบบโทรมาตรขนาดเล็ก'],
      mutual_collaborators: 0,
      recent_works: 3,
    },
  },
  {
    id: 106,
    name: 'ดร.อรอุมา จันทร์สว่าง',
    position: 'อาจารย์',
    department: 'คณะครุศาสตร์',
    photo_url: null,
    score: 0.18,
    level: 'low',
    components: { content: 0.2, network: 0.15, activity: 0.1 },
    reasons: {
      shared_topics: ['การเรียนรู้ของเครื่อง'],
      mutual_collaborators: 1,
      recent_works: 1,
    },
  },
];

const MOCK_EVALUATION: RecommenderEvaluation = {
  evaluated_at: '2026-10-01 02:00:00',
  strategy: 'holdout',
  k: 10,
  test_users: 85,
  passed: true,
  metrics: { precision: 0.14, recall: 0.68, hit_rate: 0.85, ndcg: 0.37, mrr: 0.31, coverage: 0.98 },
  baselines: {
    popularity: { precision: 0.01, recall: 0.04, hit_rate: 0.07, ndcg: 0.02, mrr: 0.02 },
    random: { precision: 0.01, recall: 0.06, hit_rate: 0.12, ndcg: 0.03, mrr: 0.03 },
  },
};
// ---------------------------------------------------------------------------

@Injectable({ providedIn: 'root' })
export class CollaboratorRecommendationService {
  /** Set to false once the API endpoint is available. */
  private readonly useMock = true;
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getRecommendations(researcherId?: number | null, limit = 6): Observable<CollaboratorRecommendationResponse> {
    if (this.useMock) {
      const data = MOCK_RECOMMENDATIONS.filter((r) => r.id !== researcherId).slice(0, limit);
      // Small delay so the loading state behaves like a real request.
      return of({ data, meta: { status: 'ready' as const, evaluation: MOCK_EVALUATION } }).pipe(delay(600));
    }

    const params = new HttpParams().set('limit', limit);
    return this.http.get<CollaboratorRecommendationResponse>(
      `${this.baseUrl}/researchers/${researcherId}/collaborator-recommendations`,
      { params }
    );
  }
}