import { Component, OnInit } from '@angular/core';
import { Comida } from '../../../models/menu/comida/comida';
import { ComidaService } from '../../../services/menu/comida/comida.service';
import { FormGroup, FormControl } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
//seleccionar menu importar
import { MenuService } from '../../../services/menu/menu/menu.service';
import { Menu } from '../../../models/menu/menu/menu';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { CloudinaryService } from '../../../services/cloudinary/Cloudinary.service';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-comida',
  templateUrl: './crear-comida.component.html',
  styleUrls: ['./crear-comida.component.css']
})
export class CrearComidaComponent implements OnInit {
  
  filtroForm!: FormGroup;
  comidas!: Comida[];
  nuevaComida: Comida = { comidaid: null!, nombrec: '', categoria: '', precio: null!, stock: null!,image:null!, menuid: null!, estado: 'A' };
  editandoId: number | null = null;
  filtroEstado: string = 'A';
  menus: Menu[] = [];
  selectedFile: File | null = null;
  errorAlCargarComidas: boolean = false;
  pagination = {
    currentPage: 1,
    itemsPerPage: 4 // Example: adjust based on your pagination needs
  };
  terminoBusqueda: string = '';


  constructor(private comidaService: ComidaService, private menuService: MenuService, private cloudinaryService: CloudinaryService) {
  }


  


  ngOnInit(): void {
    this.filtroForm = new FormGroup({
      filtro: new FormControl('todos')
    });

    this.getComidasByEstado(this.filtroEstado);
    this.getMenus();
  }

  buscarComidas(): void {
    if (this.terminoBusqueda.trim() !== '') {
      const termino = this.terminoBusqueda.toLowerCase();
      this.comidas = this.comidas.filter(comida =>
        comida.nombrec.toLowerCase().includes(termino) ||
        comida.categoria.toLowerCase().includes(termino) ||
        this.obtenerNombreMenu(comida.menuid).toLowerCase().includes(termino)
      );
    } else {
      this.getComidasByEstado(this.filtroEstado); // Restaurar el listado completo si el campo de búsqueda está vacío
    }
  }

  

  pageChanged(event: any): void {
    this.pagination.currentPage = event;
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.nuevaComida = { comidaid: null!, nombrec: '', categoria: '', precio: null!, stock: null!, image: null!, menuid: null!, estado: 'A' };
    this.selectedFile = null;

  }
  


