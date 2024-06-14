import { Menu } from '../../../models/menu/menu';
import { Component, OnInit } from '@angular/core';
import { Comida } from '../../../models/menu/comida';
import { ComidaService } from '../../../services/menu/comida.service';
import { FormGroup, FormControl } from '@angular/forms';
import { switchMap } from 'rxjs/operators';
//seleccionar menu importar
import { MenuService } from '../../../services/menu/menu.service';

import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-crear-comida',
  templateUrl: './crear-comida.component.html',
  styleUrl: './crear-comida.component.css'
})
export class CrearComidaComponent implements OnInit {
  filtroForm!: FormGroup;
  comidas!: Comida[];
  nuevaComida: Comida = { comidaid: null!, nombrec: '', categoria: '', precio: null!, menuid: null!, estado: 'A' };
  editandoId: number | null = null;
  filtroEstado: string = 'A';
  //seleccionar menu
  menus: Menu[] = [];
                                                    //seleccionar menu
  constructor(private comidaService: ComidaService, private menuService: MenuService) {
  }

  ngOnInit(): void {
    this.filtroForm = new FormGroup({
      filtro: new FormControl('todos')
    });

    this.getComidasByEstado(this.filtroEstado);
    //seleccionar menu
    this.getMenus();
  }
  //seleccionar menu
  getMenus() {
    this.menuService.getAllMenu().subscribe(res=>this.menus=res);
  }

  getComidasByEstado(estado: string): void {
    this.comidaService.getComidasByEstado(estado)
      .subscribe(data => {
        this.comidas = data;
        console.log(this.comidas);
      });
  }

  cambiarFiltroEstado(): void {
    this.getComidasByEstado(this.filtroEstado);
  }
  
  eliminarComida(id: number): void {
    this.comidaService.eliminarComida(id)
      .subscribe(() => {
        this.comidas = this.comidas.filter(comida => comida.comidaid !== id);
      }, error => console.error('Error al eliminar comida:', error));
  }
  
  restaurarComida(id: number): void {
    this.comidaService.restaurarComida(id)
      .subscribe(
        () => this.actualizarComida(id, 'A'),
        error => console.error('Error al restaurar comida:', error)
      );
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

    if (this.editandoId !== null) {
      this.comidaService.editarComida(this.editandoId, this.nuevaComida)
        .pipe(
          switchMap(() => this.comidaService.getComidasByEstado(this.filtroEstado))
        )
        .subscribe(
          (data) => {
            console.log('Comida actualizada correctamente.');
            this.editandoId = null;
            this.nuevaComida = { comidaid: null!, nombrec: '', categoria: '', precio: null!, menuid: null!, estado: 'A' };
            this.comidas = data;
          },
          error => console.error('Error al actualizar comida:', error)
        );
    } else {
      this.comidaService.crearComida(this.nuevaComida)
        .pipe(
          switchMap(() => this.comidaService.getComidasByEstado(this.filtroEstado))
        )
        .subscribe(
          (data) => {
            console.log('Comida creada correctamente.');
            this.nuevaComida = { comidaid: null!, nombrec: '', categoria: '', precio: null!, menuid: null!, estado: 'A' };
            this.comidas = data;
          },
          error => console.error('Error al crear nueva comida:', error)
        );
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
      title: 'estas seguro?',
      text: 'que quieres exportar!',
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
          title: 'Exitoso!',
          text: 'Exportacion exitosa.',
          icon: 'success'
        });
      }
    });
  }
  

}