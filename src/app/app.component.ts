import { Component, OnInit, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { UserService } from '../app/services/users.service';
import { Subscription } from 'rxjs';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  userName: string = '';
  showMenu = true;
  private subscription: Subscription;

  constructor(private userService: UserService, private auth: AngularFireAuth) {
    this.subscription = new Subscription();
  }

  ngOnInit(): void {
    this.subscription.add(
      this.auth.authState.subscribe(async (user) => {
        if (user) {
          // El usuario ha iniciado sesión.
          try {
            this.userName = await this.userService.getUserName();
          } catch (error) {
            console.error('Error getting user name', error);
            this.userName = ''; // colocar algo si hay un error, por el momento lo dejo en vacio
          }
        } else {
          // El usuario ha cerrado sesión.
          this.userName = '';
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  logout() {
    this.userService
      .logout()
      .then(() => {
        console.log('Salir de Google');
        this.userName = '';
      })
      .catch((error) => {
        console.log(error);
      });
  }
}
