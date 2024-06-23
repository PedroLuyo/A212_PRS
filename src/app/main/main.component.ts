import { AuthService } from './../services/authService';
import { Component, OnInit } from '@angular/core';
import { PlatocartaService } from '../services/platocarta.service';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  userName: string = '';
  platos: any[] = [];
  allPlatos: any[] = []; 
  searchResults: any[] = []; 
  showResultBox: boolean = false; 

  searchTerm: string = '';

  constructor(private authService: AuthService, private platocartaService: PlatocartaService) { }

  async ngOnInit(): Promise<void> {
    this.updatePage();
    this.platocartaService.getPlatosCarta().subscribe((platos: any[]) => {
      this.allPlatos = platos; 
      this.platos = platos.filter((plato: { estado: string }) => plato.estado === 'A');
    });

    // Inicializar el carrusel
    this.initCarousel();
  }

  searchPlatos(): void {
    this.searchResults = this.allPlatos.filter(plato => plato.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()));
    this.showResultBox = true; 
    if (this.searchTerm.trim() === '' || this.searchResults.length === 0) {
      this.showResultBox = false;
    }
  }

  getPrecioTachado(precio: number): number {
    return precio + Math.floor(Math.random() * 3) + 2; 
  }

  async updatePage(): Promise<void> {
    try {
      this.userName = await this.authService.getUserName();
    } catch (error) {
      console.error('Error getting user name', error);
      this.userName = ''; 
    }
  }

  initCarousel(): void {
    "use strict";

    const select = (el: string, all = false): HTMLElement | HTMLElement[] | null => {
      el = el.trim();
      if (all) {
        return Array.from(document.querySelectorAll(el)) as HTMLElement[];
      } else {
        return document.querySelector(el) as HTMLElement | null;
      }
    }

    let heroCarouselIndicators = select("#hero-carousel-indicators") as HTMLElement;
    let heroCarouselItems = select('#heroCarousel .carousel-item', true) as HTMLElement[];

    heroCarouselItems.forEach((item: HTMLElement, index: number) => {
      if (index === 0) {
        heroCarouselIndicators.innerHTML += `<li data-bs-target='#heroCarousel' data-bs-slide-to='${index}' class='active'></li>`;
      } else {
        heroCarouselIndicators.innerHTML += `<li data-bs-target='#heroCarousel' data-bs-slide-to='${index}'></li>`;
      }
    });
  }
}
