import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/authService';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-gestor',
  templateUrl: './gestor.component.html',
  styleUrls: ['./gestor.component.css'],
})
export class GestorComponent implements OnInit {
  gestorForm: FormGroup;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.gestorForm = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
    });
  }

  ngOnInit(): void {}

  actualizarAGestor(): void {
    if (this.gestorForm.valid) {
      const dni = this.gestorForm.get('dni')?.value;

      this.authService.getUserUid().then((uid) => {
        this.authService.updateUserGestor(uid, { role: 'gestor', dni: dni })
          .then(() => {
            Swal.fire('¡Actualización exitosa!', 'Tu perfil ha sido actualizado a Gestor.', 'success');
            // Aquí puedes añadir lógica adicional, como redireccionar o actualizar la UI
          })
          .catch(error => {
            console.error('Error al actualizar a gestor:', error);
            Swal.fire('¡Error!', 'Hubo un problema al actualizar tu perfil. Por favor, inténtalo de nuevo.', 'error');
          });
      });
    }
  }
}