import { Injectable } from '@angular/core';
import { HttpEvent, HttpHandler, HttpRequest, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');
    let clonedReq = req;

    if (token) {
      clonedReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` }
      });
    }

    return next.handle(clonedReq).pipe(
      catchError((err) => {
        if (err.status === 401) {
          // Token หมดอายุ / invalid
          console.warn('Token expired, forcing logout');
          this.authService.forceLogout(); // ลบ session
          this.router.navigate(['/dashboard']); // redirect
        }
        return throwError(() => err);
      })
    );
  }
}