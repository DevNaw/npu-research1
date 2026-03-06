import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { FundingResponse } from "../models/admin-funding.model";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class FundingService {
    private readonly baseUrl = `${environment.apiBaseUrl}/v1/extreme`;

    constructor(private http: HttpClient) {}

    getFundings(): Observable<FundingResponse> {
        return this.http.get<FundingResponse>(`${this.baseUrl}/research/external-funding`);
      }
}