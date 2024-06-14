import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ComidaVista } from '../../models/menu/comida-vista';
@Injectable({
  providedIn: 'root'
})
export class VistaMenuService {
  
  private apiUrl = 'http://localhost:8080/api/vista-menu-comida';

  constructor(private http: HttpClient) {}

  getNombresMenu(): Observable<ComidaVista[]> {
    return this.http.get<ComidaVista[]>(this.apiUrl);
  }

  getComidasPorMenu(nombreMenu: string): Observable<ComidaVista[]> {
    return this.http.get<ComidaVista[]>(`${this.apiUrl}/${nombreMenu}`);
  }
}