import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { UserService } from '../../../services/users.service';
import { AppComponent } from '../../../app.component';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  formLogin: FormGroup;

  constructor(
    private appComponent: AppComponent,
    private userService: UserService,
    private router: Router
  ) {
    this.formLogin = new FormGroup({
      email: new FormControl(),
      password: new FormControl()
    });
    this.appComponent.showMenu = false;
  }

  ngOnDestroy() {
    this.appComponent.showMenu = true;
  }
  ngOnInit(): void {
  }

  async onSubmit() {
    try {
      await this.userService.login(this.formLogin.value);
      console.log('Usuario logueado, datos:' );
      const userName = await this.userService.getUserName();
      console.log(userName);
      this.router.navigate(['/main']);
    } catch (error) {
      console.log('Error al iniciar sesion, usuario no se encuentra en la base de datos', error);
    }
  }


  async onClick() {
    try {
      await this.userService.loginWithGoogle();
      console.log('Usuario logueado con Google');
      this.router.navigate(['/main']);
    } catch (error) {
      console.log('Error al iniciar sesion con Google', error);
    }
  }

  onSignInSuccess(event: any) {
    this.router.navigate(['/main']);
  }
  
}