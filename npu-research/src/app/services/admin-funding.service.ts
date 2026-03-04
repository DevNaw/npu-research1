import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { FundingResponse } from "../models/admin-funding.model";

@Injectable({
  providedIn: 'root',
})
export class AdminFundingService {
    private readonly baseUrl = `${environment.apiBaseUrl}/v1/extreme`;

    constructor(private http: HttpClient) {}

    getFunding() {
    return this.http.get<FundingResponse>(`${this.baseUrl}/m/external-fundings/list`);
  }

  createFunding(data: any) {
    return this.http.post(`${this.baseUrl}/m/external-fundings/create`, data);
  }

  updateFunding(id: number, data: any) {
    return this.http.patch(`${this.baseUrl}/m/external-fundings/${id}/update`, data);
  }

  deleteFunding(id: number) {
    return this.http.delete(`${this.baseUrl}/m/external-fundings/${id}/delete`);
  }
}