import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { OecdResponse } from '../models/search-get.model';
import {
  SearchResearchRequest,
  SummaryBySubjectResponse,
} from '../models/search.model';
import { ResearcherSearchResponse } from '../models/search-researchers.model';
import { ResearchInitResponse } from '../models/get-researcher.model';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
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

  getData(): Observable<OecdResponse> {
    return this.http.get<OecdResponse>(`${this.apiUrl}/search/innit`);
  }

  searchData(data: SearchResearchRequest) {
    return this.http.post<SummaryBySubjectResponse>(
      `${this.apiUrl}/search/research`,
      this.spoof('PUT', data)
    );
  }

  // ค้นหานักวิจัย
  searchResearchers(data: any) {
    return this.http.post<ResearcherSearchResponse>(
      `${this.apiUrl}/search/researcher`,
      this.spoof('PUT', data)
    );
  }

  getResearchers() {
    return this.http.get<ResearchInitResponse>(`${this.apiUrl}/search/innitR`);
  }
}
