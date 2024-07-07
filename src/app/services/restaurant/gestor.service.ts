import { Injectable } from '@angular/core';
import { AuthService } from '../auth/authService';
import { Users } from '../../models/users/users.model';


@Injectable({
  providedIn: 'root',
})
export class GestorService {

  constructor(private authService: AuthService) {}

  crearGestor(nuevoGestor: Users) {
    return this.authService.register(nuevoGestor);
  }
}
