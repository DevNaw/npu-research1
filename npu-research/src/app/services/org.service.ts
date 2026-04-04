import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { OrganizationResponse } from "../models/org.model";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class OrgService {
    private baseUrl = `${environment.apiBaseUrl}/v1/extreme`;

  constructor(private http: HttpClient) { }

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

  getOrganizations(): Observable<OrganizationResponse> {
    return this.http.get<OrganizationResponse>(
      `${this.baseUrl}/m/organizations/list`
    );
  }
  createOrganization(data: any) {
    return this.http.post(`${this.baseUrl}/m/organizations/create`, data);
  }

  updateOrganization(id: number, data: any) {
    return this.http.post(`${this.baseUrl}/m/organizations/${id}/update`, this.spoof('PATCH', data));
  }

  deleteOrganization(id: number) {
    return this.http.post(`${this.baseUrl}/m/organizations/${id}/delete`, this.spoof('DELETE'));
  }
}
