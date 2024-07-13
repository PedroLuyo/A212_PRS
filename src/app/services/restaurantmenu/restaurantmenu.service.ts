import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RestauranteMenuService {

  private apiUrl = 'http://localhost:8086/api/v1/products';
  private apiUrlAngelo = 'http://35.188.205.186:8086/api/v1/products';
  
  constructor(private http: HttpClient) { }

  getPlatos(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/obtener`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Error al conectar con la API primaria: ${error.message}. Intentando con la API de Angelo.`);
        return this.http.get<any>(`${this.apiUrlAngelo}/obtener`);
      })
    );  
  }

  getMenus(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/obtener/menus`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Error al conectar con la API primaria: ${error.message}. Intentando con la API de Angelo.`);
        return this.http.get<any>(`${this.apiUrlAngelo}/obtener/menus`);
      })
    );  
  }

  getCartas(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/obtener/cartas`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Error al conectar con la API primaria: ${error.message}. Intentando con la API de Angelo.`);
        return this.http.get<any>(`${this.apiUrlAngelo}/obtener/cartas`);
      })
    );  
  }

  // Nueva función para obtener cartas por RUC
  obtenerCartasPorRuc(ruc: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/obtener/cartas/${ruc}`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Error al conectar con la API primaria: ${error.message}. Intentando con la API de Angelo.`);
        return this.http.get<any>(`${this.apiUrlAngelo}/obtener/cartas/${ruc}`);
      })
    );  
  }

  // Nueva función para obtener menús por RUC
  obtenerMenusPorRuc(ruc: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/obtener/menus/${ruc}`).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error(`Error al conectar con la API primaria: ${error.message}. Intentando con la API de Angelo.`);
        return this.http.get<any>(`${this.apiUrlAngelo}/obtener/menus/${ruc}`);
      })
    );  
  }
}
