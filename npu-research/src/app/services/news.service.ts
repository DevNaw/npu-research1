import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { NewsResponse } from "../models/news.model";
import { Observable } from "rxjs";

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
}