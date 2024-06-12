import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/authService';
import { AppComponent } from '../../../app.component';
import { ToastrService } from 'ngx-toastr';
import { AngularFireAuth } from '@angular/fire/compat/auth';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  formLogin: FormGroup;

  constructor(
    private appComponent: AppComponent,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private afAuth: AngularFireAuth
  ) {
    this.formLogin = new FormGroup({
      email: new FormControl(),
      name: new FormControl(),
      password: new FormControl(),
    });
    this.appComponent.showMenu = false;
  }

  ngOnDestroy() {
    this.appComponent.showMenu = true;
  }
  ngOnInit(): void {}

async onSubmit() {
  try {
    await this.authService.login(this.formLogin.value);
    console.log('Usuario logueado, datos:');
    const userName = await this.authService.getUserName();
    this.toastr.success('Inicio de sesión exitoso', 'Correcto');
    console.log('Inicio de sesión exitoso');
    console.log(userName);
    this.router.navigate(['/main']);
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      this.toastr.error('No existe un usuario con ese correo electrónico', 'Error');
    } else if (error.code === 'auth/wrong-password') {
      this.toastr.error('Contraseña incorrecta', 'Error');
    } else if (error.code === 'auth/user-disabled') {
      this.toastr.error('El usuario ha sido deshabilitado', 'Error');
    } else {
      this.toastr.error('Error al iniciar sesión', 'Error');
    }
  }
}

  async onClick() {
    try {
      await this.authService.loginWithGoogle();
      console.log('Usuario logueado con Google');
      this.router.navigate(['/main']);
    } catch (error) {
      console.log('Error al iniciar sesion con Google', error);
    }
  }

  onSignInSuccess(event: any) {
    const user = event.authResult.user;
    const email = user.email;
    const name = user.displayName;

    this.authService
      .create({
        email: email,
        name: name,
        role: 'c',
        password: '',
        direccion: 'direccion',
        dni: 'dni',
        estado: 'estado',
        ruc: 'ruc'
      })
      .then(() => {
        this.toastr.success('Usuario registrado', 'Usuario registrado con éxito en Firestore');
        console.log('Usuario registrado con éxito en Firestore');
        this.router.navigate(['/main']);
      })
      .catch((error) => {
        this.toastr.error('Error al registrar', 'Error al registrar el usuario en Firestore');
        console.log('Error al registrar el usuario en Firestore', error);
      });
  }

  registerUser(form: NgForm) {
    const value = form.value;
    const email = value.email;
    const name = value.name;
    const password = value.password;
    if (password.length < 6) {
      this.toastr.error('La contraseña debe tener al menos 6 caracteres', 'Error');
      return;
    }
    this.authService
      .register({
        email: email,
        name: name,
        password: password,
        role: 'comensal',
      })
      .then(() => {
        console.log('Usuario registrado con éxito');
        this.toastr.success('Usuario registrado con éxito', 'Correcto');
      })
      .catch((error) => {
        console.log('Error al registrar el usuario', error);
        if (error.code === 'auth/email-already-in-use') {
          this.toastr.error('El correo electrónico ya está en uso', 'Error');
        } else if (error.code === 'auth/invalid-email') {
          this.toastr.error('El correo electrónico es inválido', 'Error');
        } else if (error.code === 'auth/weak-password') {
          this.toastr.error('La contraseña es demasiado débil', 'Error');
        } else {
          this.toastr.error('Error al registrar el usuario', 'Error');
        }
      });
  }

  showSuccess() {
    this.toastr.success('everything is broken', 'Major Error');
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await this.afAuth.sendPasswordResetEmail(email);
      console.log('Correo de restablecimiento de contraseña enviado');
    } catch (error) {
      console.error('Error al enviar el correo de restablecimiento de contraseña', error);
    }
  }

}
