import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { RestauranteService } from '../../../services/restaurante.service';
import jsPDF from 'jspdf';

@Component({
  selector: 'app-restaurante',
  templateUrl: './restaurante.component.html',
  styleUrls: ['./restaurante.component.css']
})
export class RestauranteComponent implements OnInit {
  restauranteForm: FormGroup;
  restaurantes: any[] = [];
  restauranteCreado: any;
  restauranteEditando: any = null; // Variable para almacenar el restaurante en edición
  restauranteSeleccionado: any = null; // Variable para almacenar el restaurante seleccionado
  private docid: string = ''; // ID del gestor

  constructor(
    private restauranteService: RestauranteService,
    private fb: FormBuilder
  ) {
    this.restauranteForm = this.fb.group({
      id: [''],
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      tipoCocina: [''],
      capacidadPersonas: [''],
      horarioFuncionamiento: [''],
      estado: [true],
      imagenRestaurante: [''], // Campo para la imagen del restaurante
      docid: [this.docid, Validators.required] // Campo para el ID del gestor
    });
  }

  ngOnInit(): void {
    this.listarRestaurantes();
  }

  crearRestaurante(): void {
    if (this.restauranteForm.valid) {
      const nuevoRestaurante = this.restauranteForm.value;

      Swal.fire({
        title: '¿Estás seguro?',
        html: `Se agregarán los siguientes datos:<br>
               <b>Nombre:</b> ${nuevoRestaurante.nombre}<br>
               <b>Dirección:</b> ${nuevoRestaurante.direccion}<br>
               <b>Teléfono:</b> ${nuevoRestaurante.telefono}<br>
               <b>Tipo de Cocina:</b> ${nuevoRestaurante.tipoCocina}<br>
               <b>Capacidad de Personas:</b> ${nuevoRestaurante.capacidadPersonas}<br>
               <b>Horario de Funcionamiento:</b> ${nuevoRestaurante.horarioFuncionamiento}<br>
               <b>Estado:</b> ${nuevoRestaurante.estado ? 'Activo' : 'Inactivo'}<br>
               <b>Imagen del Restaurante:</b> ${nuevoRestaurante.imagenRestaurante}<br>
               <b>ID del Gestor:</b> ${nuevoRestaurante.docid}`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Sí, agregar',
        cancelButtonText: 'Cancelar',
      }).then((result) => {
        if (result.isConfirmed) {
          this.restauranteService.crearRestaurante(nuevoRestaurante).subscribe(
            (restauranteCreado: any) => {
              this.restauranteCreado = restauranteCreado;
              Swal.fire('Creado!', 'El restaurante ha sido creado exitosamente.', 'success');
              this.restauranteForm.reset(); // Reinicia el formulario después de crear
              this.listarRestaurantes(); // Actualiza la lista de restaurantes
            },
            (error: any) => {
              console.error('Error al crear restaurante', error);
              Swal.fire('Error', 'Hubo un problema al crear el restaurante. Por favor, inténtelo de nuevo.', 'error');
            }
          );
        }
      });
    } else {
      Swal.fire('Error', 'Por favor complete el formulario correctamente.', 'error');
    }
  }

  listarRestaurantes(): void {
    this.restauranteService.obtenerTodos().subscribe(
      (data: any[]) => {
        this.restaurantes = data;
      },
      (error: any) => {
        console.error('Error al obtener restaurantes', error);
        Swal.fire('Error', 'Hubo un problema al obtener los restaurantes. Por favor, inténtelo de nuevo.', 'error');
      }
    );
  }

  editarRestaurante(restaurante: any): void {
    // Clona el restaurante para evitar cambios directos en el original
    this.restauranteEditando = { ...restaurante };
    // Asigna los valores al formulario de edición
    this.restauranteForm.patchValue({
      id: this.restauranteEditando.id,
      nombre: this.restauranteEditando.nombre,
      direccion: this.restauranteEditando.direccion,
      telefono: this.restauranteEditando.telefono,
      tipoCocina: this.restauranteEditando.tipoCocina,
      capacidadPersonas: this.restauranteEditando.capacidadPersonas,
      horarioFuncionamiento: this.restauranteEditando.horarioFuncionamiento,
      estado: this.restauranteEditando.estado,
      imagenRestaurante: this.restauranteEditando.imagenRestaurante
    });
  }

  cancelarEdicion(): void {
    this.restauranteEditando = null;
    this.restauranteForm.reset(); // Reinicia el formulario de edición
  }

