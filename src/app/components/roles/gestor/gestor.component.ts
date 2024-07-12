import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/authService';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-gestor',
  templateUrl: './gestor.component.html',
  styleUrls: ['./gestor.component.css'],
})
export class GestorComponent implements OnInit {
  gestorForm: FormGroup;
  isGestor: boolean = false;


  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router,
  ) {
    this.gestorForm = this.fb.group({
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
    });
  }

  ngOnInit(): void {
    this.checkGestorStatus();
  }

  checkGestorStatus(): void {
    this.authService.getUserRole().then(role => {
      if (role === 'gestor') {
        this.isGestor = true;
        Swal.fire('Información', 'Ya eres gestor', 'info');
      }
    }).catch(error => {
      console.error('Error al verificar el rol:', error);
    });
  }

  async actualizarAGestor(): Promise<void> {
    if (this.gestorForm.valid) {
      const dni = this.gestorForm.get('dni')?.value;

      try {
        // Verificar si el DNI ya existe
        const isDniUnique = await this.authService.isDniUnique(dni);
        
        if (!isDniUnique) {
          Swal.fire('Advertencia', 'Este DNI ya está registrado. Por favor, usa un DNI diferente.', 'warning');
          return;
        }

        const uid = await this.authService.getUserUid();
        await this.authService.updateUser(uid, { role: 'gestor', dni: dni })
        
        .then(() => {
          Swal.fire('¡Actualización exitosa!', 'Tu perfil ha sido actualizado a Gestor.', 'success')
            .then(() => {
              // Redirigir después de cerrar el mensaje de éxito
              this.router.navigate(['/selector']).then(() => {
                // Recargar la página después de redirigir
                window.location.reload();
              });
            });
        })
        this.isGestor = true;
      } catch (error) {
        console.error('Error al actualizar a gestor:', error);
        Swal.fire('¡Error!', 'Hubo un problema al actualizar tu perfil. Por favor, inténtalo de nuevo.', 'error');
      }
    }
  }
  
}