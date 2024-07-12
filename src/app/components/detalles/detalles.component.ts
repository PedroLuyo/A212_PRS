import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RestauranteService } from '../../services/restaurant/restaurante.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/authService';

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


  constructor(
    private route: ActivatedRoute,
    private restauranteService: RestauranteService,
    private fb: FormBuilder,
  ) {

  }

  ngOnInit(): void {
    const restauranteId = +this.route.snapshot.params['id']; // Convertir a número
    this.obtenerRestaurante(restauranteId);
    this.actualizarEstadoApertura();
    setInterval(() => this.actualizarEstadoApertura(), 60000);
  }

  obtenerRestaurante(id: number): void {
    this.restauranteService.obtenerRestaurantePorId(id).subscribe(
      (restaurante: any) => {
        this.restauranteSeleccionado = restaurante;
        this.verificarEstadoRestaurante();
        this.actualizarEstadoApertura(); // Llamar aquí después de obtener el restaurante

      },
      (error: any) => {
        console.error('Error al obtener el restaurante', error);
      }
    );
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

    // Si la hora de cierre es menor que la de apertura, asumimos que cierra al día siguiente
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
}
