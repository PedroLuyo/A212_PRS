import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { AuthService } from '../auth/authService';

@Injectable({
  providedIn: 'root'
})
export class RestauranteService {
  private apiUrl = 'http://localhost:8090/api/v1/restaurants';
  private apiAngelo = 'http://localhost:8090/v1/api/restaurants';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private handleRequest<T>(request: Observable<T>): Observable<T> {
    return request.pipe(
      catchError((error: any) => {  
        console.error('Error en la primera API', error);
        //Swal.fire('Error', 'Hubo un problema al comunicarse con la primera API. Intentando con la segunda API.', 'warning');
        return throwError(error);
      })
    );
  }

  private async agregarRucYDocid(restaurante: any): Promise<any> {
    // Suponiendo que obtienes el RUC y docID de alguna fuente, por ejemplo AuthService
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    try {
      // Aquí agregas el RUC y docID antes de realizar la solicitud
       restaurante.ruc = await this.authService.getUserRUC();
       restaurante.docid = await this.authService.getUserUid();
      return restaurante;
    } catch (error) {
      console.error('Error al obtener RUC y docID', error);
      Swal.fire('Error', 'Hubo un problema al obtener el RUC y el docID.', 'error');
      throw error;
    }
  }


  obtenerRestaurantePorId(id: number) {
    return this.http.get(`${this.apiUrl}/listar/${id}`);
  }
  
  // Obtener todos los restaurantes
  obtenerTodos(): Observable<any[]> {
    return this.handleRequest(this.http.get<any[]>(`${this.apiUrl}/listar`))
      .pipe(
        catchError(() => this.http.get<any[]>(`${this.apiAngelo}/listar`)
          .pipe(
            catchError((error: any) => {
              console.error('Error al obtener restaurantes', error);
              return throwError(error);
            })
          )
        )
      );
  }

  // Crear un restaurante
  crearRestaurante(restaurante: any): Observable<any> {
    return new Observable<any>(observer => {
      this.agregarRucYDocid(restaurante)
        .then(restauranteConRucYDocid => {
          const headers = new HttpHeaders({
            'Content-Type': 'application/json'
          });
          this.http.post<any>(`${this.apiUrl}/crear`, restauranteConRucYDocid, { headers })
            .pipe(
              catchError((error: any) => {
                console.error('Error al crear restaurante en apiUrl', error);
                // Intenta con la segunda API si falla la primera
                return this.http.post<any>(`${this.apiAngelo}/crear`, restauranteConRucYDocid, { headers })
                  .pipe(
                    catchError((secondError: any) => {
                      console.error('Error al crear restaurante en apiAngelo', secondError);
                      Swal.fire('Error', 'Hubo un problema al crear el restaurante. Por favor, inténtelo de nuevo.', 'error');
                      return throwError(secondError);
                    })
                  );
              })
            )
            .subscribe(
              response => observer.next(response),
              error => observer.error(error),
              () => observer.complete()
            );
        })
        .catch(error => observer.error(error));
    });
  }

  // Editar un restaurante
  editarRestaurante(idRestaurante: string, restauranteEditado: any): Observable<any> {
    return new Observable<any>(observer => {
      this.agregarRucYDocid(restauranteEditado)
        .then(restauranteEditadoConRucYDocid => {
          this.http.put<any>(`${this.apiUrl}/editar/${idRestaurante}`, restauranteEditadoConRucYDocid)
            .pipe(
              catchError((error: any) => {
                console.error('Error al editar restaurante en apiUrl', error);
                // Intenta con la segunda API si falla la primera
                return this.http.put<any>(`${this.apiAngelo}/editar/${idRestaurante}`, restauranteEditadoConRucYDocid)
                  .pipe(
                    catchError((secondError: any) => {
                      console.error('Error al editar restaurante en apiAngelo', secondError);
                      Swal.fire('Error', 'Hubo un problema al editar el restaurante. Por favor, inténtelo de nuevo.', 'error');
                      return throwError(secondError);
                    })
                  );
              })
            )
            .subscribe(
              response => observer.next(response),
              error => observer.error(error),
              () => observer.complete()
            );
        })
        .catch(error => observer.error(error));
    });
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
