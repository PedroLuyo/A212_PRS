import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GestorService {
  private apiUrl = 'https://8090-vallegrande-msrestauran-ruo73ga67f5.ws-us114.gitpod.io/api/v1/gestor'; // Reemplaza con tu URL de la API
  getGestores: any;
  gestores: any[] = [];

  constructor(private http: HttpClient) { }

  obtenerGestores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/obtener`);
  }

  obtenerGestorPorId(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/obtener/${id}`);
  }

  crearGestor(gestor: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/crear`, gestor);
  }

  editarGestor(id: number, gestor: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/editar/${id}`, gestor);
  }

  desactivarGestor(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/desactivar/${id}`, null);
  }

  restaurarGestor(id: number): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/restaurar/${id}`, null);
  }
}
