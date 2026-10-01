import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { ApiOecdTree, ApiResponse } from '../models/admin-grants.model';
import { GrantFilterOptions } from '../models/grant-filter.model';
import {
  ApiGrantDetail,
  ApiGrantListData,
  GrantQuery,
} from '../models/grants.model';

export interface ApiMatchingRecalculate {
  calculated_grants: number;
  calculated_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserGratsService {
  readonly url = `${environment.apiBaseUrl}/v1/extreme`;

  // ===== Cache (อยู่ตลอด session ของแอป — ล้างด้วย clearCache()) =====
  private matchingRecalc$?: Observable<ApiResponse<ApiMatchingRecalculate> | null>;
  private filterOptions$?: Observable<ApiResponse<GrantFilterOptions>>;
  private oecd$?: Observable<ApiResponse<ApiOecdTree>>;

  constructor(private http: HttpClient) {}

  // ===== Grants =====
  getUserGrats(
    query: GrantQuery = {}
  ): Observable<ApiResponse<ApiGrantListData>> {
    return this.http.get<ApiResponse<ApiGrantListData>>(`${this.url}/grants`, {
      params: this.toParams(query),
    });
  }

  getUserGratsById(id: number): Observable<ApiResponse<ApiGrantDetail>> {
    return this.http.get<ApiResponse<ApiGrantDetail>>(
      `${this.url}/grants/${id}`
    );
  }

  /**
   * ตัวเลือกสำหรับค้นหาทุน (sorts, views, funder_types, trl, budget, oecd, funders)
   * cache ไว้ — เข้าหน้าทุนซ้ำไม่ต้องยิงใหม่ / ล้มเหลวจะล้าง cache ให้ลองใหม่รอบหน้า
   */
  getFilterOptions(): Observable<ApiResponse<GrantFilterOptions>> {
    if (!this.filterOptions$) {
      this.filterOptions$ = this.http
        .get<ApiResponse<GrantFilterOptions>>(
          `${this.url}/grants/filter-options`
        )
        .pipe(
          catchError((err) => {
            this.filterOptions$ = undefined;
            return throwError(() => err);
          }),
          shareReplay(1)
        );
    }
    return this.filterOptions$;
  }

  // ===== Saved =====
  /** POST /grants/{id}/save — บันทึกทุน (ต้อง login) */
  saveGrant(id: number): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.url}/grants/${id}/save`,
      {}
    );
  }

  /** DELETE /grants/{id}/save — เลิกบันทึกทุน (ต้อง login) */
  unsaveGrant(id: number): Observable<ApiResponse<unknown>> {
    return this.http.delete<ApiResponse<unknown>>(
      `${this.url}/grants/${id}/save`
    );
  }

  // ===== OECD (fallback เมื่อ filter-options ไม่มี oecd) =====
  getOecdCategories(): Observable<ApiResponse<ApiOecdTree>> {
    if (!this.oecd$) {
      this.oecd$ = this.http
        .get<ApiResponse<ApiOecdTree>>(`${this.url}/research/oecd`)
        .pipe(
          catchError((err) => {
            this.oecd$ = undefined;
            return throwError(() => err);
          }),
          shareReplay(1)
        );
    }
    return this.oecd$;
  }

  // ===== Matching =====
  /** ยิง recalculate ครั้งเดียวต่อ session ของแอป (ยิงซ้ำได้หลัง refresh หรือหลัง reset) */
  recalculateMatchingOnce(): Observable<ApiResponse<ApiMatchingRecalculate> | null> {
    if (!this.matchingRecalc$) {
      this.matchingRecalc$ = this.http
        .post<ApiResponse<ApiMatchingRecalculate>>(
          `${this.url}/grants/matching/recalculate`,
          {}
        )
        .pipe(
          catchError(() => {
            this.matchingRecalc$ = undefined; // ล้มเหลว -> รอบหน้าให้ลองใหม่
            return of(null);
          }),
          shareReplay(1)
        );
    }
    return this.matchingRecalc$;
  }

  /** เรียกตอนกดปุ่มคำนวณใหม่ (ล้างเฉพาะผล matching) */
  resetMatchingCache(): void {
    this.matchingRecalc$ = undefined;
  }

  /**
   * ล้าง cache ทั้งหมด — เรียกตอน login / logout / สลับผู้ใช้
   * (views และผล matching ขึ้นกับผู้ใช้ ห้ามใช้ข้ามคน)
   */
  clearCache(): void {
    this.matchingRecalc$ = undefined;
    this.filterOptions$ = undefined;
    this.oecd$ = undefined;
  }

  // ===== Helpers =====
  /** ตัดค่าว่าง / null / undefined ออก ไม่ส่งไปเป็น query */
  private toParams(query: GrantQuery): HttpParams {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value === null || value === undefined || value === '') return;
      params = params.set(key, String(value));
    });
    return params;
  }
}