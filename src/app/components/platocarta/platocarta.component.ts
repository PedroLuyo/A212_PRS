import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FormsModule } from '@angular/forms';


declare var $: any;

@Component({
  selector: 'app-platocarta',
  templateUrl: './platocarta.component.html',
  styleUrl: './platocarta.component.css'
})
export class PlatocartaComponent {

  //baseUrl= 'https://9095-vallegrande-msplatocart-kne1m7vwrtl.ws-us114.gitpod.io';
  private readonly baseUrl = 'http://localhost:9095/api/v1';
  private readonly estadoActivo = 'A';
  private readonly estadoInactivo = 'I';

  platos: any[] = [];
  plato: any = {};
  modoEdicion = false;
  filtroPlatos: string = '';

  presentaciones: any[] = [];
  categorias: any[] = [];



  @ViewChild('agregarPlatoModal') agregarPlatoModal!: ElementRef;
  @ViewChild('editarPlatoModal') editarPlatoModal!: ElementRef;

  constructor(private http: HttpClient) { }

  categoriaControl = new FormControl();
  presentacionControl = new FormControl();

  platoSeleccionado: number = 0;
  cantidadReserva: number = 0;


  ngOnInit() {
    this.getPlatos();
    this.filtrarPlatos('/activo');
    this.getCategoriasActivas();
    this.getPresentacionesActivas();
    console.log('Categorías:', this.categorias);
    console.log('Presentaciones:', this.presentaciones);

    this.categoriaControl.setValue(this.categorias[0]); // Establece el valor inicial
    this.presentacionControl.setValue(this.presentaciones[0]);
  }

