import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth/authService';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.css']
})
export class SelectorComponent {
  isLoginModalOpen = false;
  loginForm: FormGroup;

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

  ngOnInit(): void {}

  openLoginModal(): void {
    this.isLoginModalOpen = true;
  }

  closeLoginModal(): void {
    this.isLoginModalOpen = false;
  }

  async onLoginSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      return;
    }

    const { email, password } = this.loginForm.value;

    try {
      await this.authService.login({ email, password });
      this.toastr.success('Inicio de sesión exitoso', 'Correcto');
      this.closeLoginModal();
      this.router.navigate(['/restaurante']);
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        this.toastr.error('No existe un usuario con ese correo electrónico', 'Error');
        this.router.navigate(['/gestor'], { queryParams: { message: 'Regístrese primero como gestor' } });
      } else if (error.code === 'auth/wrong-password') {
        this.toastr.error('Contraseña incorrecta', 'Error');
      } else {
        this.toastr.error('Error al iniciar sesión', 'Error');
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
