import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly baseUrl = `${environment.apiBaseUrl}/v1/extreme/user-account`;

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

  // change passwprd
  changePassword(oldPass: string, newPass: string) {
    return this.http.post<{ message: string }>(
      `${this.baseUrl}/change-password`,
      this.spoof('PATCH', {
        old_password: oldPass,
        new_password: newPass,
      })
    );
  }

  delete(id: number) {
    return this.http.post<{ message: string }>(`${this.baseUrl}/delete`, this.spoof('DELETE'));
  }
}