  guardarCambios(): void {
    if (this.restauranteForm.valid) {
      const restauranteActualizado = this.restauranteForm.value;
      const idRestaurante = restauranteActualizado.id;

      // Envía la solicitud de actualización al servicio
      this.restauranteService.editarRestaurante(idRestaurante, restauranteActualizado).subscribe(
        (restauranteActualizado: any) => {
          console.log('Restaurante actualizado exitosamente', restauranteActualizado);
          this.listarRestaurantes(); // Actualiza la lista de restaurantes
          Swal.fire('Actualizado!', 'El restaurante ha sido actualizado exitosamente.', 'success');
          this.restauranteEditando = null; // Reinicia la variable de edición
          this.restauranteForm.reset(); // Reinicia el formulario de edición
        },
        (error: any) => {
          console.error('Error al actualizar restaurante', error);
          Swal.fire('Error', 'Hubo un problema al actualizar el restaurante. Por favor, inténtelo de nuevo.', 'error');
        }
      );
    } else {
      Swal.fire('Error', 'Por favor complete el formulario correctamente.', 'error');
    }
  }

  desactivarRestaurante(restaurante: any): void {
    this.restauranteService.desactivarRestaurante(restaurante.id).subscribe(
      () => {
        console.log('Restaurante desactivado exitosamente');
        this.listarRestaurantes(); // Actualiza la lista de restaurantes
        Swal.fire('Desactivado!', 'El restaurante ha sido desactivado exitosamente.', 'success');
      },
      (error: any) => {
        console.error('Error al desactivar restaurante', error);
        Swal.fire('Error', 'Hubo un problema al desactivar el restaurante. Por favor, inténtelo de nuevo.', 'error');
      }
    );
  }

  restaurarRestaurante(restaurante: any): void {
    this.restauranteService.restaurarRestaurante(restaurante.id).subscribe(
      () => {
        console.log('Restaurante restaurado exitosamente');
        this.listarRestaurantes(); // Actualiza la lista de restaurantes
        Swal.fire('Restaurado!', 'El restaurante ha sido restaurado exitosamente.', 'success');
      },
      (error: any) => {
        console.error('Error al restaurar restaurante', error);
        Swal.fire('Error', 'Hubo un problema al restaurar el restaurante. Por favor, inténtelo de nuevo.', 'error');
      }
    );
  }

  verRestaurante(restaurante: any): void {
    this.restauranteSeleccionado = restaurante;
  }
  
  exportCSVRestaurante(): void {
    let csvData = 'Nombre,Dirección,Teléfono,Tipo de Cocina,Capacidad,Horario,Estado,DocID\n';
    this.restaurantes.forEach(restaurante => {
      csvData += `${restaurante.nombre},${restaurante.direccion},${restaurante.telefono},${restaurante.tipoCocina},${restaurante.capacidadPersonas},${restaurante.horarioFuncionamiento},${restaurante.estado ? 'Activo' : 'Inactivo'},${restaurante.docid}\n`;
    });
  
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'reporte_restaurantes.csv');
    link.style.visibility = 'hidden';
  
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  generarReportePDFRestaurantes(): void {
    const doc = new jsPDF({
      orientation: 'portrait' // o 'landscape' según prefieras
    });
    const img = new Image();
    img.src = 'assets/img/Logo.png'; // Asegúrate de cambiar la ruta al logo correspondiente
    img.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const logoWidth = pageWidth * 0.6; // Ajustar el ancho del logo al 60% de la página
      const logoHeight = img.height * (logoWidth / img.width);
      const logoX = (pageWidth - logoWidth) / 2;
      doc.addImage(img, 'PNG', logoX, 10, logoWidth, logoHeight);
      const fecha = new Date().toLocaleDateString();
      doc.setFont('courier', 'bold');
      doc.setFontSize(20);
      const titulo = 'Reporte de Restaurantes';
      const tituloY = logoHeight + 20; // Espacio después del logo
      doc.text(titulo, pageWidth / 2, tituloY, { align: 'center' });
      const head = [['Nombre', 'Dirección', 'Teléfono', 'Tipo de Cocina', 'Capacidad', 'Horario', 'Estado', 'DocID']];
      const data = this.restaurantes.map((restaurante) => [
        restaurante.nombre,
        restaurante.direccion,
        restaurante.telefono,
        restaurante.tipoCocina,
        restaurante.capacidadPersonas,
        restaurante.horarioFuncionamiento,
        restaurante.estado ? 'Activo' : 'Inactivo',
        restaurante.docid,
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
      for (let i = 1; i <= doc.getNumberOfPages(); i++) {
        doc.setPage(i);
        doc.text(`Fecha de creación: ${fecha}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
      }
      doc.save('reporte_restaurantes.pdf');
    };
  }
}