import { AuthService } from './../services/authService';
import { Component, OnInit } from '@angular/core';
import { PlatocartaService } from '../services/platocarta.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


// Extensión de tipos para jsPDF para incluir autoTable
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


  async generarReportePDF(): Promise<void> {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4"
    });
  
    doc.setFont("Arial");
  
    // Título
    doc.setFontSize(24);
    doc.setFont("bold");
    doc.text("REPORTE DE PLATOS", 105, 20, { align: "center" });
  
    // Restablecer para contenido
    doc.setFontSize(12);
    doc.setFont("normal");
    const lineHeight = 12 * 1.5; // Tamaño de letra 12 con interlineado 1.5
  
    const columnas = ['Nombre', 'Descripción', 'Precio'];
    const filas: (string | number)[][] = [];
  
    // Obtener los platos y preparar las filas para el reporte
    const platos = await this.platocartaService.getPlatosCarta().toPromise();
    platos.forEach((plato: { nombre: string; descripcion: string; precio: number }) => {
      filas.push([plato.nombre, plato.descripcion, plato.precio]);
    });
  
    // Agregar una tabla al documento con márgenes personalizados
    doc.autoTable(columnas, filas, {
      startY: 40, // Margen superior de 4 cm
      margin: { bottom: 25 }, // Margen inferior de 2.5 cm
      styles: { font: "Arial", fontSize: 12, cellPadding: 1.5, overflow: 'linebreak' },
      bodyStyles: { valign: 'top' },
      didDrawPage: function (data: any) {
        // Asegurar que el margen inferior se respeta en cada página
        if (doc.internal.pageSize.height - data.cursor.y < 25) {
          doc.addPage();
        }
      }
    });
  
    // Fecha en la esquina inferior derecha
    const fecha = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
    doc.setFontSize(12);
    doc.setFont("normal");
    doc.text(fecha, doc.internal.pageSize.width - 20, doc.internal.pageSize.height - 10, { align: "right" });
  
    // Guardar el PDF
    doc.save(`reporte-platos-${fecha}.pdf`);
  }
}
