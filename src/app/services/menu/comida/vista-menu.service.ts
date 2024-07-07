import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ComidaVista } from '../../../models/menu/comida/comida-vista';
@Injectable({
  providedIn: 'root'
})
export class VistaMenuService {
  
  private apiUrl = 'http://localhost:8080/api/v1/menu/seleccion';

  constructor(private http: HttpClient) {}

  getNombresMenu(): Observable<ComidaVista[]> {
    return this.http.get<ComidaVista[]>(this.apiUrl);
  }

  getComidasPorMenu(nombremenu: string): Observable<ComidaVista[]> {
    // Ajusta la URL para usar el menuid
    return this.http.get<ComidaVista[]>(`${this.apiUrl}/${nombremenu}`);
  }
}