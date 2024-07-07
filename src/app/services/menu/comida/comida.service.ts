// comida.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable,forkJoin  } from 'rxjs';
import { Comida } from '../../../models/menu/comida/comida';
import { map } from 'rxjs/operators';
import Swal from 'sweetalert2';


@Injectable({
  providedIn: 'root'
})
export class ComidaService {
  private apiUrl = 'http://localhost:8080/api/v1/comida';

  constructor(private http: HttpClient) {}
  
  getAllComida(): Observable<Comida[]> {
    return this.http.get<Comida[]>(`${this.apiUrl}/obtener`).pipe(
      map(comidas => comidas.sort((a, b) => b.comidaid - a.comidaid))
    );
  }

  getComidasByEstado(estado: string): Observable<Comida[]> {
    return this.http.get<Comida[]>(`${this.apiUrl}/obtener/${estado}`).pipe(
      map(comidas => comidas.sort((a, b) => b.comidaid - a.comidaid))
    );
  }

  getComidaById(comidaid: number): Observable<Comida> {
    return this.http.get<Comida>(`${this.apiUrl}/${comidaid}`);
  }

  eliminarComida(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/eliminar/${id}`, {});
  }

  restaurarComida(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/restaurar/${id}`, {});
  }

  editarComida(id: number, comida: Comida): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/editar/${id}`, comida);
  }

  crearComida(comida: Comida): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/crear`, comida);
  }

  getComidaIdByNombre(nombre: string): Observable<number> {
    return this.http.get<Comida>(`${this.apiUrl}/obtener/nombre/${nombre}`).pipe(
      map(comida => comida.comidaid)
    );
  }

  getAllComidaMap(): Observable<Map<number, string>> {
    return this.getAllComida().pipe(
      map(comidas => {
        const comidasMap = new Map<number, string>();
        comidas.forEach(comida => comidasMap.set(comida.comidaid, comida.nombrec));
        return comidasMap;
      })
    );
  }
}
