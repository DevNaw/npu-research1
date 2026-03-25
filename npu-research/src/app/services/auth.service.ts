import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { OrganizationResponse } from '../models/expertise.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly baseUrl = `${environment.apiBaseUrl}/v1/extreme/auth`;

  private TOKEN_KEY = 'token';
  private USER_KEY = 'use';

  constructor(private http: HttpClient) {}

  // private setSession(token: string, user: any) {
  //   localStorage.setItem(this.TOKEN_KEY, token);
  //   localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  // }

  private setSession(token: string, user: any) {
    if (!token || !user) return;

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

    if (!user) return null;
    try {
      return JSON.parse(user);
    } catch (e) {
      console.warn('Invalid user in storage, clearing...');
      this.clearSession();
      return null;
    }
  }

  // getUserFromStorage(): any {
  //   const user = localStorage.getItem(this.USER_KEY);
  //   if (!user) return null;
  
  //   try {
  //     return JSON.parse(user);
  //   } catch (e) {
  //     console.warn('Invalid user in storage, clearing...');
  //     localStorage.removeItem(this.USER_KEY);
  //     localStorage.removeItem(this.TOKEN_KEY);
  //     return null;
  //   }
  // }

  // ===== login =====
  // login(username: string, password: string) {
  //   return this.http
  //     .post<any>(`${this.baseUrl}/users/login`, { username, password })
  //     .pipe(
  //       tap((res) => {
  //         // 🔥 ปรับตาม response จริงของ backend
  //         const token = res?.data?.token;
  //         const user = res?.data?.user;

  //         if (token && user) {
  //           this.setSession(token, user);
  //         }
  //       })
  //     );
  // }

  login(username: string, password: string) {
    return this.http
      .post<any>(`${this.baseUrl}/users/login`, { username, password })
      .pipe(
        tap((res) => {
          const token = res?.data?.token;
          const user = res?.data?.user;
          if (token && user) {
            this.setSession(token, user);
          } else {
            console.warn('Token or user missing in response!');
          }
        })
      );
  }

  // ===== เช็คว่า login อยู่ไหม =====
  isLoggedIn(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return !!token;
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

    return this.http
      .post(
        `${this.baseUrl}/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .pipe(
        tap(() => this.clearSession()),
        catchError((err) => {
          this.clearSession();
          return throwError(() => err);
        })
      );
  }

  forceLogout() {
    this.clearSession();
  }

  // ดึงข้อมูลสาขาที่เชี่ยวชาญ
  getOrganizations() {
    return this.http
      .get<OrganizationResponse>(`${this.baseUrl}/list-organizations`)
      .pipe(map((res) => res.data.organizations));
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
