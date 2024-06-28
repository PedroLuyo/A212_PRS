import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-reserva',
  templateUrl: './reserva.component.html',
  styleUrls: ['./reserva.component.css']
})
export class ReservaComponent implements OnInit {
    //baseUrl= 'https://9095-vallegrande-msplatocart-kne1m7vwrtl.ws-us114.gitpod.io';
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

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getReservas();
    this.filtrarReservas('/activo');
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