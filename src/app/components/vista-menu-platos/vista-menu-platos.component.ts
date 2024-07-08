import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-vista-menu-platos',
  templateUrl: './vista-menu-platos.component.html',
  styleUrl: './vista-menu-platos.component.css'
})
export class VistaMenuPlatosComponent {

  selectedOption: string = '';

  selectOption(option: string) {
    this.selectedOption = option;
  }
}