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
  searchResults: any[] = []; // Array para almacenar los resultados de búsqueda
  showResultBox: boolean = false; // Variable para mostrar u ocultar el cuadro flotante


  searchTerm: string = '';

  searchPlatos(): void {
    this.searchResults = this.allPlatos.filter(plato => plato.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()));
    this.showResultBox = true; // Mostrar el cuadro flotante siempre que haya término de búsqueda

    // Verificar si no hay resultados y actualizar la visibilidad del cuadro flotante
    if (this.searchTerm.trim() === '' || this.searchResults.length === 0) {
      this.showResultBox = false;
    }
  }

  carouselImages: any[] = [
    { src: 'https://www.peru.travel/Contenido/General/Imagen/es/1049/1.1/restaurantes-de-lujo-desktop.jpg', alt: 'Image 1' },
    { src: 'https://i0.wp.com/goula.lat/wp-content/uploads/2020/06/restaurantes-nueva-normalidad.jpg?fit=1000%2C667&ssl=1', alt: 'Image 2' },
    { src: 'https://blog.mesa247.pe/wp-content/uploads/2022/04/restaurantes.jpeg', alt: 'Image 3' },
    { src: 'https://elcomercio.pe/resizer/UnhQAK8FIAtm1MHRp4W0qIw8izI=/580x330/smart/filters:format(jpeg):quality(75)/cloudfront-us-east-1.images.arcpublishing.com/elcomercio/OF7TBC3M3FEPTMLRIKJKP6BXLA.jpg', alt: 'Image 4' },
    { src: 'https://cdn.forbes.com.mx/2017/09/Restaurantes-mexicanos-P.jpg', alt: 'Image 5' },
    // Agrega más imágenes según sea necesario
  ];
  

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