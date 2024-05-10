import { AuthService } from './../services/authService';
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
  allPlatos: any[] = []; // Agrega esta línea

  searchTerm: string = '';

  searchPlatos(): void {
    this.platos = this.allPlatos.filter(plato => plato.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()));
  }
  

  constructor(private authService: AuthService, private platocartaService: PlatocartaService) { }
  
  async ngOnInit(): Promise<void> {
    this.updatePage();
    this.platocartaService.getPlatosCarta().subscribe((platos: any[]) => {
      this.allPlatos = platos; // Guarda todos los platos en allPlatos
      this.platos = platos.filter((plato: { estado: string }) => plato.estado === 'A');
    });
  }

  getPrecioTachado(precio: number): number {
    return precio + Math.floor(Math.random() * 3) + 2; // Suma un número aleatorio entre 2 y 5 al precio original
  }

  async updatePage(): Promise<void> {
    try {
      this.userName = await this.authService.getUserName();
    } catch (error) {
      console.error('Error getting user name', error);
      this.userName = ''; 
    }
  }
}