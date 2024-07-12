import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/authService';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.css']
})
export class SelectorComponent implements OnInit {
  isLoginModalOpen = false;
  loginForm: FormGroup;
  userRole: string | null = null;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    this.checkUserRole();
  }

  async checkUserRole(): Promise<void> {
    try {
      const user = await this.authService.getCurrentUser();
      if (user) {
        this.userRole = await this.authService.getUserRole();
      }
    } catch (error) {
      console.error('Error al verificar el rol del usuario:', error);
    }
  }

  async openLoginModal() {
    // Verificar si el usuario autenticado tiene el rol de "gestor"
    const isGestor = await this.authService.verificarRolGestor();
    if (isGestor) {
      // Si el usuario ya tiene el rol de "gestor", redirigirlo sin pedir credenciales
      Swal.fire('Bienvenido de nuevo!', 'Has sido autenticado automáticamente.', 'success');
      this.router.navigate(['/restaurante']); // Redirige al componente de restaurante
    } else {
      // Si no es "gestor", mostrar el modal de inicio de sesión
      this.isLoginModalOpen = true;
    }
  }
  
  closeLoginModal() {
    this.isLoginModalOpen = false;
  }

  async onLoginSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      try {
        await this.authService.login({ email, password });
        
        // Verificar el rol del usuario después de iniciar sesión
        const userRole = await this.authService.getUserRole();
        
        if (userRole === 'gestor') {
          Swal.fire('Inicio de sesión exitoso!', 'Bienvenido, Gestor!', 'success');
          this.closeLoginModal();
          this.router.navigate(['/restaurante']); // Redirige al componente de restaurante
        } else {
          Swal.fire({
            title: 'Información',
            text: 'No tienes permisos de gestor. Si deseas convertirte en gestor, por favor, actualiza tu perfil.',
            icon: 'info',
            confirmButtonText: 'Entendido'
          });
          this.closeLoginModal();
          // Aquí puedes decidir si quieres redirigir al usuario a alguna página específica
          // Por ejemplo, podrías redirigirlo a una página para actualizar su perfil
          // this.router.navigate(['/actualizar-perfil']);
        }
      } catch (error) {
        Swal.fire('Error de inicio de sesión', (error as Error).message, 'error');
      }
    }
  }

  irARestaurante(): void {
    this.router.navigate(['/restaurante']);
  }

  irAGestor(): void {
    this.router.navigate(['gestor']);
  }
}
