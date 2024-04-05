import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PlatosService {

  private apiUrl = 'http://localhost:8086/api/v1/prs/plato-carta/obtener';

  constructor(private http: HttpClient) { }

  getPlatos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(response => response.map(this.mapToProductosItem))
    );
  }

  private mapToProductosItem(item: any): any {
    return {
      id: item.id,
      nombre: item.nombre,
      descripcion: item.descripcion,
      precio: item.precio,
      categoria_detalle: item.categoria_detalle,
      presentacion_detalle: item.presentacion_detalle,
      stock: item.stock,
      estado: item.estado
    };
  }
}
