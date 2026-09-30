import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ApiFunderDetail,
  ApiFunderList,
  ApiFunderOption,
  ApiGrantDetail,
  ApiGrantList,
  ApiGrantStatistics,
  ApiOecdTree,
  ApiResponse,
  FunderListQuery,
  FunderPayload,
  GrantListQuery,
  GrantPayload,
} from '../models/admin-grants.model';

@Injectable({
  providedIn: 'root',
})
export class AdminGrantsService {
  private readonly baseUrl = `${environment.apiBaseUrl}/v1/extreme`;

  constructor(private http: HttpClient) {}

  /**
   * Laravel method spoofing: ส่งเป็น POST + _method แทน PUT/PATCH/DELETE
   * แปลง payload เป็น FormData แบบที่ Laravel อ่านเป็น array/object ได้
   */
  private spoof(method: 'PUT' | 'PATCH' | 'DELETE', data?: object): FormData {
    const fd = new FormData();
    fd.append('_method', method);
    if (data) {
      Object.entries(data).forEach(([key, value]) =>
        this.appendFormData(fd, key, value)
      );
    }
    return fd;
  }

  /**
   * - null / undefined / [] -> '' (ConvertEmptyStringsToNull ของ Laravel แปลงเป็น null)
   * - boolean -> '1' / '0' (ผ่าน rule boolean)
   * - array -> key[0], key[1], ...
   * - object -> key[field]
   * - File / Blob -> แนบไฟล์ตรงๆ
   */
  private appendFormData(fd: FormData, key: string, value: unknown): void {
    if (value === null || value === undefined) {
      fd.append(key, '');
    } else if (value instanceof Blob) {
      fd.append(key, value);
    } else if (typeof value === 'boolean') {
      fd.append(key, value ? '1' : '0');
    } else if (Array.isArray(value)) {
      if (value.length === 0) fd.append(key, '');
      else
        value.forEach((item, i) =>
          this.appendFormData(fd, `${key}[${i}]`, item)
        );
    } else if (typeof value === 'object') {
      Object.entries(value as Record<string, unknown>).forEach(([k, v]) =>
        this.appendFormData(fd, `${key}[${k}]`, v)
      );
    } else {
      fd.append(key, String(value));
    }
  }

  private toParams(query: object): HttpParams {
    let params = new HttpParams();
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });
    return params;
  }

  // ===== Grants =====
  getGrants(query: GrantListQuery = {}): Observable<ApiResponse<ApiGrantList>> {
    return this.http.get<ApiResponse<ApiGrantList>>(
      `${this.baseUrl}/admin/grants`,
      {
        params: this.toParams(query),
      }
    );
  }

  getGrant(id: number): Observable<ApiResponse<ApiGrantDetail>> {
    return this.http.get<ApiResponse<ApiGrantDetail>>(
      `${this.baseUrl}/admin/grants/${id}`
    );
  }

  createGrant(data: GrantPayload): Observable<ApiResponse<ApiGrantDetail>> {
    return this.http.post<ApiResponse<ApiGrantDetail>>(
      `${this.baseUrl}/admin/grants`,
      data
    );
  }

  updateGrant(
    id: number,
    data: GrantPayload
  ): Observable<ApiResponse<ApiGrantDetail>> {
    return this.http.post<ApiResponse<ApiGrantDetail>>(
      `${this.baseUrl}/admin/grants/${id}`,
      this.spoof('PUT', data)
    );
  }

  deleteGrant(id: number): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.baseUrl}/admin/grants/${id}`,
      this.spoof('DELETE')
    );
  }

  publishGrant(id: number): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.baseUrl}/admin/grants/${id}/publish`,
      {}
    );
  }

  unpublishGrant(id: number): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.baseUrl}/admin/grants/${id}/unpublish`,
      {}
    );
  }

  getGrantStatistics(): Observable<ApiResponse<ApiGrantStatistics>> {
    return this.http.get<ApiResponse<ApiGrantStatistics>>(
      `${this.baseUrl}/admin/grants/statistics`
    );
  }

  // ===== Funders =====
  getFunderOptions(): Observable<ApiResponse<ApiFunderOption[]>> {
    return this.http.get<ApiResponse<ApiFunderOption[]>>(
      `${this.baseUrl}/admin/grant-funders/options`
    );
  }

  getFunders(
    query: FunderListQuery = {}
  ): Observable<ApiResponse<ApiFunderList>> {
    return this.http.get<ApiResponse<ApiFunderList>>(
      `${this.baseUrl}/admin/grant-funders`,
      {
        params: this.toParams(query),
      }
    );
  }

  getFunder(id: number): Observable<ApiResponse<ApiFunderDetail>> {
    return this.http.get<ApiResponse<ApiFunderDetail>>(
      `${this.baseUrl}/admin/grant-funders/${id}`
    );
  }

  createFunder(data: FunderPayload): Observable<ApiResponse<ApiFunderDetail>> {
    return this.http.post<ApiResponse<ApiFunderDetail>>(
      `${this.baseUrl}/admin/grant-funders`,
      data
    );
  }

  updateFunder(
    id: number,
    data: FunderPayload
  ): Observable<ApiResponse<ApiFunderDetail>> {
    return this.http.post<ApiResponse<ApiFunderDetail>>(
      `${this.baseUrl}/admin/grant-funders/${id}`,
      this.spoof('PUT', data)
    );
  }

  deleteFunder(id: number): Observable<ApiResponse<unknown>> {
    return this.http.post<ApiResponse<unknown>>(
      `${this.baseUrl}/admin/grant-funders/${id}`,
      this.spoof('DELETE')
    );
  }

  // ===== OECD =====
  getOecdCategories(): Observable<ApiResponse<ApiOecdTree>> {
    return this.http.get<ApiResponse<ApiOecdTree>>(
      `${this.baseUrl}/research/oecd`
    );
  }
}
