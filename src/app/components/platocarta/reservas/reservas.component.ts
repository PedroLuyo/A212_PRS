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

  generarReportePDF(): void {
    const doc = new jsPDF({
      orientation: 'landscape'
    });

    const img = new Image();
    img.src = 'assets/img/Logo Transparente Gastro Connect.png';
    img.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
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

      const head = [['ID', 'Cliente', 'Restaurante', 'Email', 'Fecha Destino', 'Personas', 'Monto', 'Observación', 'Situación', 'Detalle']];
      const data = this.reservas.map((reserva) => {
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
          detalle
        ];
      });

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
        const pageNumberText = `Página ${i}`;
        const pageSize = doc.internal.pageSize;
        const pageWidth = pageSize.getWidth();
        const pageHeight = pageSize.getHeight();
        const footerY = pageHeight - 10;
        doc.text(pageNumberText, pageWidth - doc.getTextWidth(pageNumberText) - 10, footerY);
      }

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