import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly baseUrl = `${environment.apiBaseUrl}/v1/extreme/user-account`;

  constructor(private http: HttpClient) {}

  // change passwprd
  changePassword(oldPass: string, newPass: string) {
    return this.http.put<{ message: string }>(
      `${this.baseUrl}/change-password`,
      {
        old_password: oldPass,
        new_password: newPass,
      }
    );
  }

  delete(id: number) {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/delete`);
  }
}
