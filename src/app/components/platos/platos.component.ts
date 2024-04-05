import { Component, OnInit } from '@angular/core';
import { PlatosService } from '../../services/platos.service';

@Component({
  selector: 'app-platos',
  templateUrl: './platos.component.html',
  styleUrls: ['./platos.component.css']
})
export class PlatosComponent implements OnInit {

  platos: any[] = [];

  constructor(private platosService: PlatosService) { }

  ngOnInit(): void {
    this.loadPlatos();
  }

  private loadPlatos(): void {
    this.platosService.getPlatos().subscribe(
      platos => {
        this.platos = platos;
      },
      error => {
        console.error('Error fetching platos:', error);
      }
    );
  }
}
