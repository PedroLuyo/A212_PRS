import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-selector',
  templateUrl: './selector.component.html',
  styleUrls: ['./selector.component.css']
})
export class SelectorComponent {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  irARestaurante(): void {
    this.router.navigate(['/restaurante']);
  }

 

  irAGestor(): void {
    this.router.navigate(['/gestor']);
  }
}
