import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiOecdTree, ApiResponse } from '../models/admin-grants.model';
import { GrantFilterOptions } from '../models/grant-filter.model';
import { ApiGrantDetail, ApiGrantListData, GrantQuery } from '../models/grants.model';

@Injectable({
  providedIn: 'root',
})
export class UserGratsService {
  readonly url = `${environment.apiBaseUrl}/v1/extreme`;

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

  /** ตัวเลือกสำหรับค้นหาทุน (sorts, views, funder_types, trl, budget, oecd, funders) */
  getFilterOptions(): Observable<ApiResponse<GrantFilterOptions>> {
    return this.http.get<ApiResponse<GrantFilterOptions>>(
      `${this.url}/grants/filter-options`
    );
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
    return this.http.get<ApiResponse<ApiOecdTree>>(`${this.url}/research/oecd`);
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