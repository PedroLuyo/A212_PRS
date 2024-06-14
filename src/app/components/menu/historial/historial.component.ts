import { Component, OnInit } from '@angular/core';
import { ReservaDetalleService } from '../../../services/menu/reserva-detalle.service';
import { ReservaDetalle } from '../../../models/menu/reserva-detalle';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.component.html',
  styleUrl: './historial.component.css'
})
export class HistorialComponent implements OnInit {
  reservaDetalles: ReservaDetalle[] = [];

  constructor(private reservaDetalleService: ReservaDetalleService
  ) { }

  ngOnInit(): void {
    this.getReservaDetalleList();
  }

  getReservaDetalleList(): void {
    this.reservaDetalleService.getReservaDetalleList().subscribe(data => {
      this.reservaDetalles = data;
    });
  }


}
