import { Injectable } from '@angular/core';
import { MOCK_USERS } from '../models/mock-user';
import { User } from '../models/user.model';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  apiUrl = environment.apiBaseUrl;

  private currentUser: User | null = null;

  constructor(private http: HttpClient) {}

  // ===== helper อ่านจาก localStorage แบบปลอดภัย =====
  private getUserFromStorage(): User | null {
    const raw = localStorage.getItem('user');
    if (!raw) return null;

    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  }

  // ===== login =====
  login(username: string, password: string): boolean {
    const user = MOCK_USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (!user) return false;

    this.currentUser = user;
    localStorage.setItem('user', JSON.stringify(user)); // 🔐 เก็บทั้ง object
    return true;
  }

  // ===== เช็คว่า login อยู่ไหม =====
  isLoggedIn(): boolean {
    const user = this.getUserFromStorage();
    this.currentUser = user;
    return user !== null;
  }

  // ===== ดึง user ปัจจุบัน =====
  getUser(): User | null {
    if (!this.currentUser) {
      this.currentUser = this.getUserFromStorage();
    }
    return this.currentUser;
  }

  // ===== เช็ค role admin =====
  isAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'admin';
  }

  // ===== เอา role ไปใช้ตรง ๆ =====
  getRole(): 'user' | 'admin' | null {
    const user = this.getUser();
    return user?.role ?? null;
  }

  // ===== logout =====
  logout() {
    localStorage.removeItem('user');
    this.currentUser = null;
  }

  // ลงทะเบียน
  register(data: any) {
    return this.http.post(`${this.apiUrl}/v1/extreme/auth/register`, data);
  }

  // Login Users
  // login(data: {user: string, password: string}) { return this.http.post(`${this.apiUrl}/v1/extreme/auth/users/login`, data); }

  // Login Admin
  // loginAdmin (data: {user: string, password: string}) { return this.http.post(`${this.apiUrl}/v1/extreme/auth/admin/login`, data); }

  // Logout
  // logout() { return this.http.post(`${this.apiUrl}/v1/extreme/auth/logout`); }

  // Logout All
  // logoutAll() { return this.http.post(`${this.apiUrl}/v1/extreme/auth/logout-all`); }

  // ลืมรหัสผ่าน
  forgot(email: string) {
    return this.http.post(`${this.apiUrl}/v1/extreme/auth/forgot`, {email});
  }

  // Verify Email
  verifyEmail(token: string) {
    return this.http.get(`${this.apiUrl}/v1/extreme/auth/verify-email?token=${token}`);
  }

  // Validate Token
  validateToken() {
    return this.http.get<{ valid: boolean }>(
      `${this.apiUrl}/v1/extreme/auth/validate-token`
    );
  }

  // Delete User
  deleteUser() {
    return this.http.delete(`${this.apiUrl}/v1/extreme/user-account/delete`);
  }

  // Change Password
  changePassword(oldPassword: string, newPassword: string) {
    return this.http.put(
      `${this.apiUrl}/v1/extreme/user-account/change-password`,
      {
        oldPassword,
        newPassword
      }
    );
  }
  
}
