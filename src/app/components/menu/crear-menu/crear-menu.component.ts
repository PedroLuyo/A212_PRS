import { Component, OnInit } from '@angular/core';
import { Menu } from '../../../models/menu/menu';
import { MenuService } from '../../../services/menu/menu.service';
import { FormGroup, FormControl } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-menu',
  templateUrl: './crear-menu.component.html',
  styleUrl: './crear-menu.component.css'
})
export class CrearMenuComponent implements OnInit {
  filtroForm!: FormGroup;
  menus!: Menu[];
  nuevoMenu: Menu = { menuid: null!, nombrem: '', estado: 'A' };
  editandoId: number | null = null;
  filtroEstado: string = 'A';

  constructor(private menuService: MenuService) {}

  ngOnInit(): void {
    this.filtroForm = new FormGroup({
      filtro: new FormControl('todos')
    });

    this.getMenusByEstado(this.filtroEstado);
  }

  getMenusByEstado(estado: string): void {
    this.menuService.getMenusByEstado(estado)
      .subscribe(data => {
        this.menus = data.filter(menu => estado === 'A' || (estado === 'I' && menu.estado === 'I'));
      });
  }

  cambiarFiltroEstado(): void {
    this.getMenusByEstado(this.filtroEstado);
  }
  
  eliminarMenu(id: number): void {
    this.menuService.eliminarMenu(id)
      .subscribe(() => {
        this.menus = this.menus.filter(menu => menu.menuid !== id);
      }, error => console.error('Error al eliminar menú:', error));
  }
  
  restaurarMenu(id: number): void {
    this.menuService.restaurarMenu(id)
      .subscribe(
        () => this.actualizarMenu(id, 'A'),
        error => console.error('Error al restaurar menú:', error)
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
          },
          error => console.error('Error al actualizar menú:', error)
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
          },
          error => console.error('Error al crear nuevo menú:', error)
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
    const pattern = /[A-Za-z\s]/;
    const inputChar = String.fromCharCode(event.charCode);
    if (!pattern.test(inputChar)) {
      event.preventDefault();
    }
  }

  cambiarFiltro(estado: boolean): void {
    this.filtroEstado = estado ? 'A' : 'I';
    this.getMenusByEstado(this.filtroEstado);
  }

    //refactorizar el código
    mostrarBoton(estadoMenu: string): boolean {
      return this.filtroEstado === 'A' ? estadoMenu === 'A' : estadoMenu === 'I';
    }


    exportarAExcel(): void {
      Swal.fire({
        title: 'estas seguro?',
        text: 'que quieres exportar!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes!'
      }).then((result) => {
        if (result.isConfirmed) {
          const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.menus);
          const wb: XLSX.WorkBook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
          XLSX.writeFile(wb, 'menus.xlsx');
    
          Swal.fire({
            title: 'Exitoso!',
            text: 'Exportacion exitosa.',
            icon: 'success'
          });
        }
      });
    }
    
}
