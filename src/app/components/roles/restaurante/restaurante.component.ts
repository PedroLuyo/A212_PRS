import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { RestauranteService } from '../../../services/restaurant/restaurante.service';
import jsPDF from 'jspdf';
import { AuthService } from '../../../services/auth/authService';
import { CloudinaryService } from '../../../services/cloudinary/Cloudinary.service';

@Component({
  selector: 'app-restaurante',
  templateUrl: './restaurante.component.html',
  styleUrls: ['./restaurante.component.css']
})
export class RestauranteComponent implements OnInit {
  restauranteForm: FormGroup;
  restaurantes: any[] = [];
  restauranteCreado: any;
  restauranteEditando: any = null;
  restauranteSeleccionado: any = null;
  docid: string = '';
  selectedFile: File | undefined;
  imageUrl: string | undefined;
  p: number = 1; // Página actual

  constructor(
      private restauranteService: RestauranteService,
      private fb: FormBuilder,
      private authService: AuthService,
      private cloudinaryService: CloudinaryService // Inyectar el servicio Cloudinary
    ) {
    this.restauranteForm = this.fb.group({
      id: [''],
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      telefono: ['', Validators.required],
      tipoCocina: [''],
      capacidadPersonas: [''],
      horaApertura: ['', Validators.required],
      horaCierre: ['', Validators.required],
      horarioFuncionamiento: [''],
      estado: [true],
      imagenRestaurante: [''],
      docid: ['']
    });
  }

  async ngOnInit(): Promise<void> {
    const userUid = await this.authService.getUserUid();
    this.restauranteForm.get('docid')?.setValue(userUid);
    this.listarRestaurantes();
  }

  // Método para manejar la selección de archivo
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  // Método para subir la imagen a Cloudinary
  uploadImageToCloudinary(): void {
    if (!this.selectedFile) {
      console.error('No se ha seleccionado ningún archivo.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('upload_preset', 'cloudinary-product'); // Reemplaza 'cloudinary-product' por tu upload_preset de Cloudinary

    this.cloudinaryService.uploadImg(formData).subscribe(
      (response: any) => {
        if (response && response.secure_url) {
          this.imageUrl = response.secure_url;
          console.log('URL de la imagen subida:', this.imageUrl);
          this.restauranteForm.patchValue({ imagenRestaurante: this.imageUrl }); // Actualizar el formulario con la URL de la imagen
        } else {
          console.error('No se recibió la URL de la imagen desde Cloudinary.');
        }
      },
      error => {
        console.error('Error al subir imagen a Cloudinary:', error);
      }
    );
  }

  crearRestaurante(): void {
    if (this.restauranteForm.valid) {
      const nuevoRestaurante = this.restauranteForm.value;
      nuevoRestaurante.horarioFuncionamiento = `${nuevoRestaurante.horaApertura} - ${nuevoRestaurante.horaCierre}`;
      this.restauranteService.crearRestaurante(nuevoRestaurante).subscribe(
        (restauranteCreado: any) => {
          this.restauranteCreado = restauranteCreado;
          Swal.fire('Creado!', 'El restaurante ha sido creado exitosamente.', 'success');
          this.restauranteForm.reset();
          this.listarRestaurantes();
        },
        (error: any) => {
          console.error('Error al crear restaurante', error);
          Swal.fire('Error', 'Hubo un problema al crear el restaurante. Por favor, inténtelo de nuevo.', 'error');
        }
      );
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
    this.restauranteEditando = { ...restaurante }; // Clonar el objeto restaurante para evitar cambios inesperados
    this.restauranteForm.patchValue({
      id: this.restauranteEditando.id,
      nombre: this.restauranteEditando.nombre,
      direccion: this.restauranteEditando.direccion,
      telefono: this.restauranteEditando.telefono,
      tipoCocina: this.restauranteEditando.tipoCocina,
      capacidadPersonas: this.restauranteEditando.capacidadPersonas,
      horaApertura: this.restauranteEditando.horaApertura,
      horaCierre: this.restauranteEditando.horaCierre,
      horarioFuncionamiento: this.restauranteEditando.horarioFuncionamiento,
      estado: this.restauranteEditando.estado,
      imagenRestaurante: this.restauranteEditando.imagenRestaurante
    });
  }

  cancelarEdicion(): void {
    this.restauranteEditando = null;
    this.restauranteForm.reset();
  }

  guardarCambios(): void {
    if (this.restauranteForm.valid) {
      const restauranteActualizado = this.restauranteForm.value;
      const idRestaurante = restauranteActualizado.id;

      this.restauranteService.editarRestaurante(idRestaurante, restauranteActualizado).subscribe(
        (restauranteActualizado: any) => {
          console.log('Restaurante actualizado exitosamente', restauranteActualizado);
          this.listarRestaurantes();
          Swal.fire('Actualizado!', 'El restaurante ha sido actualizado exitosamente.', 'success');
          this.restauranteEditando = null;
          this.restauranteForm.reset();
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
        this.listarRestaurantes();
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
        this.listarRestaurantes();
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
      orientation: 'landscape' // También se puede usar 'portrait'
    });

    const img = new Image();
    img.src = 'assets/img/Logo Transparente Gastro Connect.png';
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
      const titulo = 'Reporte de Restaurantes';
      const tituloY = logoHeight + 20; // Espacio después del logo
      doc.text(titulo, 14, tituloY); // Ajuste de la posición del título

      // Añadir fecha a la derecha del título
      doc.setFontSize(12); // Tamaño de fuente para la fecha
      const fechaX = pageWidth - 14; // Margen derecho
      doc.text(`Fecha: ${fecha}`, fechaX, tituloY, { align: 'right' }); // Posición de la fecha

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

      doc.save('reporte_restaurantes.pdf');
    };
  }

}
