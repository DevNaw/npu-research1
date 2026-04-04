import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminResponse } from '../models/management-admin.model';
import { UsersResponse } from '../models/management-user.model';

@Injectable({
  providedIn: 'root',
})
export class ManagementService {
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

  getAdmins(): Observable<AdminResponse> {
    return this.http.get<AdminResponse>(`${this.baseUrl}/admin/user`);
  }

  createAdmin(data: any) {
    return this.http.post(`${this.baseUrl}/admin/user/create`, data);
  }

  updateAdmin(id: number, data: any) {
    return this.http.post(`${this.baseUrl}/admin/user/update/${id}`, this.spoof('PATCH', data));
  }

  deleteAdmin(id: number) {
    return this.http.post(`${this.baseUrl}/admin/user/delete/${id}`, this.spoof('DELETE'));
  }

  //   Management User
  getUsers(): Observable<UsersResponse> {
    return this.http.get<UsersResponse>(`${this.baseUrl}/m/user-system/list`);
  }

  createUser(data: any) {
    return this.http.post(`${this.baseUrl}/m/user-system/add-user`, data);
  }

  updatePassword(id: number, data: any) {
    return this.http.post(
      `${this.baseUrl}/m/user-system/${id}/reset-password`,
      this.spoof('PATCH', data)
    );
  }

  deleteUser(id: number) {
    return this.http.post(`${this.baseUrl}/m/user-system/${id}/delete`, this.spoof('DELETE'));
  }
}
