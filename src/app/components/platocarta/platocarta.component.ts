import { Component, ElementRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormControl, NgForm } from '@angular/forms';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import { FormsModule } from '@angular/forms';
import 'jspdf-autotable';


declare var $: any;

@Component({
  selector: 'app-platocarta',
  templateUrl: './platocarta.component.html',
  styleUrl: './platocarta.component.css'
})
export class PlatocartaComponent {

  private readonly baseUrl = 'https://9095-vallegrande-msplatocart-9hirjl5fi20.ws-us114.gitpod.io/api/v1/plato-carta';
  private readonly baseUrlPresentacion = 'https://9095-vallegrande-msplatocart-9hirjl5fi20.ws-us114.gitpod.io/api/v1/presentacion';
  private readonly baseUrlCategoria = 'https://9095-vallegrande-msplatocart-9hirjl5fi20.ws-us114.gitpod.io/api/v1/categoria'
  private readonly estadoActivo = 'A';
  private readonly estadoInactivo = 'I';

  platos: any[] = [];
  plato: any = {};
  modoEdicion = false;
  filtroPlatos: string = '';

  presentaciones: any[] = [];
  categorias: any[] = [];


  // Declarar una nueva variable para almacenar el ID del plato seleccionado y la cantidad de reserva
  platoSeleccionadoId: number = 0;
  cantidadReserva: number = 0;

  @ViewChild('agregarPlatoModal') agregarPlatoModal!: ElementRef;
  @ViewChild('editarPlatoModal') editarPlatoModal!: ElementRef;

  constructor(private http: HttpClient) { }

  categoriaControl = new FormControl();
  presentacionControl = new FormControl();




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

