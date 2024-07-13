import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import { catchError } from 'rxjs/operators';
import { from, Observable, throwError } from 'rxjs';
import { CloudinaryService } from '../../../services/cloudinary/Cloudinary.service';
import { AuthService } from '../../../services/auth/authService';

import * as XLSX from 'xlsx';
import { RestauranteService } from '../../../services/restaurant/restaurante.service';

@Component({
  selector: 'app-productos',
  templateUrl: './productos.component.html',
  styleUrls: ['./productos.component.css']
})
export class ProductosComponent implements OnInit {
  private readonly baseUrl = 'http://localhost:9095/api/v1';

  platos: any[] = [];
  plato: any = {};
  modoEdicion = false;
  filtroEstado: string = 'A';

  presentaciones: any[] = [];
  categorias: any[] = [];

  totalPlatos: number = 0;
  page: number = 1;

  totalidad: number = 0;
  platosFiltrados: any[] = [];
  errorAlCargar = false;

  selectedFile: File | undefined;

  restaurantes: any[] = [];
  selectedRestauranteRuc: string = '';
  restauranteSeleccionado: boolean = false;


  constructor(private http: HttpClient,
    private cloudinaryService: CloudinaryService,
    private authService: AuthService,
    private restauranteService: RestauranteService

  ) { }

  async ngOnInit() {
    await this.getRestaurantesDelUsuario(); // Espera a que se obtengan los restaurantes
    this.getCategoriasActivas();
    this.getPresentacionesActivas();
    this.gettotalidad();
  }