   // Método para manejar la selección de archivo
   onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  // Método para subir la imagen a Cloudinary
  uploadImageToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'cloudinary-menuplates');

    return new Promise((resolve, reject) => {
      this.cloudinaryService.uploadImg(formData).subscribe(
        (response: any) => {
          if (response && response.secure_url) {
            resolve(response.secure_url);
          } else {
            reject('Error al subir imagen a Cloudinary.');
          }
        },
        error => {
          reject(error);
        }
      );
    });
  }

  getMenus() {
    this.menuService.getAllMenu().subscribe(res => this.menus = res);
  }

  getComidasByEstado(estado: string): void {
    this.comidaService.getComidasByEstado(estado)
      .subscribe({
        next: data => {
          this.comidas = data;
          this.errorAlCargarComidas = false;
          console.log(this.comidas);
        },
        error: err => {
          console.error('Error al cargar las comidas:', err);
          this.errorAlCargarComidas = true;
          this.comidas = [];
        }
      });
  }

  cambiarFiltroEstado(): void {
    this.getComidasByEstado(this.filtroEstado);
  }

  eliminarComida(id: number): void {
    this.comidaService.eliminarComida(id)
      .subscribe({
        next: () => {
          this.comidas = this.comidas.filter(comida => comida.comidaid !== id);
          Swal.fire({
            title: "Producto eliminado!",
            icon: "success"
          });
        },
        error: (error) => {
          console.error('Error al eliminar comida:', error);
          Swal.fire({
            title: "No se pudo eliminar el producto!",
            icon: "error"
          });
        }
      });
  }

  restaurarComida(id: number): void {
    this.comidaService.restaurarComida(id)
      .subscribe(() => {
        this.actualizarComida(id, 'A');
        this.comidas = this.comidas.filter(comida => comida.comidaid !== id);
        Swal.fire({
          title: "Producto restaurado!",
          icon: "success"
        });
      }, error => {
        console.error('Error al restaurar comida:', error);
        Swal.fire({
          title: "No se pudo restaurar el producto!",
          icon: "error"
        });
      });
  }

  editarComida(id: number): void {
    this.editandoId = id;
    const comidaEditando = this.comidas.find(comida => comida.comidaid === id);
    if (comidaEditando) {
      this.nuevaComida = {
        comidaid: comidaEditando.comidaid,
        nombrec: comidaEditando.nombrec,
        categoria: comidaEditando.categoria,
        precio: comidaEditando.precio,
        stock: comidaEditando.stock,
        image: comidaEditando.image,
        menuid: comidaEditando.menuid,
        estado: comidaEditando.estado
      };
    }
  }

  guardarEdicion(): void {
    if (!this.nuevaComida.nombrec || !this.nuevaComida.categoria) {
      console.log('Por favor, completa los campos de Nombre y Categoría.');
      return;
    }

    // Validación de precio y stock no negativos
    if (this.nuevaComida.precio <= 0 || this.nuevaComida.stock <= 0) {
      Swal.fire({
        title: "Error",
        text: "El precio y el stock deben ser mayores que 0.",
        icon: "error"
      });
      return;
    }

    const saveComida = () => {
      if (this.editandoId !== null) {
        this.comidaService.editarComida(this.editandoId, this.nuevaComida)
          .pipe(
            switchMap(() => this.comidaService.getComidasByEstado(this.filtroEstado))
          )
          .subscribe(
            (data) => {
              console.log('Comida actualizada correctamente.');
              this.editandoId = null;
              this.nuevaComida = { comidaid: null!, nombrec: '', categoria: '', precio: null!, stock: null!, image: null!, menuid: null!, estado: 'A' };
              this.comidas = data;
              Swal.fire({
                title: "Producto editado!",
                icon: "success"
              });
            },
            error => {
              console.error('Error al actualizar comida:', error);
              Swal.fire({
                title: "Error al editar el producto!",
                icon: "error"
              });
            }
          );
      } else {
        this.comidaService.crearComida(this.nuevaComida)
          .pipe(
            switchMap(() => this.comidaService.getComidasByEstado(this.filtroEstado))
          )
          .subscribe(
            (data) => {
              console.log('Comida creada correctamente.');
              this.nuevaComida = { comidaid: null!, nombrec: '', categoria: '', precio: null!, stock: null!, image: null!, menuid: null!, estado: 'A' };
              this.comidas = data;
              Swal.fire({
                title: "Producto agregado!",
                icon: "success"
              });
            },
            error => {
              console.error('Error al crear nueva comida:', error);
              Swal.fire({
                title: "No se pudo crear el producto!",
                icon: "error"
              });
            }
          );
      }
    };

    if (this.selectedFile) {
      this.uploadImageToCloudinary(this.selectedFile)
        .then(url => {
          this.nuevaComida.image = url;
          saveComida();
        })
        .catch(error => {
          console.error('Error al subir imagen a Cloudinary:', error);
          Swal.fire({
            title: "Error",
            text: "No se pudo subir la imagen",
            icon: "error"
          });
        });
    } else {
      saveComida();
    }
  }

  private actualizarComida(id: number, estado: string): void {
    const comidaIndex = this.comidas.findIndex(comida => comida.comidaid === id);
    if (comidaIndex !== -1) {
      this.comidas[comidaIndex].estado = estado;
    }
  }

  validarLetras(event: any) {
    const pattern = /[A-Za-z\s]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  validarNumeros(event: any) {
    const pattern = /[0-9,.]+/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  cambiarFiltro(estado: boolean): void {
    this.filtroEstado = estado ? 'A' : 'I';
    this.getComidasByEstado(this.filtroEstado);
  }

  mostrarBoton(estadoComida: string): boolean {
    if (this.filtroEstado === 'A') {
      return estadoComida === 'A';
    } else {
      return estadoComida === 'I';
    }
  }
  //para cambiar el menuid a nombre del menu
  obtenerNombreMenu(menuId: number): string {
    const menu = this.menus.find(menu => menu.menuid === menuId);
    return menu ? menu.nombrem : 'Menu no encontrado';
  }

  exportarAExcel(): void {
    Swal.fire({
      title: 'Confirmación',
      text: 'Estas apunto de exportar los productos!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes!'
    }).then((result) => {
      if (result.isConfirmed) {
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.comidas);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, 'comidas.xlsx');

        Swal.fire({
          title: 'Reporte realizado!',
          icon: 'success'
        });
      }
    });
  }

  exportarAPDF(): void {
    const doc = new jsPDF({
      orientation: 'landscape' // or 'portrait'
    });

    const img = new Image();
    img.src = 'assets/img/Logo Transparente Gastro Connect.png'; // Ruta local a la imagen en tu proyecto Angular
    img.onload = () => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const logoWidth = pageWidth * 0.2;
      const logoHeight = img.height * (logoWidth / img.width);
      const logoX = (pageWidth - logoWidth) / 2;
      doc.addImage(img, 'PNG', logoX, 10, logoWidth, logoHeight);

      // Agregar la frase debajo de la imagen
      doc.setFont('courier', 'normal');
      doc.setFontSize(14);
      const frase = 'Disfruta de la mejor gastronomía con Gastro Connect';
      const fraseY = logoHeight + 20;
      doc.text(frase, pageWidth / 2, fraseY, { align: 'center' });

      const fecha = this.formatDate(new Date());

      doc.setFont('courier', 'bold');
      doc.setFontSize(20);
      const titulo = 'Reporte de Comidas'; // Título ajustado
      const tituloY = fraseY + 20;
      doc.text(titulo, 14, tituloY);

      doc.setFontSize(12);
      const fechaX = pageWidth - 14;
      doc.text(`Fecha: ${fecha}`, fechaX, tituloY, { align: 'right' });

      const head = [['Nombre', 'Categoría', 'Precio', 'Stock', 'Imagen', 'Menú']];
      const data = this.comidas.map((comida: Comida) => [
        comida.nombrec,
        comida.categoria,
        comida.precio.toString(),
        comida.stock.toString(),
        comida.image,
        this.obtenerNombreMenu(comida.menuid)
      ]);

      const startY = tituloY + 10;

      // Generar tabla con paginación
      let pageNumber = 1;
      (doc as any).autoTable({
        head: head,
        body: data,
        startY: startY,
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
        didDrawPage: () => {
          // Dibujar número de página
          const pageCurrentText = `Página ${pageNumber}`;
          const pageTotalText = ` de ${doc.internal.pages.length - 1}`;
          const text = pageCurrentText + pageTotalText;
          doc.setFontSize(10);
          doc.text(text, pageWidth - 14, pageHeight - 10, { align: 'right' });
          pageNumber++;
        }
      });

      doc.save('Reporte_Comidas.pdf'); // Nombre del archivo PDF ajustado
    };
  }

  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

}