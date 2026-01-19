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

    if (!user) {
      return false;
    }

    this.currentUser = user;
    return true;
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  getUser(): User | null {
    return this.currentUser;
  }

  logout() {
    this.currentUser = null;
  }
  isLoggedIn(): boolean {
    return !!this.currentUser;
  }


  getRole(): 'user' | 'admin' | null {
    return this.currentUser?.role ?? null;
  }

}
