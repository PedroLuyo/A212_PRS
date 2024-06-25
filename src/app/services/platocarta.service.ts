import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PlatocartaService {

  private ApiUrl = 'https://8086-vallegrande-msrestauran-jr8yds39xxz.ws-us114.gitpod.io/api/v1/products/obtener';
  private ApiUrlAngelo = 'http://localhost:30002/api/v1/products/obtener';
  
  constructor(private http: HttpClient) { }

  getPlatosCarta(): Observable<any> {
    return this.http.get<any>(this.ApiUrl).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si falla la primera URL, intenta con la segunda
        console.error(`Error al conectar con la API primaria: ${error.message}. Intentando con la API de Angelo. `);
        return this.http.get<any>(this.ApiUrlAngelo);
      })
    );  
  }
 
  logPlatosCarta(): void {
    this.getPlatosCarta().subscribe(platos => console.log(platos));
  }

  getFilteredPlatos(searchTerm: string): Observable<any> {
    return this.http.get<any>(`${this.ApiUrl}?search=${searchTerm}`).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si falla la primera URL, intenta con la segunda
        console.error(`Error al conectar con la API primaria: ${error.message}. Intentando con la API de Angelo.`);
        return this.http.get<any>(`${this.ApiUrlAngelo}?search=${searchTerm}`);
      })
    );
  } 
}