  generarReportePDF(): void {
    const doc = new jsPDF({
        orientation: 'landscape' // también se puede usar 'portrait'
    });

    const img = new Image();
    img.src = 'assets/img/Logo Transparente Gastro Connect.png'; // Ruta de la imagen del logo
    img.onload = () => {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const logoWidth = pageWidth * 0.2; // Ajustar el ancho del logo al 20% de la página
        const logoHeight = img.height * (logoWidth / img.width);
        const logoX = (pageWidth - logoWidth) / 2;
        doc.addImage(img, 'PNG', logoX, 10, logoWidth, logoHeight);

        const fecha = new Date().toLocaleDateString();

        doc.setFont('courier', 'bold');
        doc.setFontSize(20);
        const titulo = 'Reporte de Platos';
        const tituloY = logoHeight + 20; // Espacio después del logo
        doc.text(titulo, 14, tituloY); // Ajuste de la posición del título

        // Añadir fecha a la derecha del título
        doc.setFontSize(12); // Tamaño de fuente para la fecha
        const fechaX = pageWidth - 14; // Margen derecho
        doc.text(`Fecha: ${fecha}`, fechaX, tituloY, { align: 'right' }); // Posición de la fecha

        const head = [['Nro', 'Nombre', 'Descripción', 'Precio', 'Categoría', 'Presentación', 'Stock', 'Estado']];
        const data = this.platos.map((plato: any, index: number) => [
            index + 1,
            plato.nombre,
            plato.descripcion,
            `S/ ${plato.precio.toFixed(2)}`,
            this.getNombreCategoria(plato.id_categoria),
            this.getTipoPresentacion(plato.id_presentacion),
            plato.stock,
            plato.estado === 'A' ? 'Activo' : 'Inactivo'
        ]);

        (doc as any).autoTable({
            head: head,
            body: data,
            startY: tituloY + 10,
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

        // Añadir la fecha en la esquina inferior derecha de cada página
        const fechaPosX = pageWidth - 10;
        const fechaPosY = pageHeight - 10;
        doc.setFont('arial', 'normal');
        doc.setFontSize(10);
        for (let i = 1; i <= doc.getNumberOfPages(); i++) {
            doc.setPage(i);
            doc.text(`Fecha de creación: ${fecha}`, fechaPosX, fechaPosY, { align: 'right' });
        }

        doc.save('reporte_platos.pdf');
    };
}





  getNombreCategoria(idCategoria: number): string {
    const categoria = this.categorias.find(c => c.id === idCategoria);
    return categoria ? categoria.nombre : '';
  }

  getTipoPresentacion(idPresentacion: number): string {
    const presentacion = this.presentaciones.find(p => p.id === idPresentacion);
    return presentacion ? presentacion.tipo : '';
  }


  // Método para obtener presentaciones activas y almacenarlas en el array
  getPresentacionesActivas() {
    this.http.get(this.baseUrl + '/presentacion/obtener/activo').subscribe(
      (data: any) => {
        this.presentaciones = data;
        console.log('Presentaciones activas:', this.presentaciones);
      },
      (error) => {
        console.error('Error al obtener presentaciones:', error);
      }
    );
  }

  // Método para obtener categorías activas y almacenarlas en el array
  getCategoriasActivas() {
    this.http.get(this.baseUrl + '/categoria/obtener/activo').subscribe(
      (data: any) => {
        this.categorias = data;
        console.log('Categorías activas:', this.categorias);
      },
      (error) => {
        console.error('Error al obtener categorías:', error);
      }
    );
  }

  filtrarPlatos(estado: string) {
    this.filtroPlatos = estado;
    this.getPlatos();
  }

  getPlatos() {
    let url = `${this.baseUrl}/plato-carta/obtener`;

    if (this.filtroPlatos) {
      url += `${this.filtroPlatos}`;
    }

    url += '?sort=-id';

    this.http.get(url).subscribe(
      (data: any) => {
        this.platos = data.sort((a: any, b: any) => b.id - a.id);
      },
      (error) => {
        console.error('Error en la solicitud HTTP:', error);
        this.showErrorAlert('Error', 'Hubo un error en la solicitud. Por favor, inténtelo de nuevo.');
      }
    );
  }

  nuevoPlato() {
    this.plato = {
      nombre: '',
      descripcion: '',
      precio: 0,
      id_categoria: 0,
      id_presentacion: 0,
      stock: 0,
      estado: this.estadoActivo,
      image: '' // Agrega esta línea
    };
    this.modoEdicion = false;
  }

  guardarPlato() {
    if (this.camposVacios()) {
      this.showErrorAlert('Error', 'Por favor, complete todos los campos.');
      return;
    }

    if (this.modoEdicion) {
      this.actualizarPlato(this.plato.id);
    } else {
      const url = `${this.baseUrl}/plato-carta/crear`;
      this.http.post(url, this.plato).subscribe(
        (data: any) => {
          this.platos.push(data);
          this.plato = { id: null, nombre: '', descripcion: '', precio: 0, id_categoria: 0, id_presentacion: 0, stock: 0, image: '', estado: this.estadoActivo };
          this.getPlatos();
          this.cerrarModal();
          this.showSuccessAlert('Éxito', `Plato '${data.nombre}' creado con éxito.`);
        },
        (error) => {
          console.error('Error al crear el plato:', error);
          this.showErrorAlert('Error', 'Error al crear el plato. Por favor, inténtelo de nuevo.');
        }
      );
    }
  }

  private camposVacios(): boolean {
    return !this.plato.nombre || !this.plato.descripcion || !this.plato.precio || !this.plato.id_categoria || !this.plato.id_presentacion || !this.plato.stock || !this.plato.image;
  }

  actualizarPlato(id: number) {
    this.plato.estado = this.getEstadoAbreviado(this.plato.estado);
    const url = `${this.baseUrl}/plato-carta/editar/${id}`;

    this.http.put(url, this.plato).subscribe(
      (data: any) => {
        const indice = this.platos.findIndex((e) => e.id === data.id);
        if (indice !== -1) {
          this.platos[indice] = data;
        }

        this.plato = { nombre: '', descripcion: '', precio: 0, id_categoria: 0, id_presentacion: 0, stock: 0, image: '', estado: this.estadoActivo };
        this.getPlatos();
        this.cerrarModal();
        this.showSuccessAlert('Éxito', `Plato '${data.nombre}' editado con éxito.`);
      },
      (error) => {
        console.error('Error en la solicitud HTTP:', error);
        this.showErrorAlert('Error', 'Error al editar el plato.');
      }
    );
  }

  editarPlato(plato: any) {
    try {
      // Copia profunda del objeto para evitar enlaces no deseados
      this.plato = JSON.parse(JSON.stringify(plato));

      // Convertir el estado a formato 'Activo' o 'Inactivo'
      this.plato.estado = this.plato.estado === 'A' ? 'Activo' : 'Inactivo';

      // Agrega esta línea para asegurarte de que imagenUrl está definido
      this.plato.image = this.plato.image || '';

      // Actualiza las categorías y presentaciones existentes
      this.getCategoriasActivas();
      this.getPresentacionesActivas();

      // Asigna valores a los controles de categoría y presentación
      this.categoriaControl.setValue(this.categorias.find(c => c.id === this.plato.id_categoria));
      this.presentacionControl.setValue(this.presentaciones.find(p => p.id === this.plato.id_presentacion));

      this.modoEdicion = true; // Asegúrate de que modoEdicion es verdadero cuando editas un plato

      $('#editarPlatoModal').modal('show'); // Muestra el modal de edición
    } catch (error) {
      console.log('--ERROR Datos del plato:', this.plato);
    }
  }


  onCategoriaChange(event: any) {
    // Puedes realizar acciones adicionales cuando cambia la categoría
    console.log('Categoría cambiada:', event);
  }

  onPresentacionChange(event: any) {
    // Puedes realizar acciones adicionales cuando cambia la presentación
    console.log('Presentación cambiada:', event);
  }




  private getEstadoAbreviado(estado: string): string {
    return estado === 'Activo' ? this.estadoActivo : this.estadoInactivo;
  }

  cerrarModal() {
    $('#agregarPlatoModal').modal('hide');
    $('#editarPlatoModal').modal('hide');
  }

  eliminarPlato(plato: any) {
    const url = `${this.baseUrl}/plato-carta/desactivar/${plato.id}`;
    const id = plato.id;

    this.http.patch(url, {}, { responseType: 'text' }).subscribe(
      (response: any) => {
        this.getPlatos();
        this.showSuccessAlert('Éxito', `Plato '${plato.nombre}' eliminado con éxito.`);
      },
      (error: any) => {
        console.error('Error en la solicitud HTTP:', error);
        this.showErrorAlert('Error', 'Error al eliminar el plato.');
      }
    );
  }

  cambiarEstadoPlato(plato: any) {
    const url = `${this.baseUrl}/plato-carta/restaurar/${plato.id}`;
    const id = plato.id;
    const nuevoEstado = plato.estado === this.estadoActivo ? this.estadoInactivo : this.estadoActivo;

    this.http.patch(url, {}, { responseType: 'text' }).subscribe(() => {
      const mensaje = nuevoEstado === this.estadoActivo ? 'Activado' : 'Desactivado';
      this.getPlatos();
      this.showSuccessAlert('Éxito', `Plato '${plato.nombre}' restaurado con éxito.`);
    });
  }

  private showSuccessAlert(title: string, message: string): void {
    Swal.fire(title, message, 'success');
  }

  private showErrorAlert(title: string, message: string): void {
    Swal.fire(title, message, 'error');
  }








// Método para editar un plato con el nuevo stock
editarPlatos(plato: any, nuevoStock: number) {
  plato.stock = nuevoStock;
  this.actualizarPlatos(plato.id, plato);
}

// Método para actualizar un plato
actualizarPlatos(id: number, plato: any) {
  const url = `${this.baseUrl}/plato-carta/editar/${id}`;
  this.http.put(url, plato).subscribe(
      (data: any) => {
          // Manejar la respuesta si es necesario
          this.showSuccessAlert('Éxito', 'Reserva realizada exitosamente.');
      },
      (error) => {
          console.error('Error en la solicitud HTTP:', error);
          this.showErrorAlert('Error', 'Error al editar el plato.');
      }
  );
}


reservarPlato(idPlato: number, cantidad: number) {
  const url = `${this.baseUrl}/reservar/${idPlato}/${cantidad}`;
  this.http.post(url, {}).subscribe(
    (data: any) => {
      console.log('Reserva realizada:', data);
      this.showSuccessAlert('Éxito', 'La reserva se realizó correctamente.');
      this.getPlatos();
    },
    (error) => {
      console.error('Error al realizar la reserva:', error);
      this.showErrorAlert('Error', 'Hubo un error al realizar la reserva. Por favor, inténtelo de nuevo.');
    }
  );


}








}

