import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { Observable } from "rxjs";
import { SubjectAreaResponse } from "../models/search-get.model";
import { SearchResearchRequest, SummaryBySubjectResponse } from "../models/search.model";

@Injectable({
    providedIn: 'root'
})

export class SearchService {
    private apiUrl = `${environment.apiBaseUrl}/v1/extreme`;

    constructor(
        private http: HttpClient,
    ) {}

    getData(): Observable<SubjectAreaResponse> {
        return this.http.get<SubjectAreaResponse>(`${this.apiUrl}/search/innit`);
    }

    searchData(data: SearchResearchRequest) {
        return this.http.put<SummaryBySubjectResponse>(
          `${this.apiUrl}/search/research`,
          data
        );
      }
}