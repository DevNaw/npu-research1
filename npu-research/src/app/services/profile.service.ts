import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface UserProfile {
  data: any;
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  created_at: string;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
  phone?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileService {
  private readonly baseUrl = `${environment.apiBaseUrl}/v1/extreme/profile`;
  private api = `${environment.apiBaseUrl}/v1/extreme`;

  constructor(private http: HttpClient) {}

  // ✅ ดึงข้อมูลโปรไฟล์
  getProfile() {
    return this.http.get<UserProfile>(this.baseUrl);
  }

  // ✅ อัปเดตข้อมูลโปรไฟล์
  updateProfile(data: UpdateProfilePayload) {
    return this.http.put<{ message: string; user: UserProfile }>(
      this.baseUrl,
      data
    );
  }

  // ✅ อัปเดตรูปโปรไฟล์
  updateAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);

    return this.http.post<{ message: string; avatar_url: string }>(
      `${this.baseUrl}/avatar`,
      formData
    );
  }

  updateGeneral(data: any) {
    return this.http.patch(`${this.api}/user/infomation/general`, data);
  }

  updateEducation(data: any) {
    return this.http.patch(`${this.api}/user/infomation/education`, data);
  }

  updateWork(data: any) {
    return this.http.patch(`${this.api}/user/infomation/work`, data);
  }
}
