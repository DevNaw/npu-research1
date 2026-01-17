import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { MOCK_USERS } from '../models/mock-user';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUser?: User | null = null;

  constructor(private router: Router) {}

  login(username: string, password: string): boolean {
    const user = MOCK_USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      this.currentUser = user;
      localStorage.setItem('user', JSON.stringify(user));
    }

    return false;
  }

  getUser(): User | null {
    return (
      this.currentUser || JSON.parse(localStorage.getItem('user') || 'null')
    );
  }

  logout(): void {
    this.currentUser = undefined;
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  isAdmin(): boolean {
    return this.getUser()?.role === 'admin';
  }
}
