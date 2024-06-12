import { Injectable } from '@angular/core';
import { AuthService } from '../services/authService'; // Ajustamos la ruta al servicio AuthService
import { Users } from '../models/users.model'; // Ajustamos la ruta al modelo Users

@Injectable({
  providedIn: 'root',
})
export class GestorService {

  constructor(private authService: AuthService) {}

  crearGestor(nuevoGestor: Users) {
    return this.authService.register(nuevoGestor);
  }
}
