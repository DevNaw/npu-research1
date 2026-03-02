import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { SubjectAreaResponse } from '../models/search-get.model';
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

  getData(): Observable<SubjectAreaResponse> {
    return this.http.get<SubjectAreaResponse>(`${this.apiUrl}/search/innit`);
  }

  searchData(data: SearchResearchRequest) {
    return this.http.put<SummaryBySubjectResponse>(
      `${this.apiUrl}/search/research`,
      data
    );
  }

  // ค้นหานักวิจัย
  searchResearchers(data: any) {
    return this.http.put<ResearcherSearchResponse>(
      `${this.apiUrl}/search/researcher`,
      data
    );
  }

  getResearchers() {
    return this.http.get<ResearchInitResponse>(`${this.apiUrl}/search/innitR`);
  }
}
