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
  imagenPreview: string | ArrayBuffer | null = null;
  opcionImagen: string = 'subir';
  platosMenu: any[] = [];
  platosCarta: any[] = [];
  bebidas: any[] = [];
  mostrarPresentacionRestaurante: boolean = false;
  convertirHora: any;
  estaAbierto: boolean = false;

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
      urlImagen: [''],
      docid: [''],
    });
  }

  async ngOnInit(): Promise<void> {
    const userUid = await this.authService.getUserUid();
    this.restauranteForm.get('docid')?.setValue(userUid);
    this.listarRestaurantes();
  }

  // Método para manejar la selección de archivo
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file; // Asignar archivo seleccionado
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenPreview = e.target.result; // Para previsualización
      };
      reader.readAsDataURL(file); // Convertir archivo a base64 (opcional para previsualización)
    }
  }

  // Método para subir la imagen a Cloudinary y obtener la URL
subirImagenYObtenerUrl(): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!this.selectedFile) {
      console.error('No se ha seleccionado ningún archivo.');
      reject('No se ha seleccionado ningún archivo.');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('upload_preset', 'cloudinary-product'); // Sustituye 'cloudinary-product' por tu upload_preset de Cloudinary

    this.cloudinaryService.uploadImg(formData).subscribe(
      (response: any) => {
        if (response && response.secure_url) {
          console.log('URL de la imagen subida:', response.secure_url);
          resolve(response.secure_url);
        } else {
          console.error('No se recibió la URL de la imagen desde Cloudinary.');
          reject('No se recibió la URL de la imagen desde Cloudinary.');
        }
      },
      error => {
        console.error('Error al subir imagen a Cloudinary:', error);
        reject(error);
      }
    );
  });
}

// Método para crear restaurante, llamando a subirImagenYObtenerUrl() antes de crear
crearRestaurante(): void {
  if (this.restauranteForm.valid) {
    const nuevoRestaurante = this.restauranteForm.value;
    nuevoRestaurante.horarioFuncionamiento = `${nuevoRestaurante.horaApertura} - ${nuevoRestaurante.horaCierre}`;

    // Subir imagen a Cloudinary antes de crear el restaurante
    if (this.opcionImagen === 'subir' && this.selectedFile) {
      this.subirImagenYObtenerUrl().then((urlImagen: string) => {
        nuevoRestaurante.imagenRestaurante = urlImagen;
        this.crearRestauranteEnBackend(nuevoRestaurante);
      }).catch((error) => {
        Swal.fire('Error', 'No se pudo subir la imagen.', 'error');
      });
    } else if (this.opcionImagen === 'url' && this.restauranteForm.get('urlImagen')?.value) {
      nuevoRestaurante.imagenRestaurante = this.restauranteForm.get('urlImagen')?.value;
      this.crearRestauranteEnBackend(nuevoRestaurante); // Crear restaurante con la URL de la imagen
    } else {
      Swal.fire('Error', 'Por favor seleccione una imagen o ingrese una URL.', 'error');
    }
  } else {
    Swal.fire('Error', 'Por favor complete el formulario correctamente.', 'error');
  }
}

