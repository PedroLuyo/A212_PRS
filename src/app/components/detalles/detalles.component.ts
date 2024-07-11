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
  restauranteForm: FormGroup;
  restauranteSeleccionado: any = null;
  estaAbierto: boolean = false;
  selectedOption: string = '';

  constructor(
    private route: ActivatedRoute,
    private restauranteService: RestauranteService,
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.restauranteForm = this.fb.group({
      id: [''],
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      tipoCocina: [''],
      capacidadPersonas: [''],
      horaApertura: ['', Validators.required],
      horaCierre: ['', Validators.required],
      horarioFuncionamiento: [''],
      estado: [true],
      imagenRestaurante: [''],
      urlImagen: [''],
      docid: [''],
    });
  }

  ngOnInit(): void {
    const restauranteId = +this.route.snapshot.params['id']; // Convertir a número
    this.obtenerRestaurante(restauranteId);
  }

  obtenerRestaurante(id: number): void {
    this.restauranteService.obtenerRestaurantePorId(id).subscribe(
      (restaurante: any) => {
        this.restauranteSeleccionado = restaurante;
        this.verificarEstadoRestaurante();
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
    const [apertura, cierre] = horario.split('-');
    return tipo === 'apertura' ? apertura.trim() : cierre.trim();
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
