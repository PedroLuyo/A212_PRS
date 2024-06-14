import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReservaDetalle } from '../../models/menu/reserva-detalle';

@Injectable({
  providedIn: 'root'
})
export class ReservaDetalleService {

  private baseUrl = 'http://localhost:8080/reservaDetalle';

  constructor(private http: HttpClient) { }

  getReservaDetalleList(): Observable<any> {
    return this.http.get(`${this.baseUrl}/findAll`);
  }

  // Añadir una nueva reserva
  createReservaDetalle(reservaDetalle: ReservaDetalle): Observable<ReservaDetalle> {
    return this.http.post<ReservaDetalle>(`${this.baseUrl}/add`, reservaDetalle);
  }

  // Actualizar una reserva existente
  updateReservaDetalle(id: number, reservaDetalle: ReservaDetalle): Observable<ReservaDetalle> {
    return this.http.put<ReservaDetalle>(`${this.baseUrl}/update/${id}`, reservaDetalle);
  }

  // Eliminar una reserva
  deleteReservaDetalle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  } 
}
