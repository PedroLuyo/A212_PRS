import { Component, OnInit } from '@angular/core';
import { GroupedMenu } from '../../../models/menu/menu/GroupedMenu';
import { ReservaDetalleService } from '../../../services/menu/reserva/reserva-detalle.service';
import { VistaMenuService } from '../../../services/menu/comida/vista-menu.service';
import Swal from 'sweetalert2';
import { ComidaService } from '../../../services/menu/comida/comida.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-reserva',
  templateUrl: './reserva.component.html',
  styleUrls: ['./reserva.component.css']
})
export class ReservaComponent implements OnInit {
  reservaDetalles: any[] = [];
  nuevaReserva: any = {
    nombre: '',
    correo: '',
    hora_reserva: '',
    num_personas: 0,
    situacion: 'P',
    estado: 'A',
    monto_total: 0,
    reserva_detalle: []
  };
  nombresMenu: any[] = [];
  nombreMenuSeleccionado: string = '';
  comidasPorCategoria: { [key: string]: any[] } = {
    Entrada: [],
    Fondo: [],
    Bebida: [],
    Postre: []
  };  comidasSeleccionasTemp: any[] = [];
  pedidos: any[] = [];
  uniqueMenus: string[] = [];
  groupedMenu: GroupedMenu[] = [];
  formularioCompleto: boolean = false;
  menusDisponibles: string[] = [];
  pedidoCounter: number = 1; // Contador para los pedidos

  

  constructor(
    private reservaDetalleService: ReservaDetalleService,
    private vistaMenuService: VistaMenuService,
    private comidaService: ComidaService // Inyecta el servicio de comida

  ) { }

  ngOnInit(): void {
    this.getReservaDetalleList();
    this.obtenerNombresMenu();
  }

  getReservaDetalleList(): void {
    this.reservaDetalleService.getAllReservas().subscribe((data: any[]) => {
      this.reservaDetalles = data;
    });
  }

  obtenerNombresMenu(): void {
    this.vistaMenuService.getNombresMenu().subscribe((nombres: any[]) => {
      this.nombresMenu = nombres;
      this.uniqueMenus = this.getUniqueMenuNames(nombres);
      this.menusDisponibles = this.uniqueMenus.slice(); // Clona el array de nombres de menú
    });
  }
  

  getUniqueMenuNames(nombres: any[]): string[] {
    return nombres
      .map(menu => menu.nombremenu)
      .filter((value, index, self) => self.indexOf(value) === index);
  }

  obtenerComidasPorMenu(): void {
    if (this.nombreMenuSeleccionado) {
      this.vistaMenuService.getComidasPorMenu(this.nombreMenuSeleccionado).subscribe(
        (        comidas: any[]) => {
          this.comidasPorCategoria = {
            Entrada: comidas.filter((comida: { categoria: string; }) => comida.categoria === 'Entrada'),
            Fondo: comidas.filter((comida: { categoria: string; }) => comida.categoria === 'Fondo'),
            Postre: comidas.filter((comida: { categoria: string; }) => comida.categoria === 'Postre'),
            Bebida: comidas.filter((comida: { categoria: string; }) => comida.categoria === 'Bebida')
          };
        },
        (        error: any) => console.error('Error al obtener productos:', error)
      );
    }
  }

  toggleComida(comida: any, event: any) {
    const checked = event.target.checked;
    if (checked) {
      this.comidaService.getComidaIdByNombre(comida.nombrecomida).subscribe((comidaId: any) => {
        // Añade comidaid obtenido y cantidad inicial (inicia en 1)
        this.comidasSeleccionasTemp.push({ ...comida, comidaid: comidaId, cantidad: 1 }); 
        this.groupedMenu = this.groupByCategoryAndMenu(this.comidasSeleccionasTemp);
        // Recalcula el monto total al añadir un plato
        this.actualizarTotal();
      });
    } else {
      const index = this.comidasSeleccionasTemp.findIndex(
        item => item.nombremenu === comida.nombremenu && item.nombrecomida === comida.nombrecomida
      );
      if (index !== -1) {
        this.comidasSeleccionasTemp.splice(index, 1);
        // Recalcula el monto total al quitar un plato
        this.actualizarTotal();
      }
      this.groupedMenu = this.groupByCategoryAndMenu(this.comidasSeleccionasTemp);
    }
  }
  
  
  
  
  


  groupByCategoryAndMenu(data: any[]): GroupedMenu[] {
    const grouped: { [key: string]: { [key: string]: any[] } } = {};
    data.forEach(menu => {
      if (!grouped[menu.categoria]) {
        grouped[menu.categoria] = {};
      }
      if (!grouped[menu.categoria][menu.nombremenu]) {
        grouped[menu.categoria][menu.nombremenu] = [];
      }
      grouped[menu.categoria][menu.nombremenu].push({
        nombrecomida: menu.nombrecomida,
        precio: menu.precio
      });
    });
    return Object.entries(grouped).map(([categoria, menus]) => ({
      categoria: categoria,
      data: Object.entries(menus).map(([nombremenu, comidas]) => ({
        nombremenu: nombremenu,
        comidas: comidas
      }))
    }));
  }

