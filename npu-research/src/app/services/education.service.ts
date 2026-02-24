import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { EducationResponse } from "../models/education.model";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})

export class EducationService {
    private apiUrl = `${environment.apiBaseUrl}/v1/extreme`;

    constructor(
        private http: HttpClient,
    ) {}

    getEducation(): Observable<EducationResponse> {
        return this.http.get<EducationResponse>(`${this.apiUrl}/user/infomation/education-for-update`);
      }

      updateEducation(data: any) {
        return this.http.patch(`${this.apiUrl}/user/infomation/education`, data);
      }
}