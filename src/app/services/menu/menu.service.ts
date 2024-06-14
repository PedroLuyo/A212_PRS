// menu.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Menu } from '../../models/menu/menu';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = 'http://localhost:8080/api/menus';

  constructor(private http: HttpClient) {}

  getAllMenu(): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.apiUrl}/findAll`);
  }

  getMenusByEstado(estado: string): Observable<Menu[]> {
    return this.http.get<Menu[]>(`${this.apiUrl}/findByEstado/${estado}`);
  }

  getMenusLocalStorage(): Menu[] {
    const menusStr = localStorage.getItem('menus');
    return menusStr ? JSON.parse(menusStr) : [];
  }

  setMenusLocalStorage(menus: Menu[]): void {
    localStorage.setItem('menus', JSON.stringify(menus));
  }

  eliminarMenu(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/eliminar`, {});
  }

  restaurarMenu(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}/restaurar`, {});
  }

  editarMenu(id: number, menu: Menu): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, menu);
  }

  crearMenu(menu: Menu): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}`, menu);
  }
}
