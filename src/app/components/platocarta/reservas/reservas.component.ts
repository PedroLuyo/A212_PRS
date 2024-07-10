import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AuthService } from '../../../services/auth/authService';


declare var $: any;


@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.component.html',
  styleUrl: './reservas.component.css'
})
export class ReservasComponent {
  private readonly baseUrl = 'http://localhost:9095/api/v1/reserva';
  private readonly estadoActivo = 'A';
  private readonly estadoInactivo = 'I';

  reservas: any[] = [];
  reserva: {
    id?: number;
    cliente_id: string;
    restaurante_id: string;
    email: string;
    fecha_destino: string;
    personas: number;
    monto: number;
    observacion: string;
    situacion: string;
    estado: string;
    reserva_detalle: { id_carta: number; cantidad: number }[];
  } = this.nuevaReservaObjeto();
  modoEdicion = false;
  filtroReservas = '';

  @ViewChild('agregarReservaModal') agregarReservaModal!: ElementRef;
  @ViewChild('editarReservaModal') editarReservaModal!: ElementRef;

  constructor(private http: HttpClient,
    private authService: AuthService,

  ) { }
  

  ngOnInit() {
    this.getReservas();
    this.filtrarReservas('/activo');
  }

  generarReportePDF() {
    const logoUrl = 'https://marketplace.canva.com/EAFVq1ge0ZU/1/0/1600w/canva-logo-restaurante-circular-sencillo-negro-blanco-QEgdJHSl6GE.jpg';
    const nombreRestaurante = 'Grill House';
  
    // Crear el documento jsPDF
    const doc = new jsPDF({
      orientation: 'landscape'
    });
  
    // Establecer la fecha de creación del reporte
    const fecha = new Date().toLocaleDateString();
  
    // Configurar la posición y tamaño del logo
    const imgWidth = 45;
    const imgHeight = 45;
    const margin = 10;
    const imgX = margin; // Ajusta la posición X del logo
    const imgY = margin; // Ajusta la posición Y del logo
  
    // Cargar el logo
    const img = new Image();
    img.src = logoUrl;
  
    img.onload = () => {
      // Añadir el logo al documento
      doc.addImage(img, 'JPEG', imgX, imgY, imgWidth, imgHeight);
  
      // Agregar el texto "Restaurante"
      doc.setFont('courier', 'normal'); // Cambia el tipo de fuente a Courier sin negrita
      doc.setFontSize(13); // Cambia el tamaño de la fuente a 13
      const restauranteText = 'Restaurante';
      const restauranteX = imgX + imgWidth + 10; // Posiciona el texto "Restaurante" a la derecha del logo
      const restauranteY = imgY + imgHeight / 2 - doc.getFontSize() / 2; // Centra verticalmente el texto "Restaurante" con respecto al logo
      doc.text(restauranteText, restauranteX, restauranteY);
  
      // Agregar el título del reporte
      doc.setFont('courier', 'bold'); // Cambia el tipo de fuente a Courier Bold
      doc.setFontSize(45);
      const tituloX = imgX + imgWidth + 10; // Posiciona el título a la derecha del logo
      const tituloY = restauranteY + doc.getFontSize() - 30; // Posiciona el título justo debajo del texto "Restaurante"
      doc.text(nombreRestaurante, tituloX, tituloY);
      doc.setFont('courier'); // Cambia el tipo de fuente a Courier para el resto del documento
  
      // Agregar el subtítulo del reporte
      const subtitulo = 'Reporte de reservas:';
      const subtituloY = imgY + imgHeight + 5; // Ajusta la posición Y del subtítulo
      doc.setFont('arial', 'normal'); // Cambia el tipo de fuente a Arial sin negrita
      doc.setFontSize(10);
      doc.text(subtitulo, imgX + 4, subtituloY);
  
      // Configurar la tabla de datos
      const head = [['ID', 'Cliente', 'Restaurante', 'Email', 'Fecha Destino', 'Personas', 'Monto', 'Observación', 'Situación', 'Detalle']];
      const data = this.reservas.map((reserva, index) => {
        // Construir el detalle de la reserva como texto
        let detalle = '';
        reserva.reserva_detalle.forEach((item: { id_carta: number; cantidad: number }, idx: number) => {
          detalle += `${idx + 1}. Plato: ${item.id_carta}, Cantidad: ${item.cantidad}\n`;
        });
  
        return [
          reserva.id,
          reserva.cliente_id,
          reserva.restaurante_id,
          reserva.email,
          reserva.fecha_destino,
          reserva.personas,
          reserva.monto,
          reserva.observacion,
          reserva.situacion,
          detalle  // Agregar el detalle de la reserva
        ];
      });
  
      // Generar la tabla de datos
      (doc as any).autoTable({
        head: head,
        body: data,
        startY: imgY + imgHeight + 10, // Ajusta la posición de inicio de la tabla
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
        },
        columnStyles: {
          0: { cellWidth: '50' },
          1: { cellWidth: 'auto' },
          2: { cellWidth: 'auto' },
          3: { cellWidth: '18' },
          4: { cellWidth: '30' },
          5: { cellWidth: '27' },
          6: { cellWidth: '8' },
          7: { cellWidth: '18' },
          8: { cellWidth: '23' },
          9: { cellWidth: '27' }
        }
      });
  
      // Establecer la fecha en todas las páginas del documento
      const fechaX = doc.internal.pageSize.width - margin; // Ajusta la posición X de la fecha
      const fechaY = doc.internal.pageSize.height - margin; // Ajusta la posición Y de la fecha
      doc.setFont('arial', 'normal'); // Cambia el tipo de fuente a Arial sin negrita
      doc.setFontSize(10);
      for (let i = 1; i <= doc.getNumberOfPages(); i++) {
        doc.setPage(i);
        doc.text(`Fecha de creación: ${fecha}`, fechaX, fechaY, { align: 'right' });
      }
  
      // Guardar el documento PDF
      doc.save('reporte_reservas.pdf');
    };
  }
  

  filtrarReservas(estado: string) {
    this.filtroReservas = estado;
    this.getReservas();
  }

  getReservas() {
    let url = `${this.baseUrl}/obtener`;

    if (this.filtroReservas) {
      url += `${this.filtroReservas}`;
    }

    url += '?sort=-id';

    this.http.get<any[]>(url).subscribe(
      (data: any[]) => {
        this.reservas = data.sort((a: any, b: any) => b.id - a.id);
      },
      (error) => {
        console.error('Error en la solicitud HTTP:', error);
        this.showErrorAlert('Error', 'Hubo un error en la solicitud. Por favor, inténtelo de nuevo.');
      }
    );
  }

  nuevaReserva(): void {
    this.reserva = this.nuevaReservaObjeto();
    this.modoEdicion = false;
    $('#agregarReservaModal').modal('show');
  }

  nuevaReservaObjeto() {
    return {
      cliente_id: '',
      restaurante_id: '',
      email: '',
      fecha_destino: '',
      personas: 0,
      monto: 0,
      observacion: '',
      situacion: '',
      estado: this.estadoActivo,
      reserva_detalle: [] as { id_carta: number; cantidad: number }[]
    };
  }

  agregarDetalleReserva(): void {
    this.reserva.reserva_detalle.push({ id_carta: 0, cantidad: 1 });
  }

  eliminarDetalleReserva(index: number): void {
    this.reserva.reserva_detalle.splice(index, 1);
  }

  private camposVacios(): boolean {
    return !this.reserva.cliente_id || !this.reserva.restaurante_id || !this.reserva.email || !this.reserva.fecha_destino || this.reserva.personas === null || this.reserva.personas === undefined || this.reserva.monto === null || this.reserva.monto === undefined || !this.reserva.observacion || !this.reserva.situacion || !this.reserva.reserva_detalle || this.reserva.reserva_detalle.length === 0 || this.reserva.reserva_detalle.some((detalle) => !detalle.id_carta || detalle.cantidad === null || detalle.cantidad === undefined);
  }
  formatoFechaHora(fecha: string): string {
    const fechaHora = new Date(fecha);
    const formato = `${fechaHora.getFullYear()}-${this.pad(fechaHora.getMonth() + 1)}-${this.pad(fechaHora.getDate())} ` +
                  `${this.pad(fechaHora.getHours())}:${this.pad(fechaHora.getMinutes())}:${this.pad(fechaHora.getSeconds())}`;
    return formato;
  }

  // Función auxiliar para añadir ceros a la izquierda si es necesario
  pad(n: number): string {
    return n < 10 ? '0' + n : '' + n;
  }

  guardarReserva(): void {
    this.reserva.fecha_destino = this.formatoFechaHora(this.reserva.fecha_destino);
    console.log('Intentando guardar la reserva:', this.reserva);
    if (this.camposVacios()) {
      this.showErrorAlert('Error', 'Por favor, complete todos los campos.');
      return;
    }

    const url = this.modoEdicion ? `${this.baseUrl}/editar/${this.reserva.id}` : `${this.baseUrl}/crear`;

    const httpCall = this.modoEdicion ? this.http.put(url, this.reserva) : this.http.post(url, this.reserva);

    httpCall.subscribe(
      (data: any) => {
        if (!this.modoEdicion) {
          this.reservas.push(data);
        } else {
          const indice = this.reservas.findIndex((e) => e.id === data.id);
          if (indice !== -1) {
            this.reservas[indice] = data;
          }
        }
        this.reserva = this.nuevaReservaObjeto();
        this.getReservas();
        this.cerrarModal();
        const mensaje = this.modoEdicion ? `Reserva '${data.id}' editada con éxito.` : `Reserva '${data.id}' creada con éxito.`;
        this.showSuccessAlert('Éxito', mensaje);
      },
      (error) => {
        console.error('Error al guardar la reserva:', error);
        this.showErrorAlert('Error', 'Error al guardar la reserva. Por favor, inténtelo de nuevo.');
      }
    );
  }

  editarReserva(reserva: any): void {
    this.reserva = JSON.parse(JSON.stringify(reserva));
    this.modoEdicion = true;
    $('#editarReservaModal').modal('show');
  }

  cerrarModal(): void {
    $('#agregarReservaModal').modal('hide');
    $('#editarReservaModal').modal('hide');
  }

  eliminarReserva(reserva: any): void {
    const url = `${this.baseUrl}/desactivar/${reserva.id}`;
    this.http.patch(url, {}).subscribe(
      () => {
        this.getReservas();
        this.showSuccessAlert('Éxito', `Reserva '${reserva.id}' eliminada con éxito.`);
      },
      (error: any) => {
        console.error('Error en la solicitud HTTP:', error);
        this.showErrorAlert('Error', 'Error al eliminar la reserva.');
      }
    );
  }

  cambiarEstadoReserva(reserva: any): void {
    const url = `${this.baseUrl}/restaurar/${reserva.id}`;
    const nuevoEstado = reserva.estado === this.estadoActivo ? this.estadoInactivo : this.estadoActivo;

    this.http.patch(url, {}).subscribe(
      () => {
        const mensaje = nuevoEstado === this.estadoActivo ? 'Activado' : 'Desactivado';
        this.getReservas();
        this.showSuccessAlert('Éxito', `Reserva '${reserva.id}' ${mensaje} con éxito.`);
      },
      (error: any) => {
        console.error('Error en la solicitud HTTP:', error);
        this.showErrorAlert('Error', 'Error al cambiar el estado de la reserva.');
      }
    );
  }

  private showSuccessAlert(title: string, message: string): void {
    Swal.fire(title, message, 'success');
  }

  private showErrorAlert(title: string, message: string): void {
    Swal.fire(title, message, 'error');
  }
}