import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { MenuService } from '../../../services/menu/menu/menu.service';
import { Menu } from '../../../models/menu/menu/menu';
import { NgxPaginationModule } from 'ngx-pagination';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-crearmenu',
  templateUrl: './crear-menu.html',
  styleUrls: ['./crear-menu.css']
})
export class CrearMenu implements OnInit {
  filtroForm!: FormGroup;
  menus!: Menu[];
  pagedMenus: Menu[] = [];
  nuevoMenu: Menu = { menuid: null!, nombrem: '', estado: 'A' };
  editandoId: number | null = null;
  filtroEstado: string = 'A';
  filtroNombre: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 4; // Ajusta según tus necesidades de paginación


  errorAlCargarMenus: boolean = false;

  constructor(private menuService: MenuService) { }

  ngOnInit(): void {
    this.filtroForm = new FormGroup({
      filtro: new FormControl('todos')
    });

    this.getMenusByEstado(this.filtroEstado);
  }

  getMenusByEstado(estado: string): void {
    this.menuService.getMenusByEstado(estado)
      .subscribe({
        next: (data) => {
          this.menus = data;
          this.setPage(this.currentPage); // Asegura que se establezca la página correctamente
        },
        error: (err) => {
          console.error('Error al cargar los menús:', err);

        }});
  }

  cambiarFiltroEstado(): void {
    this.getMenusByEstado(this.filtroEstado);
  }

  eliminarMenu(id: number): void {
    this.menuService.eliminarMenu(id)
      .subscribe(() => {
        this.menus = this.menus.filter(menu => menu.menuid !== id);
        Swal.fire({
          title: "Menú eliminado!",
          icon: "success"
        });
      }, error => {
        console.error('Error al eliminar menú:', error);
        Swal.fire({
          title: "Error al eliminar Menu!",
          icon: "error"
        });
      });
  }

  restaurarMenu(id: number): void {
    this.menuService.restaurarMenu(id)
      .subscribe(
        () => {
          this.actualizarMenu(id, 'A');
          Swal.fire({
            title: "Menú restaurado!",
            icon: "success"
          });
          this.getMenusByEstado(this.filtroEstado);
        },
        error => {
          console.error('Error al restaurar menú:', error);
          Swal.fire({
            title: "Error al restaurar Menu!",
            icon: "error"
          });
        }
      );
  }

  editarMenu(id: number): void {
    this.editandoId = id;
    const menuEditando = this.menus.find(menu => menu.menuid === id);
    if (menuEditando) {
      this.nuevoMenu = {
        menuid: menuEditando.menuid,
        nombrem: menuEditando.nombrem,
        estado: menuEditando.estado
      };
    }
  }

  guardarEdicion(): void {
    if (!this.nuevoMenu.nombrem) {
      console.log('Por favor, completa el campo de Nombre.');
      return;
    }

    if (this.editandoId !== null) {
      this.menuService.editarMenu(this.editandoId, this.nuevoMenu)
        .pipe(
          switchMap(() => this.menuService.getMenusByEstado(this.filtroEstado))
        )
        .subscribe(
          (data) => {
            console.log('Menú actualizado correctamente.');
            this.editandoId = null;
            this.nuevoMenu = { menuid: null!, nombrem: '', estado: 'A' };
            this.menus = data;
            Swal.fire({
              title: "Menú editado!",
              icon: "success"
            });
          },
          error => {
            console.error('Error al actualizar menú:', error);
            Swal.fire({
              title: "Error al actualizar Menu!",
              icon: "error"
            });
          }
        );
    } else {
      this.menuService.crearMenu(this.nuevoMenu)
        .pipe(
          switchMap(() => this.menuService.getMenusByEstado(this.filtroEstado))
        )
        .subscribe(
          (data) => {
            console.log('Menú creado correctamente.');
            this.nuevoMenu = { menuid: null!, nombrem: '', estado: 'A' };
            this.menus = data;
            Swal.fire({
              title: "Menú agregado!",
              icon: "success"
            });
          },
          error => {
            console.error('Error al crear nuevo menú:', error);
            Swal.fire({
              title: "Error al crear Menu!",
              icon: "error"
            });
          }
        );
    }
  }

  private actualizarMenu(id: number, estado: string): void {
    const menuIndex = this.menus.findIndex(menu => menu.menuid === id);
    if (menuIndex !== -1) {
      this.menus[menuIndex].estado = estado;
    }
  }

  validarLetras(event: any) {
    const pattern = /[A-Za-záéíóúÁÉÍÓÚñÑ\s]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  mostrarBoton(estadoMenu: string): boolean {
    return this.filtroEstado === 'A' ? estadoMenu === 'A' : estadoMenu === 'I';
  }

  cancelarEdicion(): void {
    this.editandoId = null;
    this.nuevoMenu = { menuid: null!, nombrem: '', estado: 'A' };
  }

  setPage(page: number): void {
    this.currentPage = page;
    const startIndex = (page - 1) * this.itemsPerPage;
    this.pagedMenus = this.menus.slice(startIndex, startIndex + this.itemsPerPage);
  }

  exportarAExcel(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Quieres exportar los menús a Excel.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, exportar!'
    }).then((result) => {
      if (result.isConfirmed) {
        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.menus);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Menus');
        XLSX.writeFile(wb, 'menus.xlsx');

        Swal.fire({
          title: 'Éxito!',
          text: 'Exportación a Excel exitosa.',
          icon: 'success'
        });
      }
    });
  }

  filtrarMenus(): void {
    // Implement your filtering logic here
    // For example, filter menus based on filtroNombre
    this.pagedMenus = this.menus.filter(menu => {
      return menu.nombrem.toLowerCase().includes(this.filtroNombre.toLowerCase());
    });
  }
  

  exportarAPDF(): void {
    const doc = new jsPDF({
      orientation: 'landscape' // o 'portrait'
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
  
      // Agregar la frase debajo de la imagen
      doc.setFont('courier', 'normal');
      doc.setFontSize(14);
      const frase = 'Disfruta de la mejor gastronomía con Gastro Connect';
      const fraseY = logoHeight + 20;
      doc.text(frase, pageWidth / 2, fraseY, { align: 'center' });
  
      const fecha = this.formatDate(new Date());
  
      doc.setFont('courier', 'bold');
      doc.setFontSize(20);
      const titulo = 'Reporte de Menús'; // Título ajustado
      const tituloY = fraseY + 20;
      doc.text(titulo, 14, tituloY);
  
      doc.setFontSize(12);
      const fechaX = pageWidth - 14;
      doc.text(`Fecha: ${fecha}`, fechaX, tituloY, { align: 'right' });
  
      const head = [['Nombre']];
      const data = this.menus.map((menu: Menu) => [
        menu.nombrem
      ]);
  
      const startY = tituloY + 10;
  
      // Generar tabla sin paginación
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
        // didDrawPage se usa para obtener la cantidad total de páginas
        didDrawPage: () => {}
      });
  
      // Obtener el número total de páginas
      const totalPages = doc.internal.pages.length - 1;
  
      // Actualizar cada página con el número de página y total de páginas
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        const pageCurrentText = `Página ${i}`;
        const pageTotalText = ` de ${totalPages}`;
        const text = pageCurrentText + pageTotalText;
        doc.setFontSize(10);
        doc.text(text, pageWidth - 14, pageHeight - 10, { align: 'right' });
      }
  
      doc.save('Reporte_Menus.pdf'); // Nombre del archivo PDF ajustado
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