  generarReportePDF() {
    const logoUrl = 'https://marketplace.canva.com/EAFVq1ge0ZU/1/0/1600w/canva-logo-restaurante-circular-sencillo-negro-blanco-QEgdJHSl6GE.jpg';
    const nombreRestaurante = 'Grill House';

    // Crear el documento jsPDF
    const doc = new jsPDF({
      orientation: 'portrait'
    });

    // Establecer la fecha de creación del reporte
    const fecha = new Date().toLocaleDateString();

    // Configurar la posición y tamaño del logo
    const imgWidth = 45;
    const imgHeight = 45;
    const margin = 10;
    const imgX = margin; // Ajusta la posición X del logo
    const imgY = margin; // Ajusta la posición Y del logo

    // Cargar el logo
    const img = new Image();
    img.src = logoUrl;

    img.onload = () => {
      // Añadir el logo al documento
      doc.addImage(img, 'JPEG', imgX, imgY, imgWidth, imgHeight);

      // Agregar el texto "Restaurante"
      doc.setFont('courier', 'normal'); // Cambia el tipo de fuente a Courier sin negrita
      doc.setFontSize(13); // Cambia el tamaño de la fuente a 13
      const restauranteText = 'Restaurante';
      const restauranteX = imgX + imgWidth + 10; // Posiciona el texto "Restaurante" a la derecha del logo
      const restauranteY = imgY + imgHeight / 2 - doc.getFontSize() / 2; // Centra verticalmente el texto "Restaurante" con respecto al logo
      doc.text(restauranteText, restauranteX, restauranteY);

      // Agregar el título del reporte
      doc.setFont('courier', 'bold'); // Cambia el tipo de fuente a Courier Bold
      doc.setFontSize(45);
      const tituloX = imgX + imgWidth + 10; // Posiciona el título a la derecha del logo
      const tituloY = restauranteY + doc.getFontSize() - 30; // Posiciona el título justo debajo del texto "Restaurante"
      doc.text(nombreRestaurante, tituloX, tituloY);
      doc.setFont('courier'); // Cambia el tipo de fuente a Courier para el resto del documento

      // Agregar el subtítulo del reporte
      const subtitulo = 'Reporte de platos:';
      const subtituloY = imgY + imgHeight + 5; // Ajusta la posición Y del subtítulo
      doc.setFont('arial', 'normal'); // Cambia el tipo de fuente a Arial sin negrita
      doc.setFontSize(10);
      doc.text(subtitulo, imgX + 4, subtituloY);


      // Configurar la tabla de datos
      const head = [['Nro', 'Nombre', 'Descripción', 'Precio', 'Categoría', 'Presentación', 'Stock', 'Estado']];
      const data = this.platos.map((plato, index) => [
        index + 1,
        plato.nombre,
        plato.descripcion,
        `S/ ${plato.precio.toFixed(2)}`,
        this.getNombreCategoria(plato.id_categoria),
        this.getTipoPresentacion(plato.id_presentacion),
        plato.stock,
        plato.estado === 'A' ? 'Activo' : 'Inactivo'
      ]);

      // Generar la tabla de datos
      (doc as any).autoTable({
        head: head,
        body: data,
        startY: imgY + imgHeight + 10, // Ajusta la posición de inicio de la tabla
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
        },
        columnStyles: {
          0: { cellWidth: 'auto' },
          1: { cellWidth: '30' },
          2: { cellWidth: 'auto' },
          3: { cellWidth: 18 },
          4: { cellWidth: 23 },
          5: { cellWidth: 27 },
          6: { cellWidth: '8' },
          7: { cellWidth: 'auto' },

        }
      });

      // Establecer la fecha en todas las páginas del documento
      const fechaX = doc.internal.pageSize.width - margin; // Ajusta la posición X de la fecha
      const fechaY = doc.internal.pageSize.height - margin; // Ajusta la posición Y de la fecha
      doc.setFont('arial', 'normal'); // Cambia el tipo de fuente a Arial sin negrita
      doc.setFontSize(10);
      for (let i = 1; i <= doc.getNumberOfPages(); i++) {
        doc.setPage(i);
        doc.text(`Fecha de creación: ${fecha}`, fechaX, fechaY, { align: 'right' });
      }

      // Guardar el documento PDF
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
    this.http.get(this.baseUrlPresentacion + '/obtener/activo').subscribe(
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
    this.http.get(this.baseUrlCategoria + '/obtener/activo').subscribe(
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
    let url = `${this.baseUrl}/obtener`;

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
      const url = `${this.baseUrl}/crear`;
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
    const url = `${this.baseUrl}/editar/${id}`;

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
    const url = `${this.baseUrl}/desactivar/${plato.id}`;
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
    const url = `${this.baseUrl}/restaurar/${plato.id}`;
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






 // Método para manejar la selección de un plato
seleccionarPlato(platoId: number) {
  this.platoSeleccionadoId = platoId;
}

// Método para manejar la reserva rápida
reservarPlato() {
  // Verificar que se haya seleccionado un plato y se haya especificado una cantidad de reserva
  if (this.platoSeleccionadoId && this.cantidadReserva > 0) {
      // Buscar el plato seleccionado en la lista de platos
      const platoSeleccionado = this.platos.find(plato => plato.id === this.platoSeleccionadoId);
      if (platoSeleccionado) {
          // Calcular la nueva cantidad de stock
          const nuevoStock = platoSeleccionado.stock - this.cantidadReserva;
          // Verificar que el stock no sea negativo
          if (nuevoStock >= 0) {
              // Actualizar el plato con el nuevo stock
              this.editarPlatos(platoSeleccionado, nuevoStock);
              // Restablecer los valores de selección
              this.platoSeleccionadoId = 0;
              this.cantidadReserva = 0;
          } else {
              alert('La cantidad a reservar supera el stock disponible.');
          }
      }
  } else {
      alert('Por favor, seleccione un plato y especifique la cantidad a reservar.');
  }
}

// Método para editar un plato con el nuevo stock
editarPlatos(plato: any, nuevoStock: number) {
  plato.stock = nuevoStock;
  this.actualizarPlatos(plato.id, plato);
}

// Método para actualizar un plato
actualizarPlatos(id: number, plato: any) {
  const url = `${this.baseUrl}/editar/${id}`;
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
}}

