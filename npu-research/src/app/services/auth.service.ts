import { Injectable } from '@angular/core';
import { MOCK_USERS } from '../models/mock-user';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs';
import { Expertise, ExpertiseResponse } from '../models/expertise.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = `${environment.apiBaseUrl}/v1/extreme/auth`;

  expertises: Expertise[] = [];

  private TOKEN_KEY = 'token';
  private USER_KEY = 'use';

  constructor(private http: HttpClient) {}

  private setSession(token: string, user: any) {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  private clearSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  // ===== helper อ่านจาก localStorage แบบปลอดภัย =====
  getUserFromStorage(): any {
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  // ===== login =====
  login(username: string, password: string) {
    return this.http
      .post<any>(`${this.baseUrl}/users/login`, { username, password })
      .pipe(
        tap((res) => {
          // 🔥 ปรับตาม response จริงของ backend
          const token = res?.data?.token;
          const user = res?.data?.user;

          if (token && user) {
            this.setSession(token, user);
          }
        })
      );
  }

  // ===== เช็คว่า login อยู่ไหม =====
  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  // ===== ดึง user ปัจจุบัน =====
  getUser() {
    return this.http.get(`${this.baseUrl}/admin/user`);
  }

  // ===== เช็ค role admin =====
  isAdmin() {
    const user = this.getUserFromStorage();
    return user?.role === 'adm';
  }

  // ===== เอา role ไปใช้ตรง ๆ =====
  getRole(): 'use' | 'adm' | null {
    const user = this.getUserFromStorage();
    return user?.role ?? null;
  }

  // ===== logout =====
  logout() {
    const token = localStorage.getItem(this.TOKEN_KEY);
  
    return this.http.post(
      `${this.baseUrl}/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    ).pipe(
      tap(() => this.clearSession())
    );
  }
  

  // ดึงข้อมูลสาขาที่เชี่ยวชาญ
  getExpertise() {
    return this.http
    .get<ExpertiseResponse>(`${this.baseUrl}/list-expertises`)
    .pipe(
      map(res => res.data.expertises)
    );
  }

  // ลงทะเบียน
  register(data: any) {
    return this.http.post(`${this.baseUrl}/register-true`, data);
  }

  // Login Admin
  loginAdmin(data: { user: string; password: string }) {
    return this.http.post(`${this.baseUrl}/admin/login`, data);
  }

  // ลืมรหัสผ่าน
  forgot(email: string) {
    return this.http.post(`${this.baseUrl}/forgot`, { email });
  }

  // Verify Email
  verifyEmail(token: string) {
    return this.http.get(`${this.baseUrl}/verify-email?token=${token}`);
  }

  // Validate Token
  validateToken() {
    return this.http.get<{ valid: boolean }>(`${this.baseUrl}/validate-token`);
  }

  // Delete User
  deleteUser() {
    return this.http.delete(`${this.baseUrl}/v1/extreme/user-account/delete`);
  }

  // Change Password
  changePassword(oldPassword: string, newPassword: string) {
    return this.http.put(
      `${this.baseUrl}/v1/extreme/user-account/change-password`,
      {
        oldPassword,
        newPassword,
      }
    );
  }
}
