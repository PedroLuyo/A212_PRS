import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { from, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { AuthService } from '../auth/authService';

@Injectable({
  providedIn: 'root'
})
export class RestauranteService {
  private apiUrl = 'http://localhost:8090/api/v1/restaurants';
  private apiAngelo = 'http://ms-restaurant-service:8090/v1/api/restaurants';

  constructor(private http: HttpClient, private authService: AuthService) { }

  private handleRequest(request: Observable<any>): Observable<any> {
    return request.pipe(
      catchError((error: any) => {
        console.error('Error en la primera API', error);
        return throwError(error);
      })
    );
  }

  private async agregarDocid(restaurante: any): Promise<any> {
    try {
      restaurante.docid = await this.authService.getUserUid();
      return restaurante;
    } catch (error) {
      console.error('Error al obtener docID', error);
      Swal.fire('Error', 'Hubo un problema al obtener el docID.', 'error');
      throw error;
    }
  }


  obtenerRestaurantePorId(id: number) {
    return this.http.get(`${this.apiUrl}/listar/${id}`);
  }
  
  
  obtenerTodosPorGestor(): Observable<any[]> {
    return from(this.authService.getUserUid()).pipe(
      switchMap(docid => {
        const url = `${this.apiUrl}/listar/docid/${docid}`;
        return this.handleRequest(this.http.get<any[]>(url)).pipe(
          catchError(async () => {
            console.error('Error al obtener restaurantes con docid, intentando con otra API.');
            const docid = await this.authService.getUserUid();
            return this.handleRequest(this.http.get<any[]>(`${this.apiAngelo}/listar/docid/${docid}`));
          })
        );
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
              return throwError(error);
            })
          )
        )
      );
  }

  // Crear un restaurante
  crearRestaurante(restaurante: any): Observable<any> {
    return new Observable<any>(observer => {
      this.agregarDocid(restaurante)
        .then(restauranteConDocid  => {
          const headers = new HttpHeaders({
            'Content-Type': 'application/json'
          });
          this.http.post<any>(`${this.apiUrl}/crear`, restauranteConDocid , { headers })
            .pipe(
              catchError((error: any) => {
                console.error('Error al crear restaurante en apiUrl', error);
                // Intenta con la segunda API si falla la primera
                return this.http.post<any>(`${this.apiAngelo}/crear`, restauranteConDocid , { headers })
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
      this.agregarDocid(restauranteEditado)
        .then(restauranteConDocid  => {
          this.http.put<any>(`${this.apiUrl}/editar/${idRestaurante}`, restauranteConDocid)
            .pipe(
              catchError((error: any) => {
                console.error('Error al editar restaurante en apiUrl', error);
                // Intenta con la segunda API si falla la primera
                return this.http.put<any>(`${this.apiAngelo}/editar/${idRestaurante}`, restauranteConDocid)
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

  verificarRucExistente(ruc: string): Observable<boolean> {
    return this.obtenerTodos().pipe(
      map(restaurantes => {
        console.log('Restaurantes obtenidos:', restaurantes);
        const existe = restaurantes.some(r => r.ruc.toString() === ruc);
        console.log(`RUC ${ruc} existe: ${existe}`);
        return existe;
      })
    );
  }
}
