import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { DashboardResponse } from "../models/dashboard-main.model";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
    private readonly baseUrl = `${environment.apiBaseUrl}/v1/extreme`;
  constructor(private http: HttpClient) { }

    getDashboardData(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.baseUrl}/dashboard/get-data`);
  }
}
