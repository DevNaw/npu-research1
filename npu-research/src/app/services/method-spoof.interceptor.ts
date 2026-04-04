// method-spoof.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class MethodSpoofInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    if (req.method === 'PATCH' || req.method === 'PUT' || req.method === 'DELETE') {
      const body = new FormData();
      body.append('_method', req.method);

      // ถ้ามี body เดิม ให้ copy มาด้วย
      if (req.body instanceof FormData) {
        req.body.forEach((value, key) => body.append(key, value));
      }

      const spoofed = req.clone({
        method: 'POST',
        body,
      });

      return next.handle(spoofed);
    }

    return next.handle(req);
  }
}