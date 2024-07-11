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
      formData.append('upload_preset', 'cloudinary-product');

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
      // Si estamos editando un restaurante existente, permitimos continuar
      if (this.restauranteForm.get('id')?.value) {
        this.procesarFormulario();
      } else {
        // Si estamos creando un nuevo restaurante, verificamos el límite
        if (this.totalRestaurantes >= 3) {
          Swal.fire('Límite alcanzado', 'No se pueden crear más de 3 restaurantes.', 'warning');
        } else {
          this.procesarFormulario();
        }
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
    this.restauranteForm.patchValue(restaurante);
    this.restauranteForm.get('id')?.setValue(restaurante.id);
    this.restauranteForm.get('estado')?.setValue(restaurante.estado);
  }
}
