import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/authService';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);
  if (authService.isLoggedIn !== true) {
    toastr.warning('ADVERTENCIA', 'No tienes permiso para acceder a esta página.');
    router.navigate(['main']);
    
  }
  
  return true;
  
};