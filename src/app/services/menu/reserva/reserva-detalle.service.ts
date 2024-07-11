import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ReservaDto } from '../../../models/menu/reserva/reserva';
import { ReservaRequestDto } from '../../../models/menu/reserva/reversarequest';
import { ReservaDetalleDto } from '../../../models/menu/reserva/reversarequest';

@Injectable({
  providedIn: 'root'
})
export class ReservaDetalleService {


  private baseUrl = 'https://8080-vallegrande-msmenuplate-a11ap7qojus.ws-us115.gitpod.io/api/v1/reserva';

  constructor(private http: HttpClient) { }

  // Métodos para la tabla reserva
  getAllReservas(): Observable<ReservaDto[]> {
    return this.http.get<ReservaDto[]>(`${this.baseUrl}/obtener`);
  }

  getReservaById(id_reserva: number): Observable<ReservaDto> {
    return this.http.get<ReservaDto>(`${this.baseUrl}/obtener/${id_reserva}`);
  }

  getReservasByEstado(estado: string): Observable<ReservaDto[]> {
    return this.http.get<ReservaDto[]>(`${this.baseUrl}/obtener/estado/${estado}`);
  }

  editarReserva(id: number, reservaDto: ReservaDto): Observable<ReservaDto> {
    return this.http.put<ReservaDto>(`${this.baseUrl}/editar/${id}`, reservaDto);
  }

  desactivarReserva(id_reserva: number): Observable<ReservaDto> {
    return this.http.put<ReservaDto>(`${this.baseUrl}/desactivar/${id_reserva}`, null);
  }

  restaurarReserva(id_reserva: number): Observable<ReservaDto> {
    return this.http.put<ReservaDto>(`${this.baseUrl}/restaurar/${id_reserva}`, null);
  }

  getReservasBySituacion(situacion: string): Observable<ReservaDto[]> {
    return this.http.get<ReservaDto[]>(`${this.baseUrl}/obtener/situacion/${situacion}`).pipe(
      map(reservas => reservas.sort((a, b) => b.id_reserva - a.id_reserva))
    );  }




  // Métodos para reservas anidadas
  getAllReservasWithDetails(): Observable<ReservaDto[]> {
    return this.http.get<ReservaDto[]>(`${this.baseUrl}/transaccional-reserva/obtener`);
  }

  getReservaWithDetails(id_reserva: number): Observable<ReservaDto> {
    return this.http.get<ReservaDto>(`${this.baseUrl}/transaccional-reserva/obtener/${id_reserva}`);
  }

  getReservasWithDetailsByEstado(estado: string): Observable<ReservaDto[]> {
    return this.http.get<ReservaDto[]>(`${this.baseUrl}/transaccional-reserva/obtener/estado/${estado}`);
  }

  crearReserva(reservaRequestDto: ReservaRequestDto): Observable<ReservaDto> {
    return this.http.post<ReservaDto>(`${this.baseUrl}/transaccional-reserva/crear`, reservaRequestDto);
  }

  anularReserva(id_reserva: number): Observable<ReservaDto> {
    return this.http.post<ReservaDto>(`${this.baseUrl}/transaccional-reserva/anular/${id_reserva}`, null);
  }

  confirmarReserva(id_reserva: number): Observable<ReservaDto> {
    return this.http.post<ReservaDto>(`${this.baseUrl}/transaccional-reserva/confirmar/${id_reserva}`, null);
  }





  getAllReservasDetalles(): Observable<ReservaDetalleDto[]> {
    return this.http.get<ReservaDetalleDto[]>(`${this.baseUrl}/reserva-detalle/obtener`);
  }
  getReservasDetallesById(id: number): Observable<ReservaDetalleDto | null> {
    return this.http.get<ReservaDetalleDto>(`${this.baseUrl}/reserva-detalle/obtener/${id}`);
  }
  
  

  editarReservaDetalle(id: number, reservaDetalleDto: ReservaDetalleDto): Observable<ReservaDetalleDto> {
    return this.http.put<ReservaDetalleDto>(`${this.baseUrl}/reserva-detalle/editar/${id}`, reservaDetalleDto);
  }

  desactivarReservaDetalle(id: number): Observable<ReservaDetalleDto> {
    return this.http.put<ReservaDetalleDto>(`${this.baseUrl}/reserva-detalle/desactivar/${id}`, null);
  }

  restaurarReservaDetalle(id: number): Observable<ReservaDetalleDto> {
    return this.http.put<ReservaDetalleDto>(`${this.baseUrl}/reserva-detalle/restaurar/${id}`, null);
  }



  

}