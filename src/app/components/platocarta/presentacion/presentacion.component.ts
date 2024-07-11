import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { catchError, map, throwError } from 'rxjs';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-presentacion',
  templateUrl: './presentacion.component.html',
  styleUrls: ['./presentacion.component.css']
})
export class PresentacionComponent implements OnInit {
  private readonly baseUrl = 'http://localhost:9095/api/v1/presentacion';

  presentaciones: any[] = [];
  presentacion: any = {};
  modoEdicion = false;

  totalPresentaciones: number = 0;
  page: number = 1; // Página actual inicializada en 1
  errorAlCargar = false;
  filtroEstado: string = 'A'; // Filtro inicial para presentaciones disponibles

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getPresentaciones();
    this.getTotalPresentaciones(); // Llamar aquí para asegurarse de obtener el total inicial
  }

  buscarPresentaciones(event: Event) {
    const termino = (event.target as HTMLInputElement).value.trim().toLowerCase();
  
    if (termino === '') {
      this.getPresentaciones(); // Obtener todas las presentaciones nuevamente
      
    } else {
      // Filtrar presentaciones según el término de búsqueda
      this.presentaciones = this.presentaciones.filter(presentacion =>
        presentacion.tipo.toLowerCase().includes(termino)
        
      );
      this.totalPresentaciones = this.presentaciones.length; // Actualizar el total de presentaciones

    }
  }

  cambiarFiltroEstado() {
    this.getPresentaciones(); // Llamar a la función para obtener presentaciones según el nuevo filtro seleccionado
  }

  getPresentaciones() {
    let url = `${this.baseUrl}/obtener/estado/${this.filtroEstado}`;
    this.http.get(url).pipe(
      map((data: any) => data.sort((a: any, b: any) => b.id - a.id)), // Ordenar las presentaciones por ID de forma decreciente
      catchError(error => {
        this.errorAlCargar = true;
        return throwError(error);
      })
    ).subscribe(
      (data: any) => {
        this.presentaciones = data;
        this.totalPresentaciones = this.presentaciones.length; // Actualizar el total de presentaciones
      },
      (error) => {
        console.error('Error al obtener presentaciones:', error);
      }
    );
  }

  getTotalPresentaciones() {
    let url = `${this.baseUrl}/obtener`;
    this.http.get(url).subscribe(
      (data: any) => {
      },
      (error) => {
        console.error('Error al obtener presentaciones:', error);
      }
    );
  }

  guardarPresentacion() {
    if (this.modoEdicion) {
      this.actualizarPresentacion();
    } else {
      this.crearPresentacion();
    }
  }

  crearPresentacion() {
    this.http.post(`${this.baseUrl}/crear`, this.presentacion).subscribe(
      (response: any) => {
        console.log('Presentación creada:', response);
        Swal.fire('¡Éxito!', 'La presentación ha sido creada exitosamente.', 'success');
        
        // Agregar la nueva presentación al inicio de la lista existente
        this.presentaciones.unshift(response);
  
        // Actualizar el total de presentaciones
        this.totalPresentaciones++;
  
        // Resetear el formulario y modo de edición
        this.resetPresentacionForm();
      },
      (error) => {
        console.error('Error al crear la presentación:', error);
        Swal.fire('¡Error!', 'No se pudo crear la presentación. Por favor, inténtelo de nuevo.', 'error');
      }
    );
  }

    editarPresentacion(presentacion: any) {
    this.presentacion = { ...presentacion }; // Copiar la presentación para editar
    this.modoEdicion = true; // Activar el modo de edición
  }

  actualizarPresentacion() {
    this.http.put(`${this.baseUrl}/editar/${this.presentacion.id}`, this.presentacion).subscribe(
      (response) => {
        console.log('Presentación actualizada:', response);
        Swal.fire('¡Éxito!', 'La presentación ha sido actualizada exitosamente.', 'success');
        this.getPresentaciones();
        this.resetPresentacionForm();
      },
      (error) => {
        console.error('Error al actualizar la presentación:', error);
        Swal.fire('¡Error!', 'No se pudo actualizar la presentación. Por favor, inténtelo de nuevo.', 'error');
      }
    );
  }

  desactivarPresentacion(presentacion: any) {
    this.http.patch(`${this.baseUrl}/desactivar/${presentacion.id}`, null, { responseType: 'text' }).subscribe(
      (response) => {
        console.log('Presentación archivada:', response);
        Swal.fire('¡Éxito!', 'La presentación ha sido archivada exitosamente.', 'success');
        this.getPresentaciones(); // Volver a cargar las presentaciones después de desactivar
      },
      (error) => {
        console.error('Error al archivar la presentación:', error);
        Swal.fire('¡Error!', 'No se pudo archivar la presentación. Por favor, inténtelo de nuevo.', 'error');
      }
    );
  }

  restaurarPresentacion(presentacion: any) {
    this.http.patch(`${this.baseUrl}/restaurar/${presentacion.id}`, null, { responseType: 'text' }).subscribe(
      (response) => {
        console.log('Presentación restaurada:', response);
        Swal.fire('¡Éxito!', 'La presentación ha sido restaurada exitosamente.', 'success');
        this.getPresentaciones(); // Volver a cargar las presentaciones después de restaurar
      },
      (error) => {
        console.error('Error al restaurar la presentación:', error);
        Swal.fire('¡Error!', 'No se pudo restaurar la presentación. Por favor, inténtelo de nuevo.', 'error');
      }
    );
  }

  exportarAExcel() {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.presentaciones);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    XLSX.writeFile(workbook, 'presentaciones.xlsx');
  }

// Método para exportar a PDF
// Método para exportar a PDF
exportarAPDF(): void {
  const doc = new jsPDF({
    orientation: 'landscape'
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
    const titulo = 'Reporte de Presentaciones';
    const tituloY = sloganY + 20;
    doc.text(titulo, 14, tituloY);

    doc.setFontSize(12);
    const fechaX = pageWidth - 14;
    doc.text(`Fecha: ${fecha}`, fechaX, tituloY, { align: 'right' });

    const head = [['Tipo']];
    const data = this.presentaciones.map(presentacion => [
      presentacion.tipo,
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
      const pageNumberText = `Página ${i} / ${pageCount}`;
      const pageSize = doc.internal.pageSize;
      const pageWidth = pageSize.getWidth();
      const pageHeight = pageSize.getHeight();
      const footerX = pageWidth - 10;
      const footerY = pageHeight - 10;
      doc.text(pageNumberText, footerX, footerY, { align: 'right' });
    }

    doc.save('reporte_presentaciones.pdf');
  };
}


  resetPresentacionForm() {
    this.presentacion = {};
    this.modoEdicion = false;
  }

  cancelarEdicion() {
    this.resetPresentacionForm();
  }
}
