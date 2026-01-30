import { Injectable } from '@angular/core';
import { MOCK_USERS } from '../models/mock-user';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser: User | null = null;

  login(username: string, password: string): boolean {
    const user = MOCK_USERS.find(
      u => u.username === username && u.password === password
    );

    if (!user) return false;

    this.currentUser = user;
    // 🔐 บันทึก
    localStorage.setItem('user', JSON.stringify(user));
    return true;
  }

  isAdmin(): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUser = user;
    return this.currentUser?.role === 'admin';
  }

  isLoggedIn(): boolean {
    console.log(localStorage.getItem('user'));
    
    if (!localStorage.getItem('user')) {
      return false;
    }
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    this.currentUser = user;
    // console.log(this.currentUser);
    
    return !!this.currentUser;
  }

  getUser(): User | null {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUser = user;
    return this.currentUser;
  }

  getRole(): 'user' | 'admin' | null {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    this.currentUser = user;
    return this.currentUser?.role ?? null;
  }

  logout() {
    localStorage.removeItem('user');
    this.currentUser = null;
  }
}