  // Método para capturar el evento de selección de archivo
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0]; // Obtener el archivo seleccionado del evento
    this.uploadImageToCloudinary(); // Llamar al método para subir la imagen a Cloudinary
  }


  // Método para subir la imagen a Cloudinary y actualizar el campo image del plato
  uploadImageToCloudinary() {
    if (!this.selectedFile) {
      console.error('No se ha seleccionado ningún archivo.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('upload_preset', 'cloudinary-letterplates');

    this.cloudinaryService.uploadImg(formData).pipe(
      catchError(error => {
        console.error('Error al subir imagen a Cloudinary:', error);
        Swal.fire('¡Error!', 'Error al subir imagen a Cloudinary.', 'error');
        return throwError('Error al subir imagen a Cloudinary.');
      })
    ).subscribe(
      (response: any) => {
        if (response && response.secure_url) {
          console.log('Imagen subida a Cloudinary:', response.secure_url);
          this.plato.image = response.secure_url; // Asigna la URL de la imagen al objeto plato
          // Aquí puedes manejar la URL de la imagen subida
        } else {
          console.error('Respuesta no válida de Cloudinary:', response);
          Swal.fire('¡Error!', 'Respuesta no válida de Cloudinary.', 'error');
        }
      },
      error => {
        console.error('Error al subir imagen a Cloudinary:', error);
        Swal.fire('¡Error!', 'Error al subir imagen a Cloudinary.', 'error');
      }
    );
  }



  buscarPlatos(event: Event) {
    const termino = (event.target as HTMLInputElement).value;
    // Filtrar platos según el término de búsqueda
    this.platosFiltrados = this.platos.filter(plato =>
      plato.nombre.toLowerCase().includes(termino.toLowerCase())
    );
  }




  getNombreCategoria(idCategoria: number): string {
    const categoria = this.categorias.find(c => c.id === idCategoria);
    return categoria ? categoria.nombre : '';
  }

  getTipoPresentacion(idPresentacion: number): string {
    const presentacion = this.presentaciones.find(p => p.id === idPresentacion);
    return presentacion ? presentacion.tipo : '';
  }

  getPresentacionesActivas() {
    this.http.get(`${this.baseUrl}/presentacion/obtener/ruc/${this.selectedRestauranteRuc}`).subscribe(
      (data: any) => {
        this.presentaciones = data;
      },
      (error) => {
        console.error('Error al obtener presentaciones:', error);
      }
    );
  }

  getCategoriasActivas() {
    this.http.get(`${this.baseUrl}/categoria/obtener/ruc/${this.selectedRestauranteRuc}`).subscribe(
      (data: any) => {
        this.categorias = data;
      },
      (error) => {
        console.error('Error al obtener categorías:', error);
      }
    );
  }

  gettotalidad() {
    from(this.authService.getUserRUC()).subscribe({
      next: (ruc: string) => {
        let url = `${this.baseUrl}/plato-carta/obtener/ruc/${ruc}`;

        this.http.get(url).pipe(
          catchError((error: any) => {
            console.error('Error al obtener platos:', error);
            return throwError(error);
          })
        ).subscribe({
          next: (data: any) => {
            this.totalidad = data.length;
          },
          error: (error: any) => {
            console.error('Error al obtener platos:', error);
          }
        });
      },
      error: (error: any) => {
        console.error('Error al obtener el RUC del usuario:', error);
      }
    });
  }

  aplicarFiltros() {
    this.platosFiltrados = this.platos.filter(plato => {
      const cumpleFiltroEstado = this.filtroEstado === 'todos' || plato.estado === this.filtroEstado;
      return cumpleFiltroEstado;
    });
    this.totalPlatos = this.platosFiltrados.length;
  }
  
  cambiarFiltroEstado() {
    this.page = 1;
    this.aplicarFiltros();
  }
  
  cambiarFiltroRestaurante() {
    this.page = 1;
    if (this.selectedRestauranteRuc) {
      this.restauranteSeleccionado = true;
      this.getPlatos();
      this.getPresentacionesActivas();
      this.getCategoriasActivas();
    } else {
      this.restauranteSeleccionado = false;
      this.platos = [];
      this.platosFiltrados = [];
      this.totalPlatos = 0;
      this.presentaciones = [];
      this.categorias = [];
    }
  }

  


  getRestaurantesDelUsuario() {
    this.authService.getUserUid().then(uid => {
      this.restauranteService.obtenerTodosPorGestor().subscribe(
        restaurantes => {
          this.restaurantes = restaurantes;
          // No seleccionamos ningún restaurante por defecto
        },
        error => {
          console.error('Error al obtener restaurantes:', error);
          this.errorAlCargar = true;
        }
      );
    });
  }


 


  getPlatos() {
    if (!this.selectedRestauranteRuc) {
      console.error('No hay restaurante seleccionado');
      return;
    }

    this.authService.getUserUid().then(uid => {
      let url = `${this.baseUrl}/plato-carta/obtener/uid/${uid}`;
      if (this.filtroEstado === 'A' || this.filtroEstado === 'I') {
        url += `/estado/${this.filtroEstado}`;
      }
      this.http.get(url).subscribe({
        next: (data: any) => {
          this.platos = data.filter((plato: any) => plato.ruc === this.selectedRestauranteRuc);
          this.totalPlatos = this.platos.length;
          this.platosFiltrados = this.platos;
          this.errorAlCargar = false;
        },
        error: (error: any) => {
          console.error('Error al obtener platos:', error);
          this.errorAlCargar = true;
        }
      });
    });
  }

  guardarPlato() {
    this.authService.getUserUid().then(uid => {
      this.plato.uid = uid;
      this.plato.ruc = this.selectedRestauranteRuc;
      if (this.modoEdicion) {
        this.actualizarPlato();
      } else {
        this.crearPlato();
      }
    });
  }

  crearPlato() {
    this.plato.estado = 'A';
    this.http.post(`${this.baseUrl}/plato-carta/crear`, this.plato).subscribe(
      (response) => {
        console.log('Plato creado:', response);
        Swal.fire('¡Éxito!', 'El plato ha sido creado exitosamente.', 'success');
        this.getPlatos();
        this.resetPlatoForm();
      },
      (error) => {
        console.error('Error al crear el plato:', error);
        Swal.fire('¡Error!', 'No se pudo crear el plato. Por favor, inténtelo de nuevo.', 'error');
      }
    );
  }

  editarPlato(plato: any) {
    this.modoEdicion = true;
    this.plato = { ...plato };
  }
  
  actualizarPlato() {
    this.http.put(`${this.baseUrl}/plato-carta/editar/${this.plato.id}`, this.plato).subscribe(
      (response) => {
        console.log('Plato actualizado:', response);
        Swal.fire('¡Éxito!', 'El plato ha sido actualizado exitosamente.', 'success');
        this.getPlatos();
        this.resetPlatoForm();
      },
      (error) => {
        console.error('Error al actualizar el plato:', error);
        Swal.fire('¡Error!', 'No se pudo actualizar el plato. Por favor, inténtelo de nuevo.', 'error');
      }
    );
  }


  restaurarplato(plato: any) {
    const nuevoEstado = plato.estado === 'A' ? 'I' : 'A';
    this.http.patch(`${this.baseUrl}/plato-carta/restaurar/${plato.id}`, { estado: nuevoEstado }, { responseType: 'text' }).subscribe(
      (response: any) => {
        console.log('Estado del plato cambiado:', response);
        Swal.fire('¡Éxito!', response, 'success');
        this.getPlatos();
      },
      (error) => {
        console.error('Error al cambiar el estado del plato:', error);
        Swal.fire('¡Error!', 'No se pudo cambiar el estado del plato. Por favor, inténtelo de nuevo.', 'error');
      }
    );
  }



  desactivarPlato(plato: any) {
    const nuevoEstado = plato.estado === 'I' ? 'A' : 'I';

    this.http.patch(`${this.baseUrl}/plato-carta/desactivar/${plato.id}`, { estado: nuevoEstado }, { responseType: 'text' }).subscribe(
      (response) => {
        console.log('Plato eliminado:', response);
        Swal.fire('¡Éxito!', 'El plato ha sido eliminado exitosamente.', 'success');
        this.getPlatos();
      },
      (error) => {
        console.error('Error al eliminar el plato:', error);
        Swal.fire('¡Error!', 'No se pudo eliminar el plato. Por favor, inténtelo de nuevo.', 'error');
        this.getPlatos();
      }
    );
  }



  resetPlatoForm() {
    this.plato = {};
    this.modoEdicion = false;
  }

  cancelarEdicion() {
    this.resetPlatoForm(); // Método para limpiar el formulario y resetear el plato en modo de edición
  }



  exportarAExcel(): void {
    // Crear un array de objetos con solo las propiedades que deseas exportar
    const dataToExport = this.platos.map(plato => ({
      Nombre: plato.nombre,
      Descripción: plato.descripcion,
      Precio: plato.precio,
      Categoría: this.getNombreCategoria(plato.id_categoria),
      Presentación: this.getTipoPresentacion(plato.id_presentacion),
      Stock: plato.stock
    }));

    // Crear una hoja de cálculo usando el método json_to_sheet de XLSX
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);

    // Crear un libro de trabajo y agregar la hoja de cálculo
    const workbook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };

    // Convertir el libro de trabajo a un blob binario
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    // Crear un Blob y guardar el archivo
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const fileName = 'reporte_productos.xlsx';

    // Crear un link para descargar el archivo
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    window.URL.revokeObjectURL(url); // Liberar el objeto URL creado
  }

  // Método para exportar a PDF
  exportarAPDF(): void {
    const doc = new jsPDF({
      orientation: 'landscape'
    });

    const img = new Image();
    img.src = 'assets/img/Logo Transparente Gastro Connect.png';
    img.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
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

      const head = [['Nombre', 'Descripción', 'Precio', 'Categoría', 'Presentación', 'Stock']];
      const data = this.platos.map(plato => [
        plato.nombre,
        plato.descripcion,
        plato.precio,
        this.getNombreCategoria(plato.id_categoria), // Implementa esta función según tu lógica
        this.getTipoPresentacion(plato.id_presentacion), // Implementa esta función según tu lógica
        plato.stock,
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
        const pageNumberText = `Página ${i} de ${pageCount}`;
        const pageSize = doc.internal.pageSize;
        const pageWidth = pageSize.getWidth();
        const pageHeight = pageSize.getHeight();
        const footerY = pageHeight - 10;
        doc.text(pageNumberText, pageWidth - doc.getTextWidth(pageNumberText) - 10, footerY);
      }

      doc.save('reporte_productos.pdf');
    };
  }




}
