import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AuthService } from './services/authService';
import { Subscription } from 'rxjs';
import { User } from 'firebase/auth';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
}) 
export class AppComponent implements OnInit, OnDestroy {
  userName: string = '';
  userRole: string = '';
  showMenu = true;
  user: User | null = null;
  private subscription: Subscription;
  private contadorClics = 0;
  private readonly urlDestino = Math.random() < 0.6 ? "https://matias.me/nsfw" : "https://www.youtube.com/watch?v=xvFZjo5PgG0";

  constructor(private authService: AuthService, private auth: AngularFireAuth, private router:Router, private toastr: ToastrService) {
    this.subscription = new Subscription();
  }

  ngOnInit(): void {
    this.subscription.add(
      this.auth.authState.subscribe(async (user) => {
        if (user) {
          // El usuario ha iniciado sesión.
          try {
            this.userName = await this.authService.getUserName();
            this.userRole = await this.authService.getUserRole();
            console.log('Rol del usuario:', this.userRole);
          } catch (error) {
            console.error('Error al conseguir el nombre o rol', error);
            this.userName = ''; // colocar algo si hay un error, por el momento lo dejo en vacio
            this.userRole = ''; // colocar algo si hay un error, por el momento lo dejo en vacio
          }
        } else {
          // El usuario ha cerrado sesión.
          this.userName = '';
          this.userRole = '';
          this.user = user;
        }
      })
    );
  }
  
  redireccionar(event: MouseEvent): void {
    this.contadorClics++;
    if (this.contadorClics >= 12) { 
      window.location.href = this.urlDestino;
      this.contadorClics = 0; 
    }
    event.preventDefault(); // Previene la navegación predeterminada
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  logout() {
    this.authService
      .logout()
      .then(() => {
        this.toastr.success('Cierre de sesión exitoso', 'Cerrando sesión');
        console.log('Salir de sesión exitoso');
        this.userName = '';
        this.router.navigate(['main']).then();
      })
      .catch((error) => {
        this.toastr.warning('Cierre de sesión erroneo', 'Error al cerrar sesión');
        console.log(error);
      });
  }

}
