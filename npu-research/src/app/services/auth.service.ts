import { Injectable } from '@angular/core';
import { MOCK_USERS } from '../models/mock-user';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser: User | null = null;

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
      u => u.username === username && u.password === password
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
}
