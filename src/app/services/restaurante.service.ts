import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class RestauranteService {
  private apiUrl = 'https://8090-vallegrande-msrestauran-4cxmnvvty2v.ws-us110.gitpod.io/api/restaurants/v1';

  constructor(private http: HttpClient, private snackBar: MatSnackBar) { }

  listarRestaurantes(estado: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/listar?estado=${estado}`)
      .pipe(
        catchError(this.handleError)
      );
  }


  crearRestaurante(restaurante: any): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/crear`, restaurante)
      .pipe(
        catchError(this.handleError)
      );
  }

  obtenerGestores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/gestores`)
      .pipe(
        catchError(this.handleError)
      );
  }

  editarRestaurante(id: number, restaurante: any): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/editar/${id}`, restaurante)
      .pipe(
        catchError(this.handleError)
      );
  }

  desactivarRestaurante(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/desactivar/${id}`, null)
      .pipe(
        catchError(this.handleError)
      );
  }

  restaurarRestaurante(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/restaurar/${id}`, null)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Agrega aquí tus métodos adicionales si es necesario

  private handleError(error: any): Observable<never> {
    console.error('Error:', error);
    this.mostrarMensajeError('Ocurrió un error. Por favor, inténtelo de nuevo.');
    return throwError(error);
  }

  private mostrarMensajeError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      verticalPosition: 'top',
      panelClass: ['snackbar-error']
    });
  }
}
