import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { RestauranteService } from '../../../services/restaurante.service';

@Component({
  selector: 'app-restaurante',
  templateUrl: './restaurante.component.html',
  styleUrls: ['./restaurante.component.css']
})
export class RestauranteComponent implements OnInit {
  restauranteForm: FormGroup = new FormGroup({});
  restaurantes: any[] = [];
  restauranteCreado: any;
  restauranteEditando: any = null; // Variable para almacenar el restaurante en edición
  restauranteSeleccionado: any = null; // Variable para almacenar el restaurante seleccionado

  constructor(
    private restauranteService: RestauranteService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.listarRestaurantes();
  }

  inicializarFormulario(): void {
    this.restauranteForm = this.fb.group({
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      tipoCocina: [''],
      capacidadPersonas: [''],
      horarioFuncionamiento: [''],
      estado: [true]
    });
  }

  crearRestaurante(): void {
    if (this.restauranteForm.valid) {
      const nuevoRestaurante = this.restauranteForm.value;
      console.log('Formulario válido. Datos:', nuevoRestaurante);

      Swal.fire({
        title: '¿Estás seguro?',
        html: `Se agregarán los siguientes datos:<br>
               <b>Nombre:</b> ${nuevoRestaurante.nombre}<br>
               <b>Dirección:</b> ${nuevoRestaurante.direccion}<br>
               <b>Teléfono:</b> ${nuevoRestaurante.telefono}<br>
               <b>Tipo de Cocina:</b> ${nuevoRestaurante.tipoCocina}<br>
               <b>Capacidad de Personas:</b> ${nuevoRestaurante.capacidadPersonas}<br>
               <b>Horario de Funcionamiento:</b> ${nuevoRestaurante.horarioFuncionamiento}<br>
               <b>Estado:</b> ${nuevoRestaurante.estado ? 'Activo' : 'Inactivo'}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, agregar',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          this.restauranteService.crearRestaurante(nuevoRestaurante).subscribe(
            (restauranteCreado: any) => {
              console.log('Restaurante creado exitosamente', restauranteCreado);
              Swal.fire('Creado!', 'El restaurante ha sido creado exitosamente.', 'success');
              this.restauranteForm.reset(); // Reinicia el formulario después de crear
              this.listarRestaurantes(); // Actualiza la lista de restaurantes
            },
            (error: any) => {
              console.error('Error al crear restaurante', error);
              console.log('Datos enviados:', nuevoRestaurante);
              Swal.fire('Error', 'Hubo un problema al crear el restaurante. Por favor, inténtelo de nuevo.', 'error');
            }
          );
        }
      });
    } else {
      Swal.fire('Error', 'Por favor complete el formulario correctamente.', 'error');
    }
  }

  listarRestaurantes(): void {
    this.restauranteService.obtenerRestaurantes().subscribe(
      (data: any[]) => {
        this.restaurantes = data;
      },
      (error: any) => {
        console.error('Error al obtener restaurantes', error);
        Swal.fire('Error', 'Hubo un problema al obtener los restaurantes. Por favor, inténtelo de nuevo.', 'error');
      }
    );
  }

  editarRestaurante(restaurante: any): void {
    this.restauranteEditando = { ...restaurante };
  }

  cancelarEdicion(): void {
    this.restauranteEditando = null;
  }

  guardarCambios(id: number): void {
    if (this.restauranteEditando) {
      this.restauranteService.editarRestaurante(id, this.restauranteEditando).subscribe(
        (restauranteActualizado: any) => {
          console.log('Restaurante actualizado exitosamente', restauranteActualizado);
          this.listarRestaurantes(); // Actualiza la lista de restaurantes
          Swal.fire('Actualizado!', 'El restaurante ha sido actualizado exitosamente.', 'success');
          this.restauranteEditando = null; // Reinicia la variable de edición
        },
        (error: any) => {
          console.error('Error al actualizar restaurante', error);
          Swal.fire('Error', 'Hubo un problema al actualizar el restaurante. Por favor, inténtelo de nuevo.', 'error');
        }
      );
    }
  }

  desactivarRestaurante(id: number): void {
    this.restauranteService.desactivarRestaurante(id).subscribe(
      (restauranteDesactivado: any) => {
        console.log('Restaurante desactivado exitosamente');
        this.listarRestaurantes(); // Actualiza la lista de restaurantes
        Swal.fire('Desactivado!', 'El restaurante ha sido desactivado exitosamente.', 'success');
      },
      (error: any) => {
        console.error('Error al desactivar restaurante', error);
        Swal.fire('Error', 'Hubo un problema al desactivar el restaurante. Por favor, inténtelo de nuevo.', 'error');
      }
    );
  }

  restaurarRestaurante(id: number): void {
    this.restauranteService.restaurarRestaurante(id).subscribe(
      (restauranteRestaurado: any) => {
        console.log('Restaurante restaurado exitosamente');
        this.listarRestaurantes(); // Actualiza la lista de restaurantes
        Swal.fire('Restaurado!', 'El restaurante ha sido restaurado exitosamente.', 'success');
      },
      (error: any) => {
        console.error('Error al restaurar restaurante', error);
        Swal.fire('Error', 'Hubo un problema al restaurar el restaurante. Por favor, inténtelo de nuevo.', 'error');
      }
    );
  }

  verRestaurante(restaurante: any): void {
    this.restauranteSeleccionado = restaurante;
  }

  verPlatosCarta(restaurante: any): void {
    console.log('Ver platos de carta para el restaurante:', restaurante);
  }

  verPlatosMenu(restaurante: any): void {
    console.log('Ver platos de menú para el restaurante:', restaurante);
  }
}