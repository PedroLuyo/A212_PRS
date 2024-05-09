import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/authService';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const toastr = inject(ToastrService);

  if (authService.isLoggedIn !== true) {
    router.navigate(['main']);
    
    toastr.warning('ADVERTENCIA', 'No tienes un rol para acceder a esta página.');
  }
  //alert('No tienes permiso para acceder a esta página'); //test
  return true;
};  