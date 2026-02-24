import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';

export const roleGuard: CanActivateFn = (route) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const expectedRole = route.data?.['role'];
  const userRole = authService.getUserRole();

  if (userRole !== expectedRole) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};