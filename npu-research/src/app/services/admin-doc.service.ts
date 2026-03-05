import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { DocumentResponse } from "../models/admin-document.model";

@Injectable({
  providedIn: 'root',
})
export class AdminDocService {
    private readonly baseUrl = `${environment.apiBaseUrl}/v1/extreme`;

    constructor(private http: HttpClient) {}

  getDocuments() {
    return this.http.get<DocumentResponse>(`${this.baseUrl}/m/doc/list`);
  }

  // Public
  getDocumentsPublic() {
    return this.http.get<DocumentResponse>(`${this.baseUrl}/public/document/list`);
  }

  downloadDocument(id: number) {
    return this.http.patch(`${this.baseUrl}/public/document/${id}/count`, {});
  }

  createDocument(data: FormData) {
    return this.http.post(`${this.baseUrl}/m/doc/create`, data);
  }

  updateDocument(id: number, data: any) {
    return this.http.post(`${this.baseUrl}/m/doc/${id}/update`, data);
  }

  deleteDocument(id: number) {
    return this.http.delete(`${this.baseUrl}/m/doc/${id}/delete`);
  }
}