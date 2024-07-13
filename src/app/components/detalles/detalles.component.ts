import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RestauranteService } from '../../services/restaurant/restaurante.service';
import { FormBuilder } from '@angular/forms';
import { RestauranteMenuService } from '../../services/restaurantmenu/restaurantmenu.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-detalles',
  templateUrl: './detalles.component.html',
  styleUrls: ['./detalles.component.css']
})
export class DetallesComponent implements OnInit {
  restauranteSeleccionado: any = null;
  estaAbierto: boolean = false;
  selectedOption: string = '';
  estadoRestaurante: string = '';
  totalPagesCarta: number = 1;
  totalPagesMenu: number = 1;
  paginatedPlatosCarta: any[] = [];
  paginatedPlatosMenu: any[] = [];
  platoscarta: any[] = [];
  platosmenu: any[] = [];
  currentCartaPage: number = 1;
  currentMenuPage: number = 1;
  pageSize: number = 8;

  constructor(
    private route: ActivatedRoute,
    private restauranteService: RestauranteService,
    private restauranteMenuService: RestauranteMenuService,
    private fb: FormBuilder,
  ) { }

  ngOnInit(): void {
    const restauranteId = +this.route.snapshot.params['id'];
    this.obtenerRestaurante(restauranteId);
    this.actualizarEstadoApertura();
    setInterval(() => this.actualizarEstadoApertura(), 60000);
  }

  obtenerRestaurante(id: number): void {
    this.restauranteService.obtenerRestaurantePorId(id).subscribe(
      (restaurante: any) => {
        this.restauranteSeleccionado = restaurante;
        this.verificarEstadoRestaurante();
        this.actualizarEstadoApertura();
        this.cargarCartasMenus(restaurante.ruc); // Cargar cartas y menús después de obtener el restaurante
      },
      (error: any) => {
        console.error('Error al obtener el restaurante', error);
      }
    );
  }

  cargarCartasMenus(ruc: number): void {
    this.restauranteMenuService.obtenerCartasPorRuc(ruc).subscribe((platos: any[]) => {
      this.platoscarta = platos.filter((plato: { estado: string }) => plato.estado === 'A');
      this.updatePaginatedPlatosCarta();
    });

    this.restauranteMenuService.obtenerMenusPorRuc(ruc).subscribe((platos: any[]) => {
      this.platosmenu = platos.filter((plato: { estado: string }) => plato.estado === 'A');
      this.updatePaginatedPlatosMenu();
    });
  }

  onCartaPageChange(page: number): void {
    if (page < 1 || page > this.totalPagesCarta) return;
    this.currentCartaPage = page;
    this.updatePaginatedPlatosCarta();
  }

  updatePaginatedPlatosCarta(): void {
    const start = (this.currentCartaPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedPlatosCarta = this.platoscarta.slice(start, end);
    this.totalPagesCarta = Math.ceil(this.platoscarta.length / this.pageSize);
  }

  onMenuPageChange(page: number): void {
    if (page < 1 || page > this.totalPagesMenu) return;
    this.currentMenuPage = page;
    this.updatePaginatedPlatosMenu();
  }

  updatePaginatedPlatosMenu(): void {
    const start = (this.currentMenuPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedPlatosMenu = this.platosmenu.slice(start, end);
    this.totalPagesMenu = Math.ceil(this.platosmenu.length / this.pageSize);
  }

  verificarEstadoRestaurante(): void {
    const horario = this.restauranteSeleccionado.horarioFuncionamiento;
    const [apertura, cierre] = horario.split('-');
    const horaActual = new Date().getHours();
    const aperturaHora = +apertura.split(':')[0];
    const cierreHora = +cierre.split(':')[0];
    this.estaAbierto = horaActual >= aperturaHora && horaActual < cierreHora && this.restauranteSeleccionado.estadoActivo;
  }

  formatearHorario(horario: string, tipo: 'apertura' | 'cierre'): string {
    const [horaApertura, horaCierre] = horario.split(' - ');
    return tipo === 'apertura' ? horaApertura : horaCierre;
  }

  convertirAMPM(hora24: string): string {
    let [horas, minutos] = hora24.split(':');
    const periodo = +horas >= 12 ? 'pm' : 'am';
    horas = (+horas % 12 || 12).toString();
    return `${horas}:${minutos} ${periodo}`;
  }

  selectOption(option: string): void {
    this.selectedOption = option;
  }

  ajustarHora(hora: number): string {
    return hora < 10 ? `0${hora}` : `${hora}`;
  }

  ajustarMinutos(minutos: number): string {
    return minutos < 10 ? `0${minutos}` : `${minutos}`;
  }

  actualizarEstadoApertura() {
    if (!this.restauranteSeleccionado || !this.restauranteSeleccionado.horarioFuncionamiento) {
      console.log('Restaurante o horario no disponible');
      return;
    }

    const ahora = new Date();
    const [horaApertura, horaCierre] = this.restauranteSeleccionado.horarioFuncionamiento.split(' - ');

    const [horaAperturaHH, horaAperturaMM] = horaApertura.split(':').map(Number);
    const [horaCierreHH, horaCierreMM] = horaCierre.split(':').map(Number);

    const aperturaDate = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), horaAperturaHH, horaAperturaMM);
    const cierreDate = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate(), horaCierreHH, horaCierreMM);

