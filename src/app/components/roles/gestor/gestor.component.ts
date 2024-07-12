import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/authService';
import { Users } from '../../../models/users/users.model';
import Swal from 'sweetalert2';
import { RestauranteComponent } from '../restaurante/restaurante.component';


@Component({
  selector: 'app-gestor',
  templateUrl: './gestor.component.html',
  styleUrls: ['./gestor.component.css'],
})
export class GestorComponent implements OnInit {
  gestorForm: FormGroup;
  nombreGestor: any;
  isAdmin: any;
  isGestor: any;

  constructor(private authService: AuthService) {
    this.gestorForm = new FormGroup({
      direccion: new FormControl('', Validators.required),
      dni: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
      name: new FormControl('', Validators.required),
      role: new FormControl({ value: 'gestor', disabled: true }),
      ruc: new FormControl('', [Validators.required, Validators.maxLength(11)]),
      estado: new FormControl({ value: 'A', disabled: true }),
    });
  }

  ngOnInit(): void {}

  crearGestor(): void {
    const nuevoGestor: Users = {
      // direccion: this.gestorForm.get('direccion')?.value,
      dni: this.gestorForm.get('dni')?.value,
      email: this.gestorForm.get('email')?.value,
      password: this.gestorForm.get('password')?.value,
      name: this.gestorForm.get('name')?.value,
      role: this.gestorForm.get('role')?.value,
      // ruc: this.gestorForm.get('ruc')?.value,
      estado: this.gestorForm.get('estado')?.value,
    };

    this.authService.register(nuevoGestor)
      .then(() => {
        Swal.fire('¡Registro exitoso!', 'El gestor ha sido registrado correctamente.', 'success');
        this.gestorForm.reset();
      })
      .catch(error => {
        console.error('Error al crear gestor:', error);
        Swal.fire('¡Error!', 'Hubo un problema al registrar el gestor. Por favor, inténtelo de nuevo.', 'error');
      });
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const keyCode = event.keyCode;
    if (keyCode < 48 || keyCode > 57) {
      event.preventDefault();
    }
  }

  allowOnlyLetters(event: KeyboardEvent): void {
    const keyCode = event.keyCode;
    if ((keyCode < 65 || keyCode > 90) && (keyCode < 97 || keyCode > 122)) {
      event.preventDefault();
    }
  }

  togglePasswordVisibility(): void {
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
    } else {
      passwordInput.type = 'password';
    }
  }
}
