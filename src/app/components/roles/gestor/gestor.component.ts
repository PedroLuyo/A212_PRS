import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router'; // Importar Router para la redirección
import Swal from 'sweetalert2';
import { GestorService } from '../../../services/gestor.service';


@Component({
  selector: 'app-gestor',
  templateUrl: './gestor.component.html',
  styleUrl: './gestor.component.css'
})
export class GestorComponent implements OnInit {
  gestores: any[] = [];
  gestorForm!: FormGroup;
  currentPage = 1;
  itemsPerPage = 5;
  mostrarFormularioGestor: boolean = false; 

  constructor(
    private gestorService: GestorService,
    private fb: FormBuilder,
    private router: Router // Inyectar Router
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
    this.obtenerGestores();
  }

  inicializarFormulario(): void {
    this.gestorForm = this.fb.group({
      dni: ['', Validators.required],
      usuario: ['', Validators.required],
      direccion: ['', Validators.required],
      nombreEmpresa: ['', Validators.required],
      ruc: ['', Validators.required],
      razonSocial: ['', Validators.required],
      estado: ['', Validators.required],
    });
  }

  filtroEstado: string | null = null;

  obtenerGestores(): void {
    this.gestorService.obtenerGestores().subscribe(
      (data) => {
        this.gestores = data
          .filter((gestor) =>
            this.filtroEstado ? gestor.estado === this.filtroEstado : true
          )
          .sort((a, b) => b.id - a.id);
      },
      (error) => {
        console.error('Error al obtener gestores', error);
      }
    );
  }

  aplicarFiltroEstado(estado: string | null): void {
    this.filtroEstado = estado;
    this.currentPage = 1;
    this.obtenerGestores();
  }

  changePage(page: number): void {
    this.currentPage = page;
  }


  getVisibleItems(): any[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.gestores.slice(startIndex, endIndex);
  }

  getPageNumbers(): number[] {
    const pageCount = Math.ceil(this.gestores.length / this.itemsPerPage);
    return Array.from({ length: pageCount }, (_, index) => index + 1);
  }

  crearGestor(): void {
    const nuevoGestor = {
      dni: this.gestorForm.get('dni')?.value,
      usuario: this.gestorForm.get('usuario')?.value,
      direccion: this.gestorForm.get('direccion')?.value,
      nombreEmpresa: this.gestorForm.get('nombreEmpresa')?.value,
      ruc: this.gestorForm.get('ruc')?.value,
      razonSocial: this.gestorForm.get('razonSocial')?.value,
      estado: this.gestorForm.get('estado')?.value,
    };

    Swal.fire({
      title: '¿Estás seguro?',
      html: `Se agregarán los siguientes datos:<br>
             <b>DNI:</b> ${nuevoGestor.dni}<br>
             <b>Usuario:</b> ${nuevoGestor.usuario}<br>
             <b>Dirección:</b> ${nuevoGestor.direccion}<br>
             <b>Nombre de la Empresa:</b> ${nuevoGestor.nombreEmpresa}<br>
             <b>RUC:</b> ${nuevoGestor.ruc}<br>
             <b>Razón Social:</b> ${nuevoGestor.razonSocial}<br>
             <b>Estado:</b> ${nuevoGestor.estado}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, agregar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.gestorService.crearGestor(nuevoGestor).subscribe(
          (data) => {
            console.log('Gestor creado exitosamente', data);
            this.obtenerGestores();
            this.gestorForm.reset();
          },
          (error) => {
            console.error('Error al crear gestor', error);
          }
        );
      }
    });
  }

  desactivarGestor(gestor: any): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción desactivará el gestor. ¿Quieres continuar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        gestor.estado = 'I';
        this.gestorService.desactivarGestor(gestor.id).subscribe(
          (data) => {
            console.log('Gestor desactivado exitosamente', data);
            this.obtenerGestores();
          },
          (error) => {
            console.error('Error al desactivar gestor', error);
          }
        );
      }
    });
  }

  restaurarGestor(gestor: any): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción restaurará el gestor. ¿Quieres continuar?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, restaurar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        gestor.estado = 'A';
        this.gestorService
          .restaurarGestor(gestor.id)
          .subscribe(
            (data) => {
              console.log('Gestor restaurado exitosamente', data);
              this.obtenerGestores();
            },
            (error) => {
              console.error('Error al restaurar gestor', error);
            }
          );
      }
    });
  }

  editarGestor(gestor: any): void {
    gestor.editable = true;
  }

  confirmarEdicion(gestor: any): void {
    Swal.fire({
      title: '¿Confirmar Edición?',
      text: '¿Deseas confirmar los cambios?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        this.gestorService.editarGestor(gestor.id, gestor).subscribe(
          (data) => {
            console.log('Gestor editado exitosamente', data);
            gestor.editable = false;
          },
          (error) => {
            console.error('Error al editar gestor', error);
          }
        );
      }
    });
  }

  cancelarEdicion(gestor: any): void {
    gestor.editable = false;
  }

  // Método para redirigir al componente de creación de restaurante
  irACrearRestaurante(): void {
    this.router.navigate(['/crear-restaurante']);
  }

}
