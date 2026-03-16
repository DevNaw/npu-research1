import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { ManualResponse } from "../models/manual.model";

@Injectable({
  providedIn: 'root',
})
export class ManualService {
    private apiUrl = `${environment.apiBaseUrl}/v1/extreme`;

  constructor(private http: HttpClient) {}

  getDocuments() {
    return this.http.get<ManualResponse>(`${this.apiUrl}/m/manual/list`);
  }

  getDocumentsPublic() {
    return this.http.get<ManualResponse>(`${this.apiUrl}/public/manual/list`);
  }

  downloadDocument(id: number) {
    return this.http.patch(`${this.apiUrl}/public/manual/${id}/count`, {});
  }

  createDocument(formData: FormData) {
    return this.http.post(`${this.apiUrl}/m/manual/create`, formData);
  }

  updateDocument(id: number, formData: FormData) {
    return this.http.post(`${this.apiUrl}/m/manual/${id}/update`, formData);
  }

  deleteDocument(id: number) {
    return this.http.delete(`${this.apiUrl}/m/manual/${id}/delete`);
  }
}