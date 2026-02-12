import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export type ResearchType = 'project' | 'article' | 'innovation';

export interface ResearchPayload {
  title: string;
  description: string;
  year: number;
  type: ResearchType;
}


@Injectable({
  providedIn: 'root',
})
export class ResearchService {
  private readonly baseUrl = `${environment.apiBaseUrl}/v1/extreme/research`;

  constructor(private http: HttpClient) {}

  // ✅ สร้าง research ทุกประเภท
  createResearch(data: ResearchPayload) {
    return this.http.post(this.baseUrl, data);
  }

  // ✅ ดึงทั้งหมด
  getResearch() {
    return this.http.get(this.baseUrl);
  }

  // ✅ ดึงตาม id
  getResearchById(id: number) {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  // ✅ อัปเดต
  updateResearch(id: number, data: ResearchPayload) {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  // ✅ ลบ
  deleteResearch(id: number) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