crearRestauranteEnBackend(nuevoRestaurante: any): void {
  this.restauranteService.crearRestaurante(nuevoRestaurante).subscribe(
    (restauranteCreado: any) => {
      Swal.fire('Creado!', 'El restaurante ha sido creado exitosamente.', 'success');
      this.restauranteForm.reset();
      this.listarRestaurantes();
    },
    (error: any) => {
      console.error('Error al crear restaurante', error);
      Swal.fire('Error', 'Hubo un problema al crear el restaurante. Por favor, inténtelo de nuevo.', 'error');
    }
  );
}


  cambiarOpcionImagen(opcion: string) {
    this.opcionImagen = opcion;
    this.imagenPreview = null;
    this.restauranteForm.get('imagenRestaurante')?.setValue('');
    this.restauranteForm.get('urlImagen')?.setValue('');
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
  agregarPlatoMenu() {
    const plato = prompt('Ingrese el nombre del plato para el menú:');
    if (plato) {
      this.platosMenu.push({ nombre: plato, descripcion: 'Descripción del plato del menú' });
    }
  }
  agregarPlatoCarta() {
    const plato = prompt('Ingrese el nombre del plato para la carta:');
    if (plato) {
      this.platosCarta.push({ nombre: plato, descripcion: 'Descripción del plato a la carta' });
    }
  }
  agregarBebida() {
    const bebida = prompt('Ingrese el nombre de la bebida:');
    if (bebida) {
      this.bebidas.push({ nombre: bebida, descripcion: 'Descripción de la bebida' });
    }
  }

mostrarPresentacion() {
  this.mostrarPresentacionRestaurante = true;
}

cerrarPresentacion() {
  this.mostrarPresentacionRestaurante = false;
}


formatearHorario(horario: string, tipo: 'apertura' | 'cierre'): string {
  const [apertura, cierre] = horario.split('-');
  return tipo === 'apertura' ? apertura.trim() : cierre.trim();
}

convertirAMPM(hora24: string): string {
  let [horas, minutos] = hora24.split(':');
  const periodo = +horas >= 12 ? 'pm' : 'am';
  horas = (+horas % 12 || 12).toString();
  return `${horas}:${minutos} ${periodo}`;
}

verificarEstadoRestaurante() {
  const horario = this.restauranteSeleccionado.horarioFuncionamiento;
  const [apertura, cierre] = horario.split('-');

  const horaActual = new Date().getHours();
  const aperturaHora = +apertura.split(':')[0];
  const cierreHora = +cierre.split(':')[0];

  // Verificar si la hora actual está entre la hora de apertura y cierre del restaurante
  this.estaAbierto = horaActual >= aperturaHora && horaActual < cierreHora && this.restauranteSeleccionado.estadoActivo;
}


ajustarHora(hora: number): string {
  return hora < 10 ? `0${hora}` : `${hora}`;
}

ajustarMinutos(minutos: number): string {
  return minutos < 10 ? `0${minutos}` : `${minutos}`;
}

estaDentroDelHorario(actual: string, apertura: string, cierre: string): boolean {
  const [horaActual, minutoActual] = actual.split(':').map(Number);
  const [horaApertura, minutoApertura] = apertura.split(':').map(Number);
  const [horaCierre, minutoCierre] = cierre.split(':').map(Number);

  const timeActual = horaActual * 60 + minutoActual;
  const timeApertura = horaApertura * 60 + minutoApertura;
  const timeCierre = horaCierre * 60 + minutoCierre;

  return timeActual >= timeApertura && timeActual <= timeCierre;
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
        orientation: 'landscape' // también se puede usar 'portrait'
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

        // Agregar texto debajo del logo
        const slogan = "Disfruta de la mejor gastronomía con Gastro Connect";
        const sloganX = pageWidth / 2; // Centrar el eslogan
        const sloganY = logoHeight; // Posición Y debajo del logo
        doc.setTextColor(31, 30, 30); // Color del texto #1F1E1E
        doc.setFontSize(12); // Tamaño de fuente para el eslogan
        doc.text(slogan, sloganX, sloganY, { align: 'center' }); // Alineación centrada

        const fecha = new Date().toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }).replace(/ /g, '/').replace(/\//g, '-');
        
        doc.setFont('courier', 'bold');
        doc.setFontSize(20);
        const titulo = 'Reporte de Restaurantes';
        const tituloY = sloganY + 10; // Espacio después del eslogan
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
        const pageCount = doc.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
          doc.setPage(i);
          // Configurar el estilo del pie de página
          doc.setFont('courier', 'normal');
          doc.setFontSize(10);
          // Establecer el color de la letra
          doc.setTextColor(31, 30, 30); // Usando RGB
          // Calcular la posición para el número de página alineado a la esquina inferior derecha
          const pageNumberText = `Página ${i}`;
          const pageSize = doc.internal.pageSize;
          const pageWidth = pageSize.getWidth();
          const pageHeight = pageSize.getHeight();
          const footerY = pageHeight - 10; // Ajusta este valor según sea necesario
          // Añadir el número de página
          doc.text(pageNumberText, pageWidth - doc.getTextWidth(pageNumberText) - 10, footerY); // Alineado a la derecha
        }
        
        doc.save('reporte_restaurantes.pdf');
    };
}

}
