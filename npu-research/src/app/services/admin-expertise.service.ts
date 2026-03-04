import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { ExpertiseResponse } from "../models/admin-expertise.model";

@Injectable({
  providedIn: 'root'
})
export class AdminExpertiseService {
    private readonly baseUrl = `${environment.apiBaseUrl}/v1/extreme`;

  constructor(private http: HttpClient) {}

  getExpertise() {
    return this.http.get<ExpertiseResponse>(`${this.baseUrl}/m/expertises/list`);
  }

  createExpertise(data: any) {
    return this.http.post(`${this.baseUrl}/m/expertises/create`, data);
  }

  updateExpertise(id: number, data: any) {
    return this.http.patch(
      `${this.baseUrl}/m/expertises/${id}/update`,
      data
    );
  }

  deleteExpertise(id: number) {
    return this.http.delete(`${this.baseUrl}/m/expertises/${id}/delete`);
  }
}
