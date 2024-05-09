import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { RestauranteService } from '../../../services/restaurante.service';
import { GestorService } from '../../../services/gestor.service';


@Component({
  selector: 'app-restaurante',
  templateUrl: './restaurante.component.html',
  styleUrl: './restaurante.component.css'
})
export class RestauranteComponent implements OnInit {
  restaurantes: any[] = [];
  restauranteForm!: FormGroup;
  gestores: any[] = [];
  estadoFiltrado: string = 'Todos';
  itemsPerPage = 5;
  currentPage = 1;
  mostrarFormulario: boolean = false; 

  
  constructor(
    private gestorService: GestorService,
    private restauranteService: RestauranteService,
    private fb: FormBuilder,
    private router: Router
    
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.obtenerRestaurantes();
    this.obtenerGestores();
  }

  inicializarFormulario(): void {
    this.restauranteForm = this.fb.group({
      nombre: ['', Validators.required],
      tipoCocina: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      horarioFuncionamiento: ['', Validators.required],
      categoria: ['', Validators.required],
      gestorId: ['', Validators.required],
      estado: ['Activo', Validators.required]
    });
  }

  obtenerGestores(): void {
    this.gestorService.obtenerGestores().subscribe(
      (data) => {
        this.gestores = data;
      },
      (error) => {
        console.error('Error al obtener gestores', error);
      }
    );
  }
  changePage(page: number): void {
    this.currentPage = page;
  }

  getPageNumbers(): number[] {
    const pageCount = Math.ceil(this.gestores.length / this.itemsPerPage);
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  obtenerRestaurantes(): void {
    this.restauranteService.listarRestaurantes(this.estadoFiltrado).subscribe(
      (data: any[]) => {
        this.restaurantes = data;
      },
      (error: any) => {
        console.error('Error al obtener restaurantes', error);
      }
    );
  }
  

  crearRestaurante(): void {
    const nuevoRestaurante = this.restauranteForm.value;

    Swal.fire({
      title: '¿Estás seguro?',
      html: `Se agregarán los siguientes datos:<br>
             <b>Nombre:</b> ${nuevoRestaurante.nombre}<br>
             <b>Tipo de Cocina:</b> ${nuevoRestaurante.tipoCocina}<br>
             <b>Dirección:</b> ${nuevoRestaurante.direccion}<br>
             <b>Teléfono:</b> ${nuevoRestaurante.telefono}<br>
             <b>Horario de Funcionamiento:</b> ${nuevoRestaurante.horarioFuncionamiento}<br>
             <b>Categoría:</b> ${nuevoRestaurante.categoria}<br>
             <b>ID de Gestor:</b> ${nuevoRestaurante.gestorId}<br>
             <b>Estado:</b> ${nuevoRestaurante.estado}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, agregar',
      cancelButtonText: 'Cancelar',
    }).then((result: { isConfirmed: boolean }) => {
      if (result.isConfirmed) {
        this.restauranteService.crearRestaurante(nuevoRestaurante).subscribe(
          () => {
            console.log('Restaurante creado exitosamente');
            this.obtenerRestaurantes();
            this.restauranteForm.reset();
          },
          (error: any) => {
            console.error('Error al crear restaurante', error);
          }
        );
      }
    });
  }

  editarRestaurante(restaurante: any): void {
    restaurante.editable = true;
  }

  confirmarEdicion(restaurante: any): void {
    Swal.fire({
      title: '¿Confirmar Edición?',
      text: '¿Deseas confirmar los cambios?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
    }).then((result: { isConfirmed: boolean }) => {
      if (result.isConfirmed) {
        this.restauranteService.editarRestaurante(restaurante.id, restaurante).subscribe(
          () => {
            console.log('Restaurante editado exitosamente');
            restaurante.editable = false;
          },
          (error: any) => {
            console.error('Error al editar restaurante', error);
          }
        );
      }
    });
  }

  cancelarEdicion(restaurante: any): void {
    restaurante.editable = false;
  }

  filtrarPorEstado(estado: string): void {
    if (estado === 'Activos') {
      this.restaurantes = this.restaurantes.filter(restaurante => restaurante.estado === 'Activo');
    } else if (estado === 'Inactivos') {
      this.restaurantes = this.restaurantes.filter(restaurante => restaurante.estado === 'Inactivo');
    } else {
      // Cuando se selecciona "Todos", se deben volver a obtener todos los restaurantes
      this.obtenerRestaurantes();
    }
  }
  
  
  


  
  desactivarRestaurante(restaurante: any): void {
    Swal.fire({
      title: '¿Desactivar Restaurante?',
      text: '¿Estás seguro de desactivar este restaurante?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
    }).then((result: { isConfirmed: boolean }) => {
      if (result.isConfirmed) {
        this.restauranteService.desactivarRestaurante(restaurante.id).subscribe(
          () => {
            console.log('Restaurante desactivado exitosamente');
            this.obtenerRestaurantes();
          },
          (error: any) => {
            console.error('Error al desactivar restaurante', error);
          }
        );
      }
    });
  }

  restaurarRestaurante(restaurante: any): void {
    Swal.fire({
      title: '¿Restaurar Restaurante?',
      text: '¿Estás seguro de restaurar este restaurante?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar',
    }).then((result: { isConfirmed: boolean }) => {
      if (result.isConfirmed) {
        this.restauranteService.restaurarRestaurante(restaurante.id).subscribe(
          () => {
            console.log('Restaurante restaurado exitosamente');
            this.obtenerRestaurantes();
          },
          (error: any) => {
            console.error('Error al restaurar restaurante', error);
          }
        );
      }
    });
  }

  // Método para redirigir al componente de creación de gestor
  irACrearGestor(): void {
    this.router.navigate(['/crear-gestor']);
  }
}
