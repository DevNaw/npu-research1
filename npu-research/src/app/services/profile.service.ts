import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ResearchListResponse } from '../models/profile-project.model';
import { Observable } from 'rxjs';
import { GeneralInfoResponse } from '../models/edit-general.model';
import { UserProfileResponse } from '../models/profiledetai.model';
import { ResearchProfileResponse } from '../models/get-profile-by-id.model';

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

  // ======= ดึงข้อมูลโปรไฟล์ =======
  getProfile() {
    return this.http.get<UserProfileResponse>(this.baseUrl);
  }

  getProfileById(id: number) {
    return this.http.get<ResearchProfileResponse>(
      `${this.baseUrl}/by-id/${id}`
    );
  }

  // ======= อัปเดตข้อมูลโปรไฟล์ ===========
  updateProfile(data: UpdateProfilePayload) {
    return this.http.post<{ message: string; user: UserProfile }>(
      this.baseUrl,
      this.spoof('PUT', data)
    );
  }

  // ======= อัปเดตรูปโปรไฟล์ =======
  updateAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar_img', file);

    return this.http.post<{ message: string; avatar_url: string }>(
      `${this.baseUrl}/avatar`,
      formData
    );
  }

  getGeneralInfo(): Observable<GeneralInfoResponse> {
    return this.http.get<GeneralInfoResponse>(
      `${this.api}/user/infomation/general-for-update`
    );
  }

  updateGeneral(data: any) {
    return this.http.post(`${this.api}/user/infomation/general`, (this.spoof('PATCH', data)));
  }

  updateEducation(data: any) {
    return this.http.post(`${this.api}/user/infomation/education`, (this.spoof('PATCH', data)));
  }

  updateWork(data: any) {
    return this.http.post(`${this.api}/user/infomation/work`, (this.spoof('PATCH', data)));
  }

  getProjectList(): Observable<ResearchListResponse> {
    return this.http.get<ResearchListResponse>(`${this.api}/research/lists`);
  }

  // Delete Project
  deleteProject(id: number) {
    return this.http.post(`${this.api}/research/${id}/delete`, this.spoof('DELETE'));
  }
}
