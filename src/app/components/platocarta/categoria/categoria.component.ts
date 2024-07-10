import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import { catchError, map, throwError } from 'rxjs';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

declare var $: any;

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.component.html',
  styleUrl: './categoria.component.css'
})
export class CategoriaComponent  {
  private readonly baseUrl = 'http://localhost:9095/api/v1/categoria';

  categorias: any[] = [];
  categoria: any = {};
  modoEdicion = false;

  totalCategorias: number = 0;
  page: number = 1; // Página actual inicializada en 1
  errorAlCargar = false;
  filtroEstado: string = 'A'; // Filtro inicial para categorías activas

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.getCategorias();
    this.getTotalCategorias(); // Llamar aquí para asegurarse de obtener el total inicial
  }

  buscarCategorias(event: Event) {
    const termino = (event.target as HTMLInputElement).value.trim().toLowerCase();
  
    if (termino === '') {
      this.getCategorias(); // Obtener todas las categorías nuevamente
    } else {
      // Filtrar categorías según el término de búsqueda
      this.categorias = this.categorias.filter(categoria =>
        categoria.nombre.toLowerCase().includes(termino)
      );
      this.totalCategorias = this.categorias.length; // Actualizar el total de categorías
    }
  }

  cambiarFiltroEstado() {
    this.getCategorias(); // Llamar a la función para obtener categorías según el nuevo filtro seleccionado
  }

  getCategorias() {
    let url = `${this.baseUrl}/obtener/estado/${this.filtroEstado}`;
    this.http.get(url).pipe(
      map((data: any) => data.sort((a: any, b: any) => b.id - a.id)), // Ordenar las categorías por ID de forma decreciente
      catchError(error => {
        this.errorAlCargar = true;
        return throwError(error);
      })
    ).subscribe(
      (data: any) => {
        this.categorias = data;
        this.totalCategorias = this.categorias.length; // Actualizar el total de categorías
      },
      (error) => {
        console.error('Error al obtener categorías:', error);
      }
    );
  }

  getTotalCategorias() {
    let url = `${this.baseUrl}/obtener`;
    this.http.get(url).subscribe(
      (data: any) => {
      },
      (error) => {
        console.error('Error al obtener categorías:', error);
      }
    );
  }

  guardarCategoria() {
    if (this.modoEdicion) {
      this.actualizarCategoria();
    } else {
      this.crearCategoria();
    }
  }

  crearCategoria() {
    this.http.post(`${this.baseUrl}/crear`, this.categoria).subscribe(
      (response: any) => {
        console.log('Categoría creada:', response);
        Swal.fire('¡Éxito!', 'La categoría ha sido creada exitosamente.', 'success');
        
        // Agregar la nueva categoría al inicio de la lista existente
        this.categorias.unshift(response);
  
        // Actualizar el total de categorías
        this.totalCategorias++;
  
        // Resetear el formulario y modo de edición
        this.resetCategoriaForm();
      },
      (error) => {
        console.error('Error al crear la categoría:', error);
        Swal.fire('¡Error!', 'No se pudo crear la categoría. Por favor, inténtelo de nuevo.', 'error');
      }
    );
  }

  editarCategoria(categoria: any) {
    this.categoria = { ...categoria }; // Copiar la categoría para editar
    this.modoEdicion = true; // Activar el modo de edición
  }

  actualizarCategoria() {
    this.http.put(`${this.baseUrl}/editar/${this.categoria.id}`, this.categoria).subscribe(
      (response) => {
        console.log('Categoría actualizada:', response);
        Swal.fire('¡Éxito!', 'La categoría ha sido actualizada exitosamente.', 'success');
        this.getCategorias();
        this.resetCategoriaForm();
      },
      (error) => {
        console.error('Error al actualizar la categoría:', error);
        Swal.fire('¡Error!', 'No se pudo actualizar la categoría. Por favor, inténtelo de nuevo.', 'error');
      }
    );
  }

  desactivarCategoria(categoria: any) {
    this.http.patch(`${this.baseUrl}/desactivar/${categoria.id}`, null, { responseType: 'text' }).subscribe(
      (response) => {
        console.log('Categoría desactivada:', response);
        Swal.fire('¡Éxito!', 'La categoría ha sido desactivada exitosamente.', 'success');
        this.getCategorias(); // Volver a cargar las categorías después de desactivar
      },
      (error) => {
        console.error('Error al desactivar la categoría:', error);
        Swal.fire('¡Error!', 'No se pudo desactivar la categoría. Por favor, inténtelo de nuevo.', 'error');
      }
    );
  }

  restaurarCategoria(categoria: any) {
    this.http.patch(`${this.baseUrl}/restaurar/${categoria.id}`, null, { responseType: 'text' }).subscribe(
      (response) => {
        console.log('Categoría restaurada:', response);
        Swal.fire('¡Éxito!', 'La categoría ha sido restaurada exitosamente.', 'success');
        this.getCategorias(); // Volver a cargar las categorías después de restaurar
      },
      (error) => {
        console.error('Error al restaurar la categoría:', error);
        Swal.fire('¡Error!', 'No se pudo restaurar la categoría. Por favor, inténtelo de nuevo.', 'error');
      }
    );
  }

  exportarAExcel() {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.categorias);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    XLSX.writeFile(workbook, 'categorias.xlsx');
  }

  exportarAPDF() {
    // Implementar lógica para exportar a PDF si es necesario
  }

  resetCategoriaForm() {
    this.categoria = {};
    this.modoEdicion = false;
  }

  cancelarEdicion() {
    this.resetCategoriaForm();
  }
}
