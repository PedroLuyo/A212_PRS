import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { catchError, from, map, switchMap, throwError } from 'rxjs';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AuthService } from '../../../services/auth/authService';
import { RestauranteService } from '../../../services/restaurant/restaurante.service';

declare var $: any;

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.component.html',
  styleUrl: './categoria.component.css'
})
export class CategoriaComponent  {

    private readonly baseUrl = 'http://localhost:9095/api/v1/categoria';
  
    categorias: any[] = [];
    categoriasFiltradas: any[] = [];
    categoria: any = {};
    modoEdicion = false;
  
    totalCategorias: number = 0;
    page: number = 1;
    errorAlCargar = false;
    filtroEstado: string = 'A';
  
    restaurantes: any[] = [];
    selectedRestauranteRuc: string = '';
    restauranteSeleccionado: boolean = false;
  
    constructor(
      private http: HttpClient,
      private authService: AuthService,
      private restauranteService: RestauranteService
    ) { }
  
    async ngOnInit() {
      await this.getRestaurantesDelUsuario();
      // No llamamos a getCategorias() aquí, ya que esperaremos a que se seleccione un restaurante
    }
  
    getRestaurantesDelUsuario() {
      return new Promise<void>((resolve, reject) => {
        this.authService.getUserUid().then(uid => {
          this.restauranteService.obtenerTodosPorGestor().subscribe(
            restaurantes => {
              this.restaurantes = restaurantes;
              resolve();
            },
            error => {
              console.error('Error al obtener restaurantes:', error);
              this.errorAlCargar = true;
              reject(error);
            }
          );
        });
      });
    }
  
    cambiarFiltroRestaurante() {
      this.page = 1;
      if (this.selectedRestauranteRuc) {
        this.restauranteSeleccionado = true;
        this.getCategorias();
      } else {
        this.restauranteSeleccionado = false;
        this.categorias = [];
        this.categoriasFiltradas = [];
        this.totalCategorias = 0;
      }
    }
  
    buscarCategorias(event: Event) {
      const termino = (event.target as HTMLInputElement).value.toLowerCase();
      this.categoriasFiltradas = this.categorias.filter(categoria =>
        categoria.nombre.toLowerCase().includes(termino)
      );
      this.totalCategorias = this.categoriasFiltradas.length;
    }
  
    cambiarFiltroEstado() {
      this.page = 1;
      this.getCategorias();
    }
  
    getCategorias() {
      if (!this.selectedRestauranteRuc) {
        console.error('No hay restaurante seleccionado');
        return;
      }
  
      this.authService.getUserUid().then(uid => {
        let url = `${this.baseUrl}/obtener/uid/${uid}`;
        if (this.filtroEstado === 'A' || this.filtroEstado === 'I') {
          url += `/estado/${this.filtroEstado}`;
        }
        this.http.get(url).subscribe({
          next: (data: any) => {
            this.categorias = data.filter((categoria: any) => categoria.ruc === this.selectedRestauranteRuc);
            this.categoriasFiltradas = this.categorias;
            this.totalCategorias = this.categorias.length;
            this.errorAlCargar = false;
          },
          error: (error: any) => {
            console.error('Error al obtener categorías:', error);
            this.errorAlCargar = true;
          }
        });
      });
    }
  
    guardarCategoria() {
      this.authService.getUserUid().then(uid => {
        this.categoria.uid = uid;
        this.categoria.ruc = this.selectedRestauranteRuc;
        if (this.modoEdicion) {
          this.actualizarCategoria();
        } else {
          this.crearCategoria();
        }
      });
    }
  
    crearCategoria() {
      this.categoria.estado = 'A';
      this.http.post(`${this.baseUrl}/crear`, this.categoria).subscribe(
        (response: any) => {
          console.log('Categoría creada:', response);
          Swal.fire('¡Éxito!', 'La categoría ha sido creada exitosamente.', 'success');
          this.getCategorias();
          this.resetCategoriaForm();
        },
        (error) => {
          console.error('Error al crear la categoría:', error);
          Swal.fire('¡Error!', 'No se pudo crear la categoría. Por favor, inténtelo de nuevo.', 'error');
        }
      );
    }
  
