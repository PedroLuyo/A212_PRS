export class ReservaRequestDto {
    nombre: string;
    correo: string;
    hora_reserva: string; // LocalTime se representa como string en TS
    num_personas: number;
    situacion: string;
    monto_total: number;
    estado: string;
    reserva_detalle: ReservaDetalleDto[];
  
    constructor(
      nombre: string,
      correo: string,
      hora_reserva: string,
      num_personas: number,
      situacion: string,
      monto_total: number,
      estado: string,
      reserva_detalle: ReservaDetalleDto[]
    ) {
      this.nombre = nombre;
      this.correo = correo;
      this.hora_reserva = hora_reserva;
      this.num_personas = num_personas;
      this.situacion = situacion;
      this.monto_total = monto_total;
      this.estado = estado;
      this.reserva_detalle = reserva_detalle;
    }
  }
  
  export class ReservaDetalleDto {
    id: number;
    id_reserva: number;
    comidaid: number;
    nombrepedido: string;
    cantidad: number;
    estado: string;
    nombrec?: string; // Add nombrec as an optional property

  
    constructor(
      id: number,
      id_reserva: number,
      comidaid: number,
      nombrepedido: string,
      cantidad: number,
      estado: string
    ) {
      this.id = id;
      this.id_reserva = id_reserva;
      this.comidaid = comidaid;
      this.nombrepedido = nombrepedido;
      this.cantidad = cantidad;
      this.estado = estado;
    }
  }
  