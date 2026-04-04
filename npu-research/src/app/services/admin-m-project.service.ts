import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ResearchResponse } from '../models/admin-m-project.model';

@Injectable({
  providedIn: 'root',
})
export class AdminMProjectService {
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

  getProject() {
    return this.http.get<ResearchResponse>(
      `${this.baseUrl}/public/research/lists`
    );
  }

  deleteProject(id: number) {
    return this.http.post(`${this.baseUrl}/research/${id}`, this.spoof('DELETE'));
  }

  adminDelete(id: number) {
    return this.http.post(`${this.baseUrl}/m/research/${id}/delete-by-adm`, this.spoof('DELETE'));
  }
}
