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
        this.appendField(fd, key, value);
      });
    }

    return fd;
  }

  private appendField(fd: FormData, key: string, value: any): void {
    if (value === null || value === undefined) return;

    if (Array.isArray(value)) {
      // array → expertises[]=a, expertises[]=b
      value.forEach((item) => this.appendField(fd, `${key}[]`, item));
      return;
    }

    if (value instanceof File || value instanceof Blob) {
      fd.append(key, value);
      return;
    }

    if (value instanceof Date) {
      fd.append(key, value.toISOString());
      return;
    }

    if (typeof value === 'object') {
      // nested object → organization[id]=1, organization[faculty]=...
      Object.entries(value).forEach(([k, v]) =>
        this.appendField(fd, `${key}[${k}]`, v)
      );
      return;
    }

    fd.append(key, String(value));
  }

  getWorkInfo(): Observable<WorkResponse> {
    return this.http.get<WorkResponse>(
      `${this.apiUrl}/user/infomation/work-for-update`
    );
  }

  updateWork(data: any) {
    return this.http.post(
      `${this.apiUrl}/user/infomation/work`,
      this.spoof('PATCH', data)
    );
  }
}