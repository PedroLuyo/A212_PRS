import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AuthService } from '../../../services/auth/authService';
import { RestauranteService } from '../../../services/restaurant/restaurante.service';
import * as XLSX from 'xlsx'; // Importa XLSX para trabajar con archivos Excel


declare var $: any;


@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.component.html',
  styleUrl: './reservas.component.css'
})
export class ReservasComponent {
  private readonly baseUrl = 'http://localhost:9095/api/v1/reserva';
  private readonly platosUrl = 'http://localhost:9095/api/v1/plato-carta';

  reservas: any[] = [];
  reserva: any = {
    uid: '',
    ruc: '',
    email: '',
    fecha_destino: '',
    personas: 0,
    monto: 0,
    observacion: '',
    situacion: 'P',
    reserva_detalle: []
  };
  modoEdicion = false;
  filtroSituacion = 'P';
  restaurantes: any[] = [];
  selectedRestauranteRuc: string = '';
  platos: any[] = [];
  selectedPlato: any = null;
  platosCantidad: { [key: number]: number } = {};

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private restauranteService: RestauranteService
  ) { }

  ngOnInit() {
    this.getRestaurantesDelUsuario();
    this.getReservas();
  }

  getRestaurantesDelUsuario() {
    this.authService.getUserUid().then(uid => {
      this.restauranteService.obtenerTodosPorGestor().subscribe(
        restaurantes => {
          this.restaurantes = restaurantes;
        },
        error => console.error('Error al obtener restaurantes:', error)
      );
    });
  }

  onRestauranteChange() {
    if (this.selectedRestauranteRuc) {
      this.getPlatos();
    } else {
      this.platos = [];
    }
  }

  getPlatos() {
    this.http.get(`${this.platosUrl}/obtener/ruc/${this.selectedRestauranteRuc}`).subscribe(
      (data: any) => {
        this.platos = data.filter((plato: any) => plato.estado === 'A');
      },
      error => console.error('Error al obtener platos:', error)
    );
  }

  getNombrePlato(id_carta: number): string {
    const plato = this.platos.find(p => p.id === id_carta);
    return plato ? plato.nombre : '';
  }

  agregarPlato() {
    if (this.selectedPlato && this.platosCantidad[this.selectedPlato.id] > 0) {
      const platoExistente = this.reserva.reserva_detalle.find((detalle: any) => detalle.id_carta === this.selectedPlato.id);
      if (platoExistente) {
        Swal.fire('Error', 'Este plato ya está en la reserva', 'error');
        return;
      }

      this.reserva.reserva_detalle.push({
        id_carta: this.selectedPlato.id,
        cantidad: this.platosCantidad[this.selectedPlato.id],
        subtotal: this.selectedPlato.precio * this.platosCantidad[this.selectedPlato.id]
      });

      this.reserva.monto = this.reserva.reserva_detalle.reduce((total: number, detalle: any) => total + detalle.subtotal, 0);
      this.selectedPlato = null;
      this.platosCantidad = {};
    }
  }

  eliminarPlato(index: number) {
    this.reserva.reserva_detalle.splice(index, 1);
    this.reserva.monto = this.reserva.reserva_detalle.reduce((total: number, detalle: any) => total + detalle.subtotal, 0);
  }

  getReservas() {
    this.authService.getUserUid().then(uid => {
      this.http.get(`${this.baseUrl}/obtener/cliente/${uid}/${this.filtroSituacion}`).subscribe(
        (data: any) => {
          this.reservas = data;
        },
        error => console.error('Error al obtener reservas:', error)
      );
    });
  }

  formatearFecha(fecha: string): string {
    const date = new Date(fecha);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  guardarReserva() {
    this.authService.getUserUid().then(uid => {
      this.reserva.uid = uid;
      this.reserva.ruc = this.selectedRestauranteRuc;
      this.reserva.fecha_destino = this.formatearFecha(this.reserva.fecha_destino);

      if (this.modoEdicion) {
        this.http.put(`${this.baseUrl}/editar/${this.reserva.id}`, this.reserva).subscribe(
          response => {
            Swal.fire('Éxito', 'Reserva actualizada correctamente', 'success');
            this.resetForm();
            this.getReservas();
          },
          error => {
            console.error('Error al actualizar la reserva:', error);
            Swal.fire('Error', 'No se pudo actualizar la reserva', 'error');
          }
        );
      } else {
        this.http.post(`${this.baseUrl}/crear`, this.reserva, { responseType: 'json' }).subscribe(
          (response: any) => {
            Swal.fire('Éxito', 'Reserva creada correctamente', 'success');
            this.resetForm();
            this.getReservas();
          },
          (error: any) => {
            console.error('Error al crear la reserva:', error);
            Swal.fire('Error', 'No se pudo crear la reserva', 'error');
          }
        );
      }
    });
  }

  confirmarReserva(id: number) {
    this.http.post(`${this.baseUrl}/confirmar/${id}`, {}).subscribe(
      response => {
        Swal.fire('Éxito', 'Reserva confirmada correctamente', 'success');
        this.getReservas();
      },
      error => {
        console.error('Error al confirmar la reserva:', error);
        Swal.fire('Error', 'No se pudo confirmar la reserva', 'error');
      }
    );
  }

  anularReserva(id: number) {
    this.http.post(`${this.baseUrl}/anular/${id}`, {}).subscribe(
      response => {
        Swal.fire('Éxito', 'Reserva anulada correctamente', 'success');
        this.getReservas();
      },
      error => {
        console.error('Error al anular la reserva:', error);
        Swal.fire('Error', 'No se pudo anular la reserva', 'error');
      }
    );
  }

  verDetalles(reserva: any) {
    Swal.fire({
      title: 'Detalles de la Reserva',
      html: `
        <p><strong>Cliente:</strong> ${reserva.uid}</p>
        <p><strong>Restaurante:</strong> ${reserva.ruc}</p>
        <p><strong>Fecha:</strong> ${reserva.fecha_destino}</p>
        <p><strong>Personas:</strong> ${reserva.personas}</p>
        <p><strong>Monto:</strong> ${reserva.monto}</p>
        <p><strong>Observación:</strong> ${reserva.observacion}</p>
        <p><strong>Situación:</strong> ${reserva.situacion}</p>
        <h4>Platos:</h4>
        ${reserva.reserva_detalle.map((detalle: any) =>
        `<p>${detalle.plato_carta.nombre} - Cantidad: ${detalle.cantidad} - Subtotal: ${detalle.subtotal}</p>`
      ).join('')}
      `,
      width: 600,
      confirmButtonText: 'Cerrar'
    });
  }

  resetForm() {
    this.reserva = {
      uid: '',
      ruc: '',
      email: '',
      fecha_destino: '',
      personas: 0,
      monto: 0,
      observacion: '',
      situacion: 'P',
      reserva_detalle: []
    };
    this.selectedRestauranteRuc = '';
    this.selectedPlato = null;
    this.platosCantidad = {};
    this.modoEdicion = false;
  }

  // Función para exportar a Excel
  exportarAExcel(): void {
    // Crear un array de objetos con solo las propiedades que deseas exportar
    const dataToExport = this.reservas.map(reserva => ({
      'Fecha': reserva.fecha_destino,
      'Restaurante': reserva.ruc,
      'Personas': reserva.personas,
      'Monto': reserva.monto,
      'Situación': reserva.situacion
    }));

    // Crear una hoja de cálculo usando el método json_to_sheet de XLSX
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // Crear un libro de trabajo y agregar la hoja de cálculo
    const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };

    // Convertir el libro de trabajo a un blob binario
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Crear un Blob y guardar el archivo
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const fileName = 'reporte_reservas.xlsx';

    // Crear un link para descargar el archivo
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url); // Liberar el objeto URL creado
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
    const titulo = 'Reporte de Reservas';
    const tituloY = sloganY + 20;
    doc.text(titulo, 14, tituloY);

    doc.setFontSize(12);
    const fechaX = pageWidth - 14;
    doc.text(`Fecha: ${fecha}`, fechaX, tituloY, { align: 'right' });

    const head = [['Cliente', 'Restaurante', 'Fecha', 'Personas', 'Monto', 'Observación', 'Situación']];
    const data = this.reservas.map(reserva => [
      reserva.uid,
      reserva.ruc,
      reserva.fecha_destino,
      reserva.personas,
      reserva.monto,
      reserva.observacion,
      reserva.situacion
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

    doc.save('reporte_reservas.pdf');
  };
}
}