import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { DashboardResponse, FacultyOecdResponse, FacultyOverviewResponse } from "../models/dashboard-main.model";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
    private readonly baseUrl = `${environment.apiBaseUrl}/v1/extreme`;
  constructor(private http: HttpClient) { }

    getDashboardData(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.baseUrl}/public/dashboard/get-data`);
  }

  getFacultyBreakdown(
    type: 'INNOVATION' | 'PROJECT' | 'ARTICLE'
  ): Observable<FacultyOverviewResponse> {
    return this.http.get<FacultyOverviewResponse>(
      `${this.baseUrl}/public/dashboard/faculty-overview?type=${type}`
    );
  }

  getMajorBreakdown(
    facultyId: number,
    type: 'INNOVATION' | 'PROJECT' | 'ARTICLE'
  ): Observable<FacultyOecdResponse> {
    return this.http.get<FacultyOecdResponse>(
      `${this.baseUrl}/public/dashboard/faculty/${facultyId}/oecd?type=${type}`
    );
  }
}
