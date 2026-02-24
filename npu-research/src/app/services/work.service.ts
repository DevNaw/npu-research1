import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { WorkInfoResponse } from '../models/work.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class WorkService {
  private apiUrl = `${environment.apiBaseUrl}/v1/extreme`;

  constructor(private http: HttpClient) {}

  getWorkInfo(): Observable<WorkInfoResponse> {
    return this.http.get<WorkInfoResponse>(`${this.apiUrl}/user/infomation/work-for-update`);
  }

  updateWork(data: any) {
    return this.http.patch(`${this.apiUrl}/user/infomation/work`, data);
  }
}