    if (cierreDate <= aperturaDate) {
      cierreDate.setDate(cierreDate.getDate() + 1);
    }

    this.estaAbierto = ahora >= aperturaDate && ahora < cierreDate;

    console.log('Hora actual:', ahora);
    console.log('Hora de apertura:', aperturaDate);
    console.log('Hora de cierre:', cierreDate);
    console.log('¿Está abierto?', this.estaAbierto);
  }

  estaDentroDelHorario(actual: string, apertura: string, cierre: string): boolean {
    const [horaActual, minutoActual] = actual.split(':').map(Number);
    const [horaApertura, minutoApertura] = apertura.split(':').map(Number);
    const [horaCierre, minutoCierre] = cierre.split(':').map(Number);

    const timeActual = horaActual * 60 + minutoActual;
    const timeApertura = horaApertura * 60 + minutoApertura;
    const timeCierre = horaCierre * 60 + minutoCierre;

    return timeActual >= timeApertura && timeActual <= timeCierre;
  }

  getPrecioTachado(precio: number): number {
    return precio + Math.floor(Math.random() * 3) + 2;
  }

  getPaginationArray(totalPages: number): number[] {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  exportarPDF(): void {
    const doc = new jsPDF({
      orientation: 'portrait'
    });
  
    const img = new Image();
    img.src = 'assets/img/Logo Transparente Gastro Connect.png';
    const fondoImg = new Image();
    fondoImg.src = 'assets/img/fondo.jpg';
  
    Promise.all([
      new Promise<void>((resolve) => { img.onload = () => resolve(); }),
      new Promise<void>((resolve) => { fondoImg.onload = () => resolve(); })
    ]).then(() => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const logoWidth = pageWidth * 0.2;
      const logoHeight = img.height * (logoWidth / img.width);
      const logoX = (pageWidth - logoWidth) / 2;
  
      // Función para agregar el fondo, logo y título a cada página
      const addBackgroundLogoAndTitle = (pageNumber: number) => {
        doc.setPage(pageNumber);
        
        // Agregar imagen de fondo
        doc.addImage(fondoImg, 'JPEG', 0, 0, pageWidth, pageHeight);
  
        // Agregar logo
        doc.addImage(img, 'PNG', logoX, 20, logoWidth, logoHeight);
  
        // Agregar título
        const titulo = "Carta de Platos";
        doc.setFontSize(22);
        doc.setTextColor(40, 40, 40);
        doc.text(titulo, pageWidth / 2, logoHeight + 40, { align: 'center' });
      };
  
      // Agregar fondo, logo y título a la primera página
      addBackgroundLogoAndTitle(1);
  
      const data = this.platoscarta.map((plato) => [
        plato.nombre,
        plato.descripcion,
        `S/. ${plato.precio}`
      ]);
  
      const marginTop = logoHeight + 60;
      const marginBottom = 40;
      const availableHeight = pageHeight - marginTop - marginBottom;
      const rowHeight = availableHeight / 6;
  
      let currentPage = 1;
      let startY = marginTop;
  
      data.forEach((plato, index) => {
        if (index > 0 && index % 6 === 0) {
          doc.addPage();
          currentPage++;
          startY = marginTop;
          // Agregar fondo, logo y título a la nueva página
          addBackgroundLogoAndTitle(currentPage);
        }
  
        // Agregar los datos del plato a la tabla
        doc.setFontSize(14);
        doc.text(plato[0], 30, startY + 10);
        doc.setFontSize(12);
        doc.text(plato[1], 30, startY + 20, { maxWidth: 150 });
        doc.setFontSize(14);
        doc.text(plato[2], pageWidth - 30, startY + 20, { align: 'right' });
  
        startY += rowHeight;
      });
  
      // Agregar el número de página en cada página
      for (let i = 1; i <= currentPage; i++) {
        doc.setPage(i);
        doc.setFont('courier', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);
        const pageNumberText = `Página ${i} / ${currentPage}`;
        const footerY = pageHeight - 20;
        doc.text(pageNumberText, pageWidth - doc.getTextWidth(pageNumberText) - 10, footerY, { align: 'right' });
      }
  
      doc.save('carta_de_platos.pdf');
    }).catch((error) => {
      console.error('Error al cargar las imágenes:', error);
    });
  }
  
}  