import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { WorkResponse } from '../models/work.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkService {
  private apiUrl = `${environment.apiBaseUrl}/v1/extreme`;

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

  getWorkInfo(): Observable<WorkResponse> {
    return this.http.get<WorkResponse>(`${this.apiUrl}/user/infomation/work-for-update`);
  }

  updateWork(data: any) {
    return this.http.post(`${this.apiUrl}/user/infomation/work`, this.spoof('PATCH', data));
  }
}
