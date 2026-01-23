import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

export const adminGuard: CanActivateFn = (): boolean | UrlTree => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // ยังไม่ login
  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/dashboard']);
  }

  // ไม่ใช่ admin
  if (!authService.isAdmin()) {
    return router.createUrlTree(['/user/dashboard']);
  }

  return true;
};
