import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  NewsDetailResponse,
  NewsListResponse,
} from '../models/admin-news.model';

@Injectable({
  providedIn: 'root',
})
export class AdminNewsService {
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

  getNews() {
    return this.http.get<NewsListResponse>(`${this.baseUrl}/m/news/list`);
  }

  getnewsById(id: number) {
    return this.http.get<NewsDetailResponse>(`${this.baseUrl}/m/news/${id}`);
  }

  createNews(data: any) {
    return this.http.post(`${this.baseUrl}/m/news/create`, data);
  }

  updateNews(id: number, data: any) {
    return this.http.post(`${this.baseUrl}/m/news/${id}/update`, data);
  }

  deleteNews(id: number) {
    return this.http.post(`${this.baseUrl}/m/news/${id}/delete`, this.spoof('DELETE'));
  }

  deleteImage(id: number) {
    return this.http.post(`${this.baseUrl}/m/news/${id}/photo-news`, this.spoof('DELETE'));
  }
}
