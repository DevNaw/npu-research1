import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ResearchResponse } from '../models/admin-m-project.model';

@Injectable({
  providedIn: 'root',
})
export class AdminMProjectService {
  private readonly baseUrl = `${environment.apiBaseUrl}/v1/extreme`;

  constructor(private http: HttpClient) {}

  getProject() {
    return this.http.get<ResearchResponse>(
      `${this.baseUrl}/public/research/lists`
    );
  }

  deleteProject(id: number) {
    return this.http.delete(`${this.baseUrl}/research/${id}`);
  }
}
