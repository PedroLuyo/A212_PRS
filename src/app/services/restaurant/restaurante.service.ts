import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class RestauranteService {
  private apiUrl = 'https://8090-vallegrande-msrestauran-k3alf07vtnw.ws-us115.gitpod.io/api/restaurants/v1';
  private apiAngelo = 'http://localhost:8090/api/restaurants/v1';

  constructor(private http: HttpClient) { }

  private handleRequest<T>(request: Observable<T>): Observable<T> {
    return request.pipe(
      catchError((error: any) => {  
        console.error('Error en la primera API', error);
        //Swal.fire('Error', 'Hubo un problema al comunicarse con la primera API. Intentando con la segunda API.', 'warning');
        return throwError(error);
      })
    );
  }

  
  // Obtener todos los restaurantes
  obtenerTodos(): Observable<any[]> {
    return this.handleRequest(this.http.get<any[]>(`${this.apiUrl}/listar`))
      .pipe(
        catchError(() => this.http.get<any[]>(`${this.apiAngelo}/listar`)
          .pipe(
            catchError((error: any) => {
              console.error('Error al obtener restaurantes', error);
              Swal.fire('Error', 'Hubo un problema al obtener los restaurantes. Por favor, inténtelo de nuevo.', 'error');
              return throwError(error);
            })
          )
        )
      );
  }

  // Crear un restaurante
  crearRestaurante(restaurante: any): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.handleRequest(this.http.post<any>(`${this.apiUrl}/crear`, restaurante, { headers }))
      .pipe(
        catchError(() => this.http.post<any>(`${this.apiAngelo}/crear`, restaurante, { headers })
          .pipe(
            catchError((error: any) => {
              console.error('Error al crear restaurante', error);
              Swal.fire('Error', 'Hubo un problema al crear el restaurante. Por favor, inténtelo de nuevo.', 'error');
              return throwError(error);
            })
          )
        )
      );
  }

  // Editar un restaurante
  editarRestaurante(idRestaurante: string, restauranteEditado: any): Observable<any> {
    const url = `${this.apiUrl}/editar/${idRestaurante}`;
    return this.handleRequest(this.http.put(url, restauranteEditado))
      .pipe(
        catchError(() => this.http.put(`${this.apiAngelo}/editar/${idRestaurante}`, restauranteEditado)
          .pipe(
            catchError((error: any) => {
              console.error('Error al editar restaurante', error);
              Swal.fire('Error', 'Hubo un problema al editar el restaurante. Por favor, inténtelo de nuevo.', 'error');
              return throwError(error);
            })
          )
        )
      );
  }

  // Desactivar un restaurante
  desactivarRestaurante(id: string): Observable<any> {
    return this.handleRequest(this.http.put<any>(`${this.apiUrl}/desactivar/${id}`, null))
      .pipe(
        catchError(() => this.http.put<any>(`${this.apiAngelo}/desactivar/${id}`, null)
          .pipe(
            catchError((error: any) => {
              console.error('Error al desactivar restaurante', error);
              Swal.fire('Error', 'Hubo un problema al desactivar el restaurante. Por favor, inténtelo de nuevo.', 'error');
              return throwError(error);
            })
          )
        )
      );
  }

  // Restaurar un restaurante
  restaurarRestaurante(id: string): Observable<any> {
    return this.handleRequest(this.http.put<any>(`${this.apiUrl}/restaurar/${id}`, null))
      .pipe(
        catchError(() => this.http.put<any>(`${this.apiAngelo}/restaurar/${id}`, null)
          .pipe(
            catchError((error: any) => {
              console.error('Error al restaurar restaurante', error);
              Swal.fire('Error', 'Hubo un problema al restaurar el restaurante. Por favor, inténtelo de nuevo.', 'error');
              return throwError(error);
            })
          )
        )
      );
  }
}
