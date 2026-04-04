import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { OECDResponse } from '../models/oecd.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OECDService {
  private readonly baseUrl = `${environment.apiBaseUrl}/v1/extreme`;

  constructor(private http: HttpClient) {}

  // ===== Helper =====
  private spoof(method: 'PUT' | 'PATCH' | 'DELETE', data?: any): FormData {
    const fd = new FormData();
    fd.append('_method', method);

    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        fd.append(key, value as string);
      });
    }

    return fd;
  }

  getOECD(): Observable<OECDResponse> {
    return this.http.get<OECDResponse>(`${this.baseUrl}/m/oecd/list`);
  }

  createOECD(data: any) {
    return this.http.post(`${this.baseUrl}/m/oecd/create`, data);
  }

  updateOECD(id: number, data: any) {
    return this.http.post(
      `${this.baseUrl}/m/oecd/${id}/update`,
      this.spoof('PATCH', data)
    );
  }

  deleteOECD(id: number, password: string) {
    return this.http.post(
      `${this.baseUrl}/m/oecd/${id}/delete`,
      this.spoof('DELETE', {
        body: {
          password,
        },
      })
    );
  }
}
