import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AuthService } from '../../../services/auth/authService';
import { RestauranteService } from '../../../services/restaurant/restaurante.service';


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
}