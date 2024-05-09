import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/authService';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  async canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean | UrlTree> {
    const expectedRole = next.data['role']; 
    const currentRole = await this.authService.getUserRole();

    if (!currentRole || (expectedRole.indexOf('admin') === -1 && currentRole !== 'admin')) {
      this.router.navigate(['/']); // Redirige al usuario a la página principal
    }

    return true;
  }

}