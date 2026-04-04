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

  getDocuments() {
    return this.http.get<DocumentResponse>(`${this.baseUrl}/m/doc/list`);
  }

  // Public
  getDocumentsPublic() {
    return this.http.get<DocumentResponse>(`${this.baseUrl}/public/document/list`);
  }

  downloadDocument(id: number) {
    return this.http.post(`${this.baseUrl}/public/document/${id}/count`, this.spoof('PATCH'), {});
  }

  createDocument(data: FormData) {
    return this.http.post(`${this.baseUrl}/m/doc/create`, data);
  }

  updateDocument(id: number, data: any) {
    return this.http.post(`${this.baseUrl}/m/doc/${id}/update`, data);
  }

  deleteDocument(id: number) {
    return this.http.post(`${this.baseUrl}/m/doc/${id}/delete`, this.spoof('DELETE'));
  }
}