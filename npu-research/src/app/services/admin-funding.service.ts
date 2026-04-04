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

    getFunding() {
    return this.http.get<FundingResponse>(`${this.baseUrl}/m/external-fundings/list`);
  }

  createFunding(data: any) {
    return this.http.post(`${this.baseUrl}/m/external-fundings/create`, data);
  }

  updateFunding(id: number, data: any) {
    return this.http.post(`${this.baseUrl}/m/external-fundings/${id}/update`, this.spoof('PATCH', data));
  }

  deleteFunding(id: number) {
    return this.http.post(`${this.baseUrl}/m/external-fundings/${id}/delete`, this.spoof('DELETE'));
  }
}