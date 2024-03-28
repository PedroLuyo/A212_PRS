import { Component, OnInit } from '@angular/core';
import { UserService } from '../app/services/users.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'AS212 ANGELO';
  userName: string = '';

  constructor(private userService: UserService) { }

  async ngOnInit(): Promise<void> {
    try {
      this.userName = await this.userService.getUserName();
    } catch (error) {
      console.error('Error getting user name', error);
      this.userName = ''; // Establece userName a un string vacío si hay un error
    }
  }

  logout() {
    this.userService.logout().then(() => {
      console.log('Salir de Google');
      this.userName = '';
    }).catch((error) => {
      console.log(error);
    });
  }
  
}