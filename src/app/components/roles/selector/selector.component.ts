import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.css']
})
export class SelectorComponent {
aplicarFiltroEstado: any;
getVisibleItems: any;
restaurarGestor(_t46: any) {
throw new Error('Method not implemented.');
}
desactivarGestor(_t46: any) {
throw new Error('Method not implemented.');
}
cancelarEdicion(_t46: any) {
throw new Error('Method not implemented.');
}
confirmarEdicion(_t46: any) {
throw new Error('Method not implemented.');
}
editarGestor(_t46: any) {
throw new Error('Method not implemented.');
}
  mostrarListadoGestores: boolean = false;
changePage: any;
getPageNumbers: any;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  irARestaurante(): void {
    this.router.navigate(['/restaurante']);
  }

  irAComensal(): void {
    // En lugar de navegar, cambia el estado para mostrar la lista de gestores
    this.mostrarListadoGestores = true;
  }

  irAGestor(): void {
    this.router.navigate(['/gestor']);
  }
}
