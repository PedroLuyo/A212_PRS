import { Component } from '@angular/core';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  currentView: string = 'menu';

  setView(view: string): void {
    this.currentView = view;
  }
}
