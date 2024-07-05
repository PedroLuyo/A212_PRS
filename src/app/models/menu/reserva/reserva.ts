export class ReservaDto {
    id_reserva: number;
    nombre: string;
    correo: string;
    hora_reserva: string;
    num_personas: number;
    situacion: string;
    monto_total: number;
    estado: string;

    constructor() {
        this.id_reserva = 0;
        this.nombre = '';
        this.correo = '';
        this.hora_reserva = '';
        this.num_personas = 0;
        this.situacion = '';
        this.monto_total = 0;
        this.estado = '';
    }
}