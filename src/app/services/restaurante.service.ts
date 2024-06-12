import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class RestauranteService {
  private apiUrl = 'https://8090-vallegrande-msrestauran-nevaxdprx4r.ws-us114.gitpod.io/api/restaurants/v1';

  constructor(private http: HttpClient, private snackBar: MatSnackBar) { }

  crearRestaurante(restaurante: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/crear`, restaurante)
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

  private handleError(error: any): Observable<never> {
    let errorMsg: string;
    if (error.error instanceof ErrorEvent) {
      // Error del cliente
      errorMsg = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      errorMsg = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    this.mostrarMensajeError(errorMsg);
    return throwError(errorMsg);
  }

  private mostrarMensajeError(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', {
      duration: 5000,
      verticalPosition: 'top',
      panelClass: ['snackbar-error']
    });
  }
}
