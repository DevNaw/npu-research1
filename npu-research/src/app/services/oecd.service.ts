import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { OECDResponse } from "../models/oecd.model";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class OECDService {
    private readonly baseUrl = `${environment.apiBaseUrl}/v1/extreme`;

  constructor(private http: HttpClient) {}

  getOECD(): Observable<OECDResponse> {
    return this.http.get<OECDResponse>(`${this.baseUrl}/m/oecd/list`);
  }

  createOECD(data: any) {
    return this.http.post(`${this.baseUrl}/m/oecd/create`, data);
  }

  updateOECD(id: number, data: any) {
    return this.http.patch(`${this.baseUrl}/m/oecd/${id}/update`, data);
  }

  deleteOECD(id: number) {
    return this.http.delete(`${this.baseUrl}/m/oecd/${id}/delete`);
  }
}