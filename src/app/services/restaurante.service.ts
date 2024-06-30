import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class RestauranteService {
  private apiUrl = 'https://8090-vallegrande-msrestauran-2v1gv6knw86.ws-us114.gitpod.io/api/restaurants/v1';

  constructor(private http: HttpClient) {}

  // Obtener todos los restaurantes
  obtenerTodos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/listar`)
      .pipe(
        catchError((error: any) => {
          console.error('Error al obtener restaurantes', error);
          Swal.fire('Error', 'Hubo un problema al obtener los restaurantes. Por favor, inténtelo de nuevo.', 'error');
          return throwError(error);
        })
      );
  }

  // Crear un restaurante
  crearRestaurante(restaurante: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<any>(`${this.apiUrl}/crear`, restaurante, { headers })
      .pipe(
        catchError((error: any) => {
          console.error('Error al crear restaurante', error);
          Swal.fire('Error', 'Hubo un problema al crear el restaurante. Por favor, inténtelo de nuevo.', 'error');
          return throwError(error);
        })
      );
  }

  // Editar un restaurante
  editarRestaurante(idRestaurante: string, restauranteEditado: any): Observable<any> {
    const url = `${this.apiUrl}/editar/${idRestaurante}`;
    return this.http.put(url, restauranteEditado)
      .pipe(
        catchError((error: any) => {
          console.error('Error al editar restaurante', error);
          Swal.fire('Error', 'Hubo un problema al editar el restaurante. Por favor, inténtelo de nuevo.', 'error');
          return throwError(error);
        })
      );
  }

  // Desactivar un restaurante
  desactivarRestaurante(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/desactivar/${id}`, null)
      .pipe(
        catchError((error: any) => {
          console.error('Error al desactivar restaurante', error);
          Swal.fire('Error', 'Hubo un problema al desactivar el restaurante. Por favor, inténtelo de nuevo.', 'error');
          return throwError(error);
        })
      );
  }

  // Restaurar un restaurante
  restaurarRestaurante(id: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/restaurar/${id}`, null)
      .pipe(
        catchError((error: any) => {
          console.error('Error al restaurar restaurante', error);
          Swal.fire('Error', 'Hubo un problema al restaurar el restaurante. Por favor, inténtelo de nuevo.', 'error');
          return throwError(error);
        })
      );
  }
}
