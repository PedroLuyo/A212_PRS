import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private readonly baseUrl = 'http://localhost:9095/api/v1/plato-carta';
  private readonly baseUrlPresentacion = 'http://localhost:9095/api/v1/presentacion';
  private readonly baseUrlCategoria = 'http://localhost:9095/api/v1/categoria';
  private readonly estadoActivo = 'A';
  private readonly estadoInactivo = 'I';

  platos: any[] = [];
  presentaciones: any[] = [];
  categorias: any[] = [];

  constructor(private http: HttpClient) { }

  generarReportePDF(platos: any[]): void {
    const doc = new jsPDF({
      orientation: 'landscape'
    });

    const img = new Image();
    img.src = 'assets/img/Logo Transparente Gastro Connect.png';
    img.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const logoWidth = pageWidth * 0.2;
      const logoHeight = img.height * (logoWidth / img.width);
      const logoX = (pageWidth - logoWidth) / 2;
      doc.addImage(img, 'PNG', logoX, 10, logoWidth, logoHeight);

      const slogan = "Disfruta de la mejor gastronomía con Gastro Connect";
      const sloganX = pageWidth / 2;
      const sloganY = logoHeight + 20;
      doc.setTextColor(31, 30, 30);
      doc.setFontSize(12);
      doc.text(slogan, sloganX, sloganY, { align: 'center' });

      const fecha = new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).replace(/ /g, '/').replace(/\//g, '-');

      doc.setFont('courier', 'bold');
      doc.setFontSize(20);
      const titulo = 'Reporte de Productos';
      const tituloY = sloganY + 20;
      doc.text(titulo, 14, tituloY);

      doc.setFontSize(12);
      const fechaX = pageWidth - 14;
      doc.text(`Fecha: ${fecha}`, fechaX, tituloY, { align: 'right' });

      const head = [['ID', 'Nombre', 'Descripción', 'Precio', 'Categoría', 'Presentación', 'Stock', 'Estado']];
      const data = platos.map((plato) => [
        plato.id,
        plato.nombre,
        plato.descripcion,
        plato.precio,
        this.getNombreCategoria(plato.id_categoria),
        this.getTipoPresentacion(plato.id_presentacion),
        plato.stock,
        plato.estado === 'A' ? 'Activo' : 'Inactivo'
      ]);

      (doc as any).autoTable({
        head: head,
        body: data,
        startY: tituloY + 20,
        styles: {
          cellWidth: 'auto',
          fontSize: 10,
          lineColor: [0, 0, 0],
          lineWidth: 0.1
        },
        headStyles: {
          fillColor: [0, 0, 0],
          textColor: 255,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fillColor: [255, 255, 255],
          textColor: 0
        },
        alternateRowStyles: {
          fillColor: [235, 235, 235]
        }
      });

      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFont('courier', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(31, 30, 30);
        const pageNumberText = `Página ${i}`;
        const pageSize = doc.internal.pageSize;
        const pageWidth = pageSize.getWidth();
        const pageHeight = pageSize.getHeight();
        const footerY = pageHeight - 10;
        doc.text(pageNumberText, pageWidth - doc.getTextWidth(pageNumberText) - 10, footerY);
      }

      doc.save('reporte_productos.pdf');
    };
  }

  private getNombreCategoria(idCategoria: number): string {
    const categoria = this.categorias.find(c => c.id === idCategoria);
    return categoria ? categoria.nombre : '';
  }

  private getTipoPresentacion(idPresentacion: number): string {
    const presentacion = this.presentaciones.find(p => p.id === idPresentacion);
    return presentacion ? presentacion.tipo : '';
  }

  getPresentacionesActivas() {
    return this.http.get(this.baseUrlPresentacion + '/obtener/activo');
  }

  getCategoriasActivas() {
    return this.http.get(this.baseUrlCategoria + '/obtener/activo');
  }

  getPlatos(filtroPlatos: string = '') {
    let url = `${this.baseUrl}/obtener`;

    if (filtroPlatos) {
      url += filtroPlatos;
    }

    url += '?sort=-id';

    return this.http.get(url);
  }

  crearPlato(plato: any) {
    return this.http.post(`${this.baseUrl}/crear`, plato);
  }

  actualizarPlato(id: number, plato: any) {
    return this.http.put(`${this.baseUrl}/editar/${id}`, plato);
  }

  desactivarPlato(id: number) {
    return this.http.patch(`${this.baseUrl}/desactivar/${id}`, {});
  }

  restaurarPlato(id: number) {
    return this.http.patch(`${this.baseUrl}/restaurar/${id}`, {});
  }
}
