import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { DashboardResponse } from "../models/report.model";

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private readonly baseUrl = `${environment.apiBaseUrl}/v1/extreme`;

  constructor(private http: HttpClient) { }

  getData() {
    return this.http.get<DashboardResponse>(`${this.baseUrl}/report/for-admin`);
  }
}
