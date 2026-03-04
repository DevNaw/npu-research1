import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { NewsDetailResponse, NewsListResponse } from '../models/admin-news.model';

@Injectable({
  providedIn: 'root',
})
export class AdminNewsService {
  private readonly baseUrl = `${environment.apiBaseUrl}/v1/extreme`;

  constructor(private http: HttpClient) {}

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
    return this.http.delete(`${this.baseUrl}/m/news/${id}/delete`);
  }

  deleteImage(id: number) {
    return this.http.delete(`${this.baseUrl}/m/news/${id}/photo-news`);
  }
}
