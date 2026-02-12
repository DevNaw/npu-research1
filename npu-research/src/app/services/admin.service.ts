import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

export interface CreateAdminPayload {
  name: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateAdminPayload {
  name?: string;
  email?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private readonly baseUrl = `${environment.apiBaseUrl}/v1/extreme/admin/user`;

  constructor(private http: HttpClient) {}

  // ✅ ดึงผู้ใช้ทั้งหมด
  getUsers() {
    return this.http.get<AdminUser[]>(this.baseUrl);
  }

  // ✅ สร้าง admin
  createAdmin(data: CreateAdminPayload) {
    return this.http.post<{ message: string; user: AdminUser }>(
      this.baseUrl,
      data
    );
  }

  // ✅ อัปเดต
  updateUser(id: number, data: UpdateAdminPayload) {
    return this.http.put<{ message: string; user: AdminUser }>(
      `${this.baseUrl}/${id}`,
      data
    );
  }

  // ✅ ลบ
  deleteUser(id: number) {
    return this.http.delete<{ message: string }>(
      `${this.baseUrl}/${id}`
    );
  }
}
