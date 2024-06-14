// comida.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,forkJoin  } from 'rxjs';
import { Comida } from '../../models/menu/comida';
@Injectable({
  providedIn: 'root'
})
export class ComidaService {
  private apiUrl = 'http://localhost:8080/api/comida';

  constructor(private http: HttpClient) {}
  
  getAllComida(): Observable<Comida[]> {
    return this.http.get<Comida[]>(`${this.apiUrl}/findAll`);
  }

  getComidasByEstado(estado: string): Observable<Comida[]> {
    return this.http.get<Comida[]>(`${this.apiUrl}/findByEstado/${estado}`);
  }

  eliminarComida(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/eliminar`, {});
  }

  restaurarComida(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/restaurar`, {});
  }

  editarComida(id: number, comida: Comida): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, comida);
  }

  crearComida(comida: Comida): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}`, comida);
  }
}
