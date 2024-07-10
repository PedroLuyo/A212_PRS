import { Component, ElementRef, ViewChild } from '@angular/core';


declare var $: any;

@Component({
  selector: 'app-platocarta',
  templateUrl: './platocarta.component.html',
  styleUrls: ['./platocarta.component.css'] // Corregido de styleUrl a styleUrls
})
export class PlatocartaComponent {

  selectedComponent: string = 'productos'; // Inicia con el componente 'productos' visible

  showComponent(component: string): void {
    this.selectedComponent = component;
  }



}

