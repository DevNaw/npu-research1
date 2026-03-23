import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { EducationResponse } from "../models/education.model";
import { EducationResponseNew } from "../models/education-new.model";
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

      getEducationNew(): Observable<EducationResponseNew> {
        return this.http.get<EducationResponseNew>(
          `${this.apiUrl}/user/infomation/educations-for-update`
        );
      }

      updateEducationNew(id: number, data: any) {
        return this.http.patch(`${this.apiUrl}/user/infomation/update-education/${id}`, data);
      }

      createEducation(data: any) {
        return this.http.post(`${this.apiUrl}/user/infomation/create-education`, data);
      }

      deleteEducation(id: number) {
        return this.http.delete(`${this.apiUrl}/user/infomation/delete-education/${id}`);
      }
}