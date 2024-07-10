import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.component.html',
  styleUrl: './categoria.component.css'
})
export class CategoriaComponent implements OnInit {
  private readonly baseUrl = 'http://localhost:9095/api/v1/categoria';
  private readonly estadoActivo = 'A';
  private readonly estadoInactivo = 'I';

  categorias: any[] = [];
  categoria: any = {};
  modoEdicion = false;
  filtroCategorias: string = '';

  @ViewChild('agregarCategoriaModal') agregarCategoriaModal!: ElementRef;
  @ViewChild('editarCategoriaModal') editarCategoriaModal!: ElementRef;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getCategorias();
    this.filtrarCategorias('/activo');
  }

  filtrarCategorias(estado: string) {
    this.filtroCategorias = estado;
    this.getCategorias();
  }

  getCategorias() {
    let url = `${this.baseUrl}/obtener`;

    if (this.filtroCategorias) {
        url += `${this.filtroCategorias}`;
    }

    url += '?sort=-id';

    this.http.get(url).subscribe(
        (data: any) => {
            this.categorias = data.sort((a: any, b: any) => b.id - a.id);
        },
      (error) => {
        console.error('Error en la solicitud HTTP:', error);
        this.showErrorAlert('Error', 'Hubo un error en la solicitud. Por favor, inténtelo de nuevo.');
      }
    );
  }

  nuevoCategoria() {
    this.categoria = {
      nombre: '',
      estado: this.estadoActivo
    };
    this.modoEdicion = false;
  }

  guardarCategoria() {
    if (this.camposVacios()) {
      this.showErrorAlert('Error', 'Por favor, complete todos los campos.');
      return;
    }

    if (this.modoEdicion) {
      this.actualizarCategoria(this.categoria.id);
    } else {
      const url = `${this.baseUrl}/crear`;
      this.http.post(url, this.categoria).subscribe(
        (data: any) => {
          this.categorias.push(data);
          this.categoria = { id: null, nombre: '', estado: this.estadoActivo };
          this.getCategorias();
          this.cerrarModal();
          this.showSuccessAlert('Éxito', `Categoria '${data.nombre}' creada con éxito.`);
        },
        (error) => {
          console.error('Error al crear la categoria:', error);
          this.showErrorAlert('Error', 'Error al crear la categoria. Por favor, inténtelo de nuevo.');
        }
      );
    }
  }

  private camposVacios(): boolean {
    return !this.categoria.nombre;
  }

  actualizarCategoria(id: number) {
    this.categoria.estado = this.getEstadoAbreviado(this.categoria.estado);
    const url = `${this.baseUrl}/editar/${id}`;

    this.http.put(url, this.categoria).subscribe(
      (data: any) => {
        const indice = this.categorias.findIndex((e) => e.id === data.id);
        if (indice !== -1) {
          this.categorias[indice] = data;
        }

        this.categoria = { nombre: '', estado: this.estadoActivo };
        this.getCategorias();
        this.cerrarModal();
        this.showSuccessAlert('Éxito', `Categoria '${data.nombre}' editada con éxito.`);
      },
      (error) => {
        console.error('Error en la solicitud HTTP:', error);
        this.showErrorAlert('Error', 'Error al editar la categoria.');
      }
    );
  }

  editarCategoria(categoria: any) {
    try {
      this.categoria = { ...categoria };
      this.modoEdicion = true;
      this.categoria.estado = this.getEstadoAbreviado(categoria.estado);

      const url = `${this.baseUrl}/editar/${this.categoria.id}`;
      this.http.put(url, this.categoria).subscribe(/* ... */);
    } catch (error) {
      console.log('--ERROR Datos del categoria:', this.categoria);
    }
  }

  private getEstadoAbreviado(estado: string): string {
    return estado === 'Activo' ? this.estadoActivo : this.estadoInactivo;
  }

  cerrarModal() {
    $('#agregarCategoriaModal').modal('hide');
    $('#editarCategoriaModal').modal('hide');
  }

  eliminarCategoria(categoria: any) {
    const url = `${this.baseUrl}/desactivar/${categoria.id}`;
    const id = categoria.id;

    this.http.patch(url, {}, { responseType: 'text' }).subscribe(
      (response: any) => {
        this.getCategorias();
        this.showSuccessAlert('Éxito', `Categoria '${categoria.nombre}' eliminada con éxito.`);
      },
      (error: any) => {
        console.error('Error en la solicitud HTTP:', error);
        this.showErrorAlert('Error', 'Error al eliminar la categoria.');
      }
    );
  }

  cambiarEstadoCategoria(categoria: any) {
    const url = `${this.baseUrl}/restaurar/${categoria.id}`;
    const id = categoria.id;
    const nuevoEstado = categoria.estado === this.estadoActivo ? this.estadoInactivo : this.estadoActivo;

    this.http.patch(url, {}, { responseType: 'text' }).subscribe(() => {
      const mensaje = nuevoEstado === this.estadoActivo ? 'Activado' : 'Desactivado';
      this.getCategorias();
      this.showSuccessAlert('Éxito', `Categoria '${categoria.nombre}' restaurada con éxito.`);
    });
  }

  private showSuccessAlert(title: string, message: string): void {
    Swal.fire(title, message, 'success');
  }

  private showErrorAlert(title: string, message: string): void {
    Swal.fire(title, message, 'error');
  }
}
