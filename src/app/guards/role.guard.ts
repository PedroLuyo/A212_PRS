import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/authService';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, private toastr: ToastrService) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    const expectedRoles = next.data['roles']; 
    const currentRole = await this.authService.getUserRole();
    
    if (expectedRoles && expectedRoles.includes(currentRole) || currentRole === 'admin') {
      return true;
    } else {
      this.toastr.warning('ADVERTENCIA', 'No tienes un rol para acceder a esta página.');
      this.router.navigate(['main']);
      return false;
    }
  }
}
