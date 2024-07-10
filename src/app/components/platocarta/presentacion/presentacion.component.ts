import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { FormControl } from '@angular/forms';

import Swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-presentacion',
  templateUrl: './presentacion.component.html',
  styleUrl: './presentacion.component.css'
})
export class PresentacionComponent implements OnInit{
  private readonly baseUrl = 'http://localhost:9095/api/v1/presentacion';
  private readonly estadoActivo = 'A';
  private readonly estadoInactivo = 'I';

  presentaciones: any[] = [];
  presentacion: any = {};
  modoEdicion = false;
  filtroPresentaciones: string = '';

  @ViewChild('agregarPresentacionModal') agregarPresentacionModal!: ElementRef;
  @ViewChild('editarPresentacionModal') editarPresentacionModal!: ElementRef;

  constructor(private http: HttpClient) {}

  categoriaControl = new FormControl();
presentacionControl = new FormControl();

  ngOnInit() {
    this.getPresentaciones();
    this.filtrarPresentaciones('/activo');
  }

  filtrarPresentaciones(estado: string) {
    this.filtroPresentaciones = estado;
    this.getPresentaciones();
  }

  getPresentaciones() {
    let url = `${this.baseUrl}/obtener`;

    if (this.filtroPresentaciones) {
        url += `${this.filtroPresentaciones}`;
    }
  
    this.http.get(url).subscribe(
      (data: any) => {
        this.presentaciones = data.sort((a: any, b: any) => b.id - a.id);
      },
      (error) => {
        console.error('Error en la solicitud HTTP:', error);
        this.showErrorAlert('Error', 'Hubo un error en la solicitud. Por favor, inténtelo de nuevo.');
      }
    );
  }
  

  nuevoPresentacion() {
    this.presentacion = {
      tipo: '',
      estado: this.estadoActivo
    };
    this.modoEdicion = false;
  }

  guardarPresentacion() {
    if (this.camposVacios()) {
      this.showErrorAlert('Error', 'Por favor, complete todos los campos.');
      return;
    }

    if (this.modoEdicion) {
      this.actualizarPresentacion(this.presentacion.id);
    } else {
      const url = `${this.baseUrl}/crear`;
      this.http.post(url, this.presentacion).subscribe(
        (data: any) => {
          this.presentaciones.push(data);
          this.presentacion = { id: null, tipo: '', estado: this.estadoActivo };
          this.getPresentaciones();
          this.cerrarModal();
          this.showSuccessAlert('Éxito', `Presentación '${data.tipo}' creada con éxito.`);
        },
        (error) => {
          console.error('Error al crear el presentacion:', error);
          this.showErrorAlert('Error', 'Error al crear el presentacion. Por favor, inténtelo de nuevo.');
        }
      );
    }
  }

  private camposVacios(): boolean {
    return !this.presentacion.tipo;
  }

  actualizarPresentacion(id_presentacion: number) {
    this.presentacion.estado = this.getEstadoAbreviado(this.presentacion.estado);
    const url = `${this.baseUrl}/editar/${id_presentacion}`;

    this.http.put(url, this.presentacion).subscribe(
      (data: any) => {
        const indice = this.presentaciones.findIndex((e) => e.id_presentacion === data.id_presentacion);
        if (indice !== -1) {
          this.presentaciones[indice] = data;
        }

        this.presentacion = { tipo: '', estado: this.estadoActivo };
        this.getPresentaciones();
        this.cerrarModal();
        this.showSuccessAlert('Éxito', `Presentación '${data.tipo}' editada con éxito.`);
      },
      (error) => {
        console.error('Error en la solicitud HTTP:', error);
        this.showErrorAlert('Error', 'Error al editar la presentacion.');
      }
    );
  }

  editarPresentacion(presentacion: any) {
    try {
      this.presentacion = { ...presentacion };
      this.modoEdicion = true;
      this.presentacion.estado = this.getEstadoAbreviado(presentacion.estado);

      const url = `${this.baseUrl}/editar/${this.presentacion.id}`;
      this.http.put(url, this.presentacion).subscribe(/* ... */);
    } catch (error) {
      console.log('--ERROR Datos del presentacion:', this.presentacion);
    }
  }

  private getEstadoAbreviado(estado: string): string {
    return estado === 'Activo' ? this.estadoActivo : this.estadoInactivo;
  }

  cerrarModal() {
    // Cerrar el modal de agregarPresentacionModal o editarPresentacionModal
    $('#agregarPresentacionModal').modal('hide');
    $('#editarPresentacionModal').modal('hide');
  }

  eliminarPresentacion(presentacion: any) {
    const url = `${this.baseUrl}/desactivar/${presentacion.id}`;
    const id_presentacion = presentacion.id;

    this.http.patch(url, {}, { responseType: 'text' }).subscribe(
      (response: any) => {
        this.getPresentaciones();
        this.showSuccessAlert('Éxito', `Presentación '${presentacion.tipo}' eliminada con éxito.`);
      },
      (error: any) => {
        console.error('Error en la solicitud HTTP:', error);
        this.showErrorAlert('Error', 'Error al eliminar la presentacion.');
      }
    );
  }

  cambiarEstadoPresentacion(presentacion: any) {
    const url = `${this.baseUrl}/restaurar/${presentacion.id}`;
    const id_presentacion = presentacion.id;
    const nuevoEstado = presentacion.estado === this.estadoActivo ? this.estadoInactivo : this.estadoActivo;

    this.http.patch(url, {}, { responseType: 'text' }).subscribe(() => {
      const mensaje = nuevoEstado === this.estadoActivo ? 'Activado' : 'Desactivado';
      this.getPresentaciones();
      this.showSuccessAlert('Éxito', `Presentación '${presentacion.tipo}' restaurada con éxito.`);
    });
  }

  private showSuccessAlert(title: string, message: string): void {
    Swal.fire(title, message, 'success');
  }

  private showErrorAlert(title: string, message: string): void {
    Swal.fire(title, message, 'error');
  }
}
