import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { RestauranteService } from '../../../services/restaurant/restaurante.service';
import jsPDF from 'jspdf';
import { AuthService } from '../../../services/auth/authService';
import { CloudinaryService } from '../../../services/cloudinary/Cloudinary.service';
import { map, Observable } from 'rxjs';

declare var $: any;



@Component({
  selector: 'app-restaurante',
  templateUrl: './restaurante.component.html',
  styleUrls: ['./restaurante.component.css']
})
export class RestauranteComponent implements OnInit {
  restauranteForm: FormGroup;
  restaurantes: any[] = [];
  restauranteSeleccionado: any = null;
  selectedFile: File | undefined;
  imagenPreview: string | ArrayBuffer | null = null;
  opcionImagen: string = 'subir'; // o 'url', según prefieras inicialmente
  platosMenu: any[] = [];
  platosCarta: any[] = [];
  bebidas: any[] = [];
  mostrarPresentacionRestaurante: boolean = false;
  estaAbierto: boolean = false;
  userRuc: string = '';
  page: number = 1; // Página actual
  totalRestaurantes: number = 0; // Total de restaurantes

  constructor(
    private restauranteService: RestauranteService,
    private fb: FormBuilder,
    private authService: AuthService,
    private cloudinaryService: CloudinaryService
  ) {
    this.restauranteForm = this.fb.group({
      id: [''], // Se mantiene oculto para el usuario pero se utiliza internamente para edición
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
      ruc: [''],

      opcionImagen: ['subir'], // Añade esto si no está ya
    });
    this.totalRestaurantes = 0;

  }

