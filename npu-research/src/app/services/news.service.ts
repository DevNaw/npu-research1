import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { NewsResponse } from "../models/news.model";
import { Observable } from "rxjs";
import { NewsDetailResponse } from "../models/news-detail.model";

@Injectable({
    providedIn: 'root'
})

export class NewsService {
    private readonly baseUrl = `${environment.apiBaseUrl}`

    constructor(
        private http: HttpClient
    ) {}

    getNewsData(): Observable<NewsResponse> {
        return this.http.get<NewsResponse>(`${this.baseUrl}/v1/extreme/public/news/list`);
      }

      getNewsDetail(id: number) {
        return this.http.get<NewsDetailResponse>(
          `${this.baseUrl}/v1/extreme/public/news/${id}`
        );
      }
}