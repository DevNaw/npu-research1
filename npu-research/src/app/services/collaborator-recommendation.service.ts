import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import {
  ApiResponse,
  CollaboratorRecommendationResponse,
  MatchLevel,
  RecalculateOutcome,
  RecalculateResult,
} from '../models/collaborator-recommendation.model';

@Injectable({ providedIn: 'root' })
export class CollaboratorRecommendationService {
  private readonly baseUrl = `${environment.apiBaseUrl}/v1/extreme/collaborator-recommendations`;

  constructor(private http: HttpClient) {}

  /** level = null → ทุกระดับ (ตรวจชื่อ query param ให้ตรงกับฝั่ง Laravel) */
  getRecommendations(level?: MatchLevel | null): Observable<CollaboratorRecommendationResponse> {
    let params = new HttpParams();
    if (level) {
      params = params.set('level', level);
    }
    return this.http.get<CollaboratorRecommendationResponse>(this.baseUrl, { params });
  }

  /**
   * สั่งอัปเดตผู้ร่วมวิจัยที่แนะนำ (ยิงครั้งเดียว ไม่ poll)
   * - 202 → รับคำสั่งแล้ว คำนวณอยู่เบื้องหลัง
   * - 409 → มีการอัปเดตรันอยู่แล้ว (ถ้าหลังบ้านล็อกไว้) ถือว่ารับคำสั่งเหมือนกัน
   * - 200 → คำนวณเสร็จในคำขอเดียว พร้อมตัวเลขสรุป
   */
  recalculate(): Observable<RecalculateOutcome> {
    return this.http
      .post<ApiResponse<RecalculateResult | null>>(`${this.baseUrl}/recalculate`, {}, { observe: 'response' })
      .pipe(
        map((res: HttpResponse<ApiResponse<RecalculateResult | null>>) => {
          const body = res.body;
          if (body && body.result !== 1) {
            throw new Error(body.message || 'สั่งอัปเดตไม่สำเร็จ');
          }
          const accepted = res.status === 202;
          return {
            accepted,
            result: accepted ? null : body?.data ?? null,
            message: body?.message ?? null,
          };
        }),
        catchError((err: unknown) => {
          if (err instanceof HttpErrorResponse && err.status === 409) {
            return of<RecalculateOutcome>({
              accepted: true,
              result: null,
              message: err.error?.message ?? null,
            });
          }
          return throwError(() => err);
        })
      );
  }
}