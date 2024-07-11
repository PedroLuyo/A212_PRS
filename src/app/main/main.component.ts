import { AuthService } from '../services/auth/authService';
import { Component, OnInit } from '@angular/core';
import { RestauranteMenuService } from '../services/restaurantmenu/restaurantmenu.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { RestauranteService } from '../services/restaurant/restaurante.service';
import Swal from 'sweetalert2';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (columnas: string[], filas: any[], opciones?: any) => void;
  }
}

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  userName: string = '';
  platoscarta: any[] = [];
  platosmenu: any[] = [];
  allPlatos: any[] = [];
  searchResults: any[] = [];
  showResultBox: boolean = false;
  limitedSearchResults: any[] = [];
  currentCartaPage: number = 1;
  currentMenuPage: number = 1;
  currentRestaurantesPage: number = 1; // Agregado
  pageSize: number = 8;
  paginatedPlatosCarta: any[] = [];
  paginatedPlatosMenu: any[] = [];
  totalPagesCarta: number = 1;
  totalPagesMenu: number = 1;
  searchTerm: string = '';
  restaurantes: any[] = [];
  restauranteSeleccionado: any = null;
  p: number = 1; // Página actual
  itemsPerPage: number = 5;
  totalPagesRestaurantes: number = 3;

  constructor(
    private authService: AuthService, 
    private restauranteMenuService: RestauranteMenuService,
    private restauranteService: RestauranteService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.updatePage();
    this.initCarousel();
    this.listarRestaurantes();

    this.totalPagesRestaurantes = Math.ceil(this.restaurantes.length / this.itemsPerPage);

    this.restauranteMenuService.getCartas().subscribe((platos: any[]) => {
      this.platoscarta = platos.filter((plato: { estado: string }) => plato.estado === 'A');
      this.updatePaginatedPlatosCarta();
    });

    this.restauranteMenuService.getMenus().subscribe((platos: any[]) => {
      this.platosmenu = platos.filter((plato: { estado: string }) => plato.estado === 'A');
      this.updatePaginatedPlatosMenu();
    });

    this.restauranteMenuService.getPlatos().subscribe((platos: any[]) => {
      this.allPlatos = platos.filter((plato: { estado: string }) => plato.estado === 'A');
    });
  }

  onRestaurantesPageChange(page: number) {
    this.currentRestaurantesPage = page;
  }

  verRestaurante(restaurante: any): void {
    this.restauranteSeleccionado = restaurante;
  }

  onCartaPageChange(page: number): void {
    if (page < 1 || page > this.totalPagesCarta) return;
    this.currentCartaPage = page;
    this.updatePaginatedPlatosCarta();
  }

  listarRestaurantes(): void {
    this.restauranteService.obtenerTodos().subscribe(
      (data: any[]) => {
        this.restaurantes = data;
      },
      (error: any) => {
        console.error('Error al obtener restaurantes', error);
        Swal.fire('Error', 'Hubo un problema al obtener los restaurantes. Por favor, inténtelo de nuevo.', 'error');
      }
    );
  }

  onMenuPageChange(page: number): void {
    if (page < 1 || page > this.totalPagesMenu) return;
    this.currentMenuPage = page;
    this.updatePaginatedPlatosMenu();
  }

  updatePaginatedPlatosCarta(): void {
    const start = (this.currentCartaPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedPlatosCarta = this.platoscarta.slice(start, end);
    this.totalPagesCarta = Math.ceil(this.platoscarta.length / this.pageSize);
  }

  updatePaginatedPlatosMenu(): void {
    const start = (this.currentMenuPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedPlatosMenu = this.platosmenu.slice(start, end);
    this.totalPagesMenu = Math.ceil(this.platosmenu.length / this.pageSize);
  }

  getPaginationArray(totalPages: number): number[] {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  searchPlatos(): void {
    this.searchResults = this.allPlatos.filter(plato => plato.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()));
    this.limitedSearchResults = this.searchResults.slice(0, 5);
    this.showResultBox = this.searchTerm.trim() !== '' && this.searchResults.length > 0;
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
      heroCarouselIndicators.innerHTML += `<li data-bs-target='#heroCarousel' data-bs-slide-to='${index}' class='${index === 0 ? 'active' : ''}'></li>`;
    });
  }

  async generarReportePDF(): Promise<void> {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: "mm",
      format: "a4"
    });

    const img = new Image();
    img.src = 'assets/img/Logo Transparente Gastro Connect.png';
    img.onload = async () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const logoWidth = pageWidth * 0.2;
      const logoHeight = img.height * (logoWidth / img.width);
      const logoX = (pageWidth - logoWidth) / 2;
      doc.addImage(img, 'PNG', logoX, 10, logoWidth, logoHeight);

      const fecha = new Date().toLocaleDateString();

      doc.setFont('courier', 'bold');
      doc.setFontSize(20);
      const titulo = 'Reporte de Platos';
      const tituloY = logoHeight + 20;
      doc.text(titulo, 14, tituloY);

      doc.setFontSize(12);
      const fechaX = pageWidth - 14;
      doc.text(`Fecha: ${fecha}`, fechaX, tituloY, { align: 'right' });

      const platos = await this.restauranteMenuService.getPlatos().toPromise();
      const head = [['Nombre', 'Descripción', 'Precio']];
      const data = platos.filter((plato: { estado: string }) => plato.estado === 'A')
        .map((plato: { nombre: string; descripcion: string; precio: number }) => [
          plato.nombre,
          plato.descripcion,
          plato.precio
        ]);

      (doc as any).autoTable({
        head: head,
        body: data,
        startY: tituloY + 10,
        styles: {
          cellWidth: 'auto',
          fontSize: 10,
          lineColor: [0, 0, 0],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [0, 0, 0],
          textColor: 255,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
          textColor: 0
        },
        alternateRowStyles: {
          fillColor: [235, 235, 235]
        }
      });

      doc.save(`reporte-platos-${fecha}.pdf`);
    };
  }
}
