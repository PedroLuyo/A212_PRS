import { UserService } from './../services/users.service';
import { Component, OnInit } from '@angular/core';
import { Users } from '../models/users.model';
import { PlatocartaService } from '../services/platocarta.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit{
  userName: string = '';
  platos: any[] = [];

  constructor(private userService: UserService, private platocartaService: PlatocartaService) { }
  
  async ngOnInit(): Promise<void> {
    this.updatePage();
    this.platocartaService.getPlatosCarta().subscribe(platos => this.platos = platos);

  }

  getPrecioTachado(precio: number): number {
    return precio + Math.floor(Math.random() * 3) + 2; // Suma un número aleatorio entre 2 y 5 al precio original
  }

  async updatePage(): Promise<void> {
    try {
      this.userName = await this.userService.getUserName();
    } catch (error) {
      console.error('Error getting user name', error);
      this.userName = ''; // Establece userName a 'Jhonn Sotomayor Quispe' si hay un error
    }
  }
}