import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { ExpertiseResponse } from '../models/admin-expertise.model';

@Injectable({
  providedIn: 'root',
})
export class AdminExpertiseService {
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

  getExpertise() {
    return this.http.get<ExpertiseResponse>(
      `${this.baseUrl}/m/expertises/list`
    );
  }

  createExpertise(data: any) {
    return this.http.post(`${this.baseUrl}/m/expertises/create`, data);
  }

  updateExpertise(id: number, data: any) {
    return this.http.post(`${this.baseUrl}/m/expertises/${id}/update`, this.spoof('PATCH', data));
  }

  deleteExpertise(id: number) {
    return this.http.post(`${this.baseUrl}/m/expertises/${id}/delete`, this.spoof('DELETE'));
  }
}
