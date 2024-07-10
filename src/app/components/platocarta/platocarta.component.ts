import { Component, ElementRef, ViewChild } from '@angular/core';


declare var $: any;

@Component({
  selector: 'app-platocarta',
  templateUrl: './platocarta.component.html',
  styleUrls: ['./platocarta.component.css'] // Corregido de styleUrl a styleUrls
})
export class PlatocartaComponent {

  selectedComponent: string = 'presentacion'; // Inicia con el componente 'presentacion' visible

  showComponent(component: string): void {
    this.selectedComponent = component;
  }



}

