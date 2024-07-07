export class Comida {
  comidaid: number;
  nombrec: string;
  categoria: string;
  precio: number;
  stock: number;
  image: String
  menuid: number; 
  estado: string;

  constructor() {
    this.comidaid = 0;
    this.nombrec = '';
    this.categoria = '';
    this.precio = 0;
    this.stock = 0;
    this.image = '';
    this.menuid = 0;
    this.estado = '';
  }
}
