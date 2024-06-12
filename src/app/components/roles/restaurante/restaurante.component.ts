import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { RestauranteService } from '../../../services/restaurante.service';
import { AuthService } from '../../../services/authService'; // Asegúrate de importar AuthService

@Component({
  selector: 'app-restaurante',
  templateUrl: './restaurante.component.html',
  styleUrls: ['./restaurante.component.css']
})
export class RestauranteComponent implements OnInit {
  restauranteForm!: FormGroup;
  restauranteCreado: any = null;

  constructor(
    private authService: AuthService, // Inyecta el servicio de autenticación
    private restauranteService: RestauranteService,
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
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

    // Mostrar el nombre del gestor autenticado al inicializar el formulario
    this.mostrarNombreGestorAutenticado();
  }

  mostrarNombreGestorAutenticado(): void {
    const gestorAutenticado = this.authService.obtenerNombreGestorAutenticado();
    // Si es necesario, asignar el nombre del gestor al formulario
    // this.restauranteForm.patchValue({
    //   nombreGestor: gestorAutenticado
    // });
  }

  crearRestaurante(): void {
    if (this.restauranteForm.valid) {
      const nuevoRestaurante = this.restauranteForm.value;

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
              console.log('Restaurante creado exitosamente');
              this.restauranteCreado = restauranteCreado; // Guarda el restaurante creado
              Swal.fire('Creado!', 'El restaurante ha sido creado exitosamente.', 'success');
            },
            (error: any) => {
              console.error('Error al crear restaurante', error);
              Swal.fire('Error', 'Hubo un problema al crear el restaurante. Por favor, inténtelo de nuevo.', 'error');
            }
          );
        }
      });
    }
  }
}