  async ngOnInit(): Promise<void> {
    const userUid = await this.authService.getUserUid();
    this.restauranteForm.get('docid')?.setValue(userUid || ''); // Verifica que userUid no sea nulo


    this.listarRestaurantes();

    this.restauranteForm.get('opcionImagen')?.valueChanges.subscribe(value => {
      this.opcionImagen = value;
      // Resetea los valores relacionados con la imagen cuando cambia la opción
      this.restauranteForm.patchValue({
        urlImagen: '',
        imagenRestaurante: ''
      });
      this.selectedFile = undefined;
      this.imagenPreview = null;
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files?.length > 0 ? event.target.files[0] : null;
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  subirImagenYObtenerUrl(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.selectedFile) {
        console.error('No se ha seleccionado ningún archivo.');
        reject('No se ha seleccionado ningún archivo.');
        return;
      }

      const formData = new FormData();
      formData.append('file', this.selectedFile);
      formData.append('upload_preset', 'cloudinary-restaurants');

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

  manejarImagenRestaurante(): Promise<void> {
    return new Promise((resolve, reject) => {
      const opcionImagen = this.restauranteForm.get('opcionImagen')?.value;
      
      if (opcionImagen === 'subir' && this.selectedFile) {
        this.subirImagenYObtenerUrl().then((urlImagen: string) => {
          console.log('URL de imagen obtenida:', urlImagen); // Para depuración
          this.restauranteForm.patchValue({ imagenRestaurante: urlImagen });
          console.log('Formulario después de asignar URL:', this.restauranteForm.value); // Para depuración
          resolve();
        }).catch((error) => {
          console.error('Error al subir imagen:', error); // Para depuración
          reject(error);
        });
      } else if (opcionImagen === 'url') {
        const urlImagen = this.restauranteForm.get('urlImagen')?.value;
        if (urlImagen) {
          this.restauranteForm.patchValue({ imagenRestaurante: urlImagen });
          console.log('Formulario después de asignar URL:', this.restauranteForm.value); // Para depuración
          resolve();
        } else {
          reject('Por favor ingrese una URL de imagen válida.');
        }
      } else {
        reject('Por favor seleccione una imagen o ingrese una URL.');
      }
    });
  }

  manejarRestauranteForm(): void {
    if (this.restauranteForm.valid) {
      const ruc = this.restauranteForm.get('ruc')?.value;
  
      // Si estamos editando un restaurante existente, permitimos continuar
      if (this.restauranteForm.get('id')?.value) {
        this.procesarFormulario();
      } else {
        // Verificamos si el RUC ya existe
        this.restauranteService.verificarRucExistente(ruc).subscribe(
          (existe: boolean) => {
            if (existe) {
              Swal.fire('Error', 'El RUC ingresado ya está en uso por otro restaurante.', 'error');
            } else {
              // Si estamos creando un nuevo restaurante, verificamos el límite
              if (this.totalRestaurantes >= 3) {
                Swal.fire('Límite alcanzado', 'No se pueden crear más de 3 restaurantes.', 'warning');
              } else {
                // Mostrar el SweetAlert de confirmación
                Swal.fire({
                  title: 'Confirmación',
                  text: '¿Estás seguro de que deseas crear este restaurante? El RUC no se podrá editar más adelante.',
                  icon: 'warning',
                  showCancelButton: true,
                  confirmButtonText: 'Sí, crear',
                  cancelButtonText: 'No, cancelar'
                }).then((result) => {
                  if (result.isConfirmed) {
                    this.procesarFormulario();
                  }
                });
              }
            }
          },
          (error) => {
            console.error('Error al verificar RUC', error);
            Swal.fire('Error', 'Hubo un problema al verificar el RUC. Por favor, inténtelo de nuevo.', 'error');
          }
        );
      }
    } else {
      Swal.fire('Error', 'Por favor complete el formulario correctamente.', 'error');
    }
  }
  
  // Método auxiliar para procesar el formulario
  private procesarFormulario(): void {
    this.manejarImagenRestaurante().then(() => {
      const restauranteData = this.restauranteForm.value;
      restauranteData.horarioFuncionamiento = `${restauranteData.horaApertura} - ${restauranteData.horaCierre}`;
      
      console.log('Datos del restaurante antes de enviar:', restauranteData);
      
      if (restauranteData.id) {
        this.editarRestaurante(restauranteData);
      } else {
        this.crearRestaurante(restauranteData);
      }
    }).catch((error) => {
      console.error('Error al manejar la imagen:', error);
      Swal.fire('Error', 'Hubo un problema al procesar la imagen. Por favor, inténtelo de nuevo.', 'error');
    });
  }

  crearRestaurante(nuevoRestaurante: any): void {
    this.restauranteService.crearRestaurante(nuevoRestaurante).subscribe(
      (restauranteCreado: any) => {
        Swal.fire('Creado!', 'El restaurante ha sido creado exitosamente.', 'success');
        this.restauranteForm.reset();
        this.listarRestaurantes(); // Esto actualizará el totalRestaurantes
      },
      (error: any) => {
        console.error('Error al crear restaurante', error);
        Swal.fire('Error', 'Hubo un problema al crear el restaurante. Por favor, inténtelo de nuevo.', 'error');
      }
    );
  }




  

  editarRestaurante(restauranteActualizado: any): void {
    const idRestaurante = restauranteActualizado.id;
    this.restauranteService.editarRestaurante(idRestaurante, restauranteActualizado).subscribe(
      (restauranteActualizado: any) => {
        Swal.fire('Actualizado!', 'El restaurante ha sido actualizado exitosamente.', 'success');
        this.restauranteForm.reset();
        this.listarRestaurantes();
      },
      (error: any) => {
        console.error('Error al actualizar restaurante', error);
        Swal.fire('Error', 'Hubo un problema al actualizar el restaurante. Por favor, inténtelo de nuevo.', 'error');
      }
    );
  }

  listarRestaurantes(): void {
    this.restauranteService.obtenerTodosPorGestor().subscribe(
      (data: any[]) => {
        this.restaurantes = data;
        this.totalRestaurantes = data.length;
      },
      (error: any) => {
        console.error('Error al obtener restaurantes', error);
        Swal.fire('Error', 'Hubo un problema al obtener los restaurantes. Por favor, inténtelo de nuevo.', 'error');
      }
    );
  }

  cancelarEdicion(): void {
    this.restauranteForm.reset();
  }

  desactivarRestaurante(restaurante: any): void {
    this.restauranteService.desactivarRestaurante(restaurante.id).subscribe(
      () => {
        Swal.fire('Desactivado!', 'El restaurante ha sido desactivado exitosamente.', 'success');
        this.listarRestaurantes();
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
        Swal.fire('Restaurado!', 'El restaurante ha sido restaurado exitosamente.', 'success');
        this.listarRestaurantes();
      },
      (error: any) => {
        console.error('Error al restaurar restaurante', error);
        Swal.fire('Error', 'Hubo un problema al restaurar el restaurante. Por favor, inténtelo de nuevo.', 'error');
      }
    );
  }

  verRestaurante(restaurante: any): void {
    // Primero, copiamos todos los datos del restaurante al formulario
    this.restauranteForm.patchValue(restaurante);
    
    // Luego, manejamos específicamente el horarioFuncionamiento
    if (restaurante.horarioFuncionamiento) {
      // Asumimos que el formato es "HH:MM - HH:MM"
      const [horaApertura, horaCierre] = restaurante.horarioFuncionamiento.split(' - ');
      
      // Actualizamos los campos específicos
      this.restauranteForm.patchValue({
        horaApertura: horaApertura,
        horaCierre: horaCierre
      });
    }
  
    // Aseguramos que el ID y el estado se establezcan correctamente
    this.restauranteForm.get('id')?.setValue(restaurante.id);
    this.restauranteForm.get('estado')?.setValue(restaurante.estado);
  
    // Si hay una imagen, actualizamos la vista previa
    if (restaurante.imagenRestaurante) {
      this.imagenPreview = restaurante.imagenRestaurante;
      this.restauranteForm.patchValue({
        opcionImagen: 'url',
        urlImagen: restaurante.imagenRestaurante
      });
    } else {
      this.imagenPreview = null;
      this.restauranteForm.patchValue({
        opcionImagen: 'subir',
        urlImagen: ''
      });
    }
  }


  exportarCSV(): void {
    let csvData = 'Nombre,Dirección,Teléfono,Tipo de Cocina,Capacidad,Horario,Ruc\n';
    
    this.restaurantes.forEach(restaurante => {
      csvData += `${restaurante.nombre},${restaurante.direccion},${restaurante.telefono},${restaurante.tipoCocina},${restaurante.capacidadPersonas},${restaurante.horarioFuncionamiento},${restaurante.ruc}\n`;
    });
  
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'reporte_restaurantes.csv');
    link.style.visibility = 'hidden';
  
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  

  exportarPDF(): void {
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
      const sloganY = logoHeight + 10;
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
      const titulo = 'Reporte de Restaurantes';
      const tituloY = sloganY + 10;
      doc.text(titulo, 14, tituloY);
  
      doc.setFontSize(12);
      const fechaX = pageWidth - 14;
      doc.text(`Fecha: ${fecha}`, fechaX, tituloY, { align: 'right' });
  
      const head = [['Nombre', 'Dirección', 'Teléfono', 'Tipo de Cocina', 'Capacidad', 'Horario', 'Ruc']];
      const data = this.restaurantes.map((restaurante) => [
        restaurante.nombre,
        restaurante.direccion,
        restaurante.telefono,
        restaurante.tipoCocina,
        restaurante.capacidadPersonas,
        restaurante.horarioFuncionamiento,
        restaurante.ruc
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
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        },
        bodyStyles: {
          textColor: [0, 0, 0]
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
        const pageNumberText = `Página ${i} / ${pageCount}`;
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const footerY = pageHeight - 10;
        doc.text(pageNumberText, pageWidth - doc.getTextWidth(pageNumberText) - 10, footerY, { align: 'right' });
      }
  
      doc.save('reporte_restaurantes.pdf');
    };
  }
  
  
}