    editarCategoria(categoria: any) {
      this.categoria = { ...categoria };
      this.modoEdicion = true;
    }
  
    actualizarCategoria() {
      this.http.put(`${this.baseUrl}/editar/${this.categoria.id}`, this.categoria).subscribe(
        (response) => {
          console.log('Categoría actualizada:', response);
          Swal.fire('¡Éxito!', 'La categoría ha sido actualizada exitosamente.', 'success');
          this.getCategorias();
          this.resetCategoriaForm();
        },
        (error) => {
          console.error('Error al actualizar la categoría:', error);
          Swal.fire('¡Error!', 'No se pudo actualizar la categoría. Por favor, inténtelo de nuevo.', 'error');
        }
      );
    }
  
    desactivarCategoria(categoria: any) {
      this.http.patch(`${this.baseUrl}/desactivar/${categoria.id}`, null, { responseType: 'text' }).subscribe(
        (response) => {
          console.log('Categoría desactivada:', response);
          Swal.fire('¡Éxito!', 'La categoría ha sido desactivada exitosamente.', 'success');
          this.getCategorias();
        },
        (error) => {
          console.error('Error al desactivar la categoría:', error);
          Swal.fire('¡Error!', 'No se pudo desactivar la categoría. Por favor, inténtelo de nuevo.', 'error');
        }
      );
    }
  
    restaurarCategoria(categoria: any) {
      this.http.patch(`${this.baseUrl}/restaurar/${categoria.id}`, null, { responseType: 'text' }).subscribe(
        (response) => {
          console.log('Categoría restaurada:', response);
          Swal.fire('¡Éxito!', 'La categoría ha sido restaurada exitosamente.', 'success');
          this.getCategorias();
        },
        (error) => {
          console.error('Error al restaurar la categoría:', error);
          Swal.fire('¡Error!', 'No se pudo restaurar la categoría. Por favor, inténtelo de nuevo.', 'error');
        }
      );
    }

  exportarAExcel() {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.categorias);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    XLSX.writeFile(workbook, 'categorias.xlsx');
  }

// Método para exportar a PDF
exportarAPDF(): void {
  const doc = new jsPDF({
    orientation: 'portrait'
  });

  const img = new Image();
  img.src = 'assets/img/Logo Transparente Gastro Connect.png';
  img.onload = () => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const logoWidth = pageWidth * 0.2;
    const logoHeight = img.height * (logoWidth / img.width);
    const logoX = (pageWidth - logoWidth) / 2;
    doc.addImage(img, 'PNG', logoX, 10, logoWidth, logoHeight);

    const slogan = "Disfruta de la mejor gastronomía con Gastro Connect";
    const sloganX = pageWidth / 2;
    const sloganY = logoHeight + 20;
    doc.setTextColor(31, 30, 30);
    doc.setFontSize(12);
    doc.text(slogan, sloganX, sloganY, { align: 'center' });

    const fecha = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(/ /g, '/').replace(/\//g, '-');

    doc.setFont('courier', 'bold');
    doc.setFontSize(20);
    const titulo = 'Reporte de Categorías';
    const tituloY = sloganY + 20;
    doc.text(titulo, 14, tituloY);

    doc.setFontSize(12);
    const fechaX = pageWidth - 14;
    doc.text(`Fecha: ${fecha}`, fechaX, tituloY, { align: 'right' });

    const head = [['Nombre']];
    const data = this.categorias.map(categoria => [
      categoria.nombre,
    ]);

    (doc as any).autoTable({
      head: head,
      body: data,
      startY: tituloY + 20,
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

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('courier', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(31, 30, 30);
      const pageNumberText = `Página ${i} de ${pageCount}`;
      const pageSize = doc.internal.pageSize;
      const pageWidth = pageSize.getWidth();
      const pageHeight = pageSize.getHeight();
      const footerX = pageWidth - 10;
      const footerY = pageHeight - 10;
      doc.text(pageNumberText, footerX, footerY, { align: 'right' });
    }

    doc.save('reporte_categorias.pdf');
  };
}


  resetCategoriaForm() {
    this.categoria = {};
    this.modoEdicion = false;
  }

  cancelarEdicion() {
    this.resetCategoriaForm();
  }
}
