import { UserService } from './../services/users.service';
import { Component } from '@angular/core';
import { Users } from '../models/users.model';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent {
  userName: string = '';

  constructor(private userService: UserService) { }
  
  async ngOnInit(): Promise<void> {
    this.updatePage();
  }

  async updatePage(): Promise<void> {
    try {
      this.userName = await this.userService.getUserName();
    } catch (error) {
      console.error('Error getting user name', error);
      this.userName = 'Jhonn Sotomayor Quispe'; // Establece userName a 'Jhonn Sotomayor Quispe' si hay un error
    }
  }
}