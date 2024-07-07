export class ReservaDetalleDto {
    id: number;
    id_reserva: number;
    comidaid: number;
    nombrepedido: string;
    cantidad: number;
    estado: string;

    constructor() {
        this.id = 0;
        this.id_reserva = 0;
        this.comidaid = 0;
        this.nombrepedido = '';
        this.cantidad = 0;
        this.estado = '';
    }
}
  