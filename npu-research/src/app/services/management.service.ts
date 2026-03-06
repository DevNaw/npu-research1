import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { AdminResponse } from "../models/management-admin.model";
import { UsersResponse } from "../models/management-user.model";

@Injectable({
  providedIn: 'root',
})
export class ManagementService {
    private readonly baseUrl = `${environment.apiBaseUrl}/v1/extreme`;

  constructor(private http: HttpClient) { }

  getAdmins(): Observable<AdminResponse> {
    return this.http.get<AdminResponse>(`${this.baseUrl}/admin/user`);
  }

  createAdmin(data: any) {
    return this.http.post(`${this.baseUrl}/admin/user/create`, data);
  }

  updateAdmin(id: number, data: any) {
    return this.http.patch(`${this.baseUrl}/admin/user/update/${id}`, data);
  }

  deleteAdmin(id: number) {
    return this.http.delete(`${this.baseUrl}/admin/user/delete/${id}`);
  }

//   Management User
getUsers(): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(`${this.baseUrl}/m/user-system/list`);
  }

  updatePassword(id: number, data: any) {
    return this.http.patch(`${this.baseUrl}m/user-system/${id}/reset-password`, data);
  }

  deleteUser(id: number) {
    return this.http.delete(`${this.baseUrl}/m/user-system/${id}/delete`);
  }
}