  guardarSeleccion(): void {
    if (this.nombreMenuSeleccionado === '' || this.comidasSeleccionasTemp.length === 0) {
      Swal.fire('Selecciona un menú y al menos un plato', '', 'error');
      return;
    }
  
    const menusTransformados = this.groupedMenu.map(categoria => ({
      categoria: categoria.categoria,
      data: categoria.data.flatMap((menu: { comidas: any[]; nombremenu: any; }) => menu.comidas.map((comida: { nombrecomida: any; precio: any; }) => ({
        categoria: categoria.categoria,
        nombremenu: menu.nombremenu,
        nombrecomida: comida.nombrecomida,
        precio: comida.precio
      })))
    }));
    const pedido = {
      pedidos: 'Pedido ' + this.pedidoCounter, // Utiliza el contador para el nombre del pedido
      menusSeleccionados: menusTransformados
    };
    this.pedidos.push(pedido);
    this.pedidoCounter++; // Incrementa el contador para el siguiente pedido
    this.groupedMenu = [];
    this.nombreMenuSeleccionado = '';
    this.comidasPorCategoria = {};
    this.comidasSeleccionasTemp = [];
  
    this.menusDisponibles = this.menusDisponibles.filter(menu => menu !== pedido.menusSeleccionados[0].data[0].nombremenu); // Filtra el menú seleccionado de los disponibles
  }
  

 

  guardarEdicion(): void {
    if (!this.nuevaReserva.correo || !this.nuevaReserva.hora_reserva || this.pedidos.length === 0) {
      Swal.fire('Completa todos los campos y selección de menú', '', 'error');
      return;
    }
  
    // Recalcula el monto total basado en las cantidades actualizadas
    this.nuevaReserva.monto_total = this.calcularTotalPrecios();
  
    const detallesReserva = this.pedidos.flatMap(pedido =>
      pedido.menusSeleccionados.flatMap((menu: any) =>
        menu.data.map(async (comida: any) => {
          const comidaid = await this.comidaService.getComidaIdByNombre(comida.nombrecomida).toPromise();
          return {
            comidaid: comidaid,
            nombrepedido: pedido.pedidos,
            cantidad: comida.cantidad, // Utiliza la cantidad ingresada por el usuario
            estado: 'A'
          };
        })
      )
    );
  
    Promise.all(detallesReserva).then(reservaDetalle => {
      this.nuevaReserva.reserva_detalle = reservaDetalle;
      Swal.fire('Reserva creada correctamente', '', 'success');

      this.reservaDetalleService.crearReserva(this.nuevaReserva).subscribe(() => {
        console.log('Reserva creada correctamente.');
        this.nuevaReserva = {
          nombre: '',
          correo: '',
          hora_reserva: '',
          num_personas: 0,
          situacion: 'P',
          estado: 'A',
          monto_total: 0,
          reserva_detalle: []
        };
        this.getReservaDetalleList();
        this.pedidos = [];
        this.pedidoCounter = 1; // Reinicia el contador después de guardar la reserva

      },
        (      error: any) => {
        console.error('Error al crear nueva reserva:', error);
        Swal.fire('Error', 'Ocurrió un error al crear la reserva', 'error');
      });
    });
  }
  

  calcularTotalPrecios(): number {
    if (this.pedidos.length === 0) {
      return 0;
    }
    const total = this.pedidos.reduce((total, pedido) =>
      total + pedido.menusSeleccionados.reduce((menuTotal: any, menu: { data: any[] }) =>
        menuTotal + menu.data.reduce((comidaTotal: any, comida: { precio: any; cantidad: any }) =>
          comidaTotal + (comida.precio * (comida.cantidad || 0)), 0), 0), 0);
    
    return parseFloat(total.toFixed(2));
  }
  

  
  actualizarTotal(): void {
    // Recalcula el monto total basado en las cantidades actualizadas
    this.nuevaReserva.monto_total = this.calcularTotalPrecios();
  }
  

  todosCamposCantidadLlenos(): boolean {
    for (const pedido of this.pedidos) {
      for (const categoria of pedido.menusSeleccionados) {
        for (const comida of categoria.data) {
          if (!comida.cantidad || comida.cantidad <= 0) {
            return false;
          }
        }
      }
    }
    return true;
  }
  
  eliminarPedido(index: number): void {
    // Agrega de nuevo el menú al array de disponibles antes de eliminar el pedido
    const menuAAgregar = this.pedidos[index].menusSeleccionados[0].data[0].nombremenu;
    this.menusDisponibles.push(menuAAgregar);
  
    // Luego, elimina el pedido
    this.pedidos.splice(index, 1);
    this.pedidoCounter = 1; // Reinicia el contador si no hay pedidos

  }
  
  
  
}
