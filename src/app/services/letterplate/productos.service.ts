import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private readonly baseUrl = 'http://localhost:9095/api/v1/plato-carta';
  private readonly baseUrlPresentacion = 'http://localhost:9095/api/v1/presentacion';
  private readonly baseUrlCategoria = 'http://localhost:9095/api/v1/categoria';

  constructor(private http: HttpClient) { }

  getPlatos(estado: string): Observable<any> {
    let url = `${this.baseUrl}/obtener`;
    if (estado) {
      url += `${estado}`;
    }
    url += '?sort=-id';
    return this.http.get(url);
  }

  getCategoriasActivas(): Observable<any> {
    return this.http.get(this.baseUrlCategoria + '/obtener/activo');
  }

  getPresentacionesActivas(): Observable<any> {
    return this.http.get(this.baseUrlPresentacion + '/obtener/activo');
  }

  crearPlato(plato: any): Observable<any> {
    const url = `${this.baseUrl}/crear`;
    return this.http.post(url, plato);
  }

  actualizarPlato(id: number, plato: any): Observable<any> {
    const url = `${this.baseUrl}/editar/${id}`;
    return this.http.put(url, plato);
  }

  desactivarPlato(id: number): Observable<any> {
    const url = `${this.baseUrl}/desactivar/${id}`;
    return this.http.patch(url, {});
  }

  restaurarPlato(id: number): Observable<any> {
    const url = `${this.baseUrl}/restaurar/${id}`;
    return this.http.patch(url, {});
  }
}
