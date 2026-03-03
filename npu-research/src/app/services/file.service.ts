import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root',
})

export class FileService {
    private readonly baseUrl = `${environment.apiBaseUrl}`;

    constructor(private http: HttpClient) {}

    getSignedUrl(url: string) {
        return this.http.post(url, {});
      }
}