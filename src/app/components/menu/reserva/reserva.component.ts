import { Component, OnInit } from '@angular/core';
import { ReservaDetalleService } from '../../../services/menu/reserva-detalle.service';
import { ReservaDetalle } from '../../../models/menu/reserva-detalle';
import { GroupedMenu } from '../../../models/menu/GroupedMenu';
import { VistaMenuService } from '../../../services/menu/vista-menu.service';
@Component({
  selector: 'app-reserva',
  templateUrl: './reserva.component.html',
  styleUrl: './reserva.component.css'
})
export class ReservaComponent implements OnInit{
  reservaDetalles: ReservaDetalle[] = [];
  nuevaReserva: ReservaDetalle = {
    id_reserva: null!,
    correo: '',
    hora_reserva: '',
    num_personas: 0,
    nombreu: '',
  };
  editandoId: number | null = null;

  constructor(private reservaDetalleService: ReservaDetalleService,
    private vistaMenuService: VistaMenuService  //extracion vista-menu
  ) { }

  ngOnInit(): void {
    this.getReservaDetalleList();
    this.obtenerNombresMenu(); //extracion vista-menu
  }


  getReservaDetalleList(): void {
    this.reservaDetalleService.getReservaDetalleList().subscribe(data => {
      this.reservaDetalles = data;
    });
  }

 //////////////////////////////////////////////////////////////////////////
  // Propiedades para los campos de nombre, email, fecha con hora
nombresMenu: any[] = [];
nombreMenuSeleccionado: string = '';
comidaSelccionadaEdit: { [key: string]: any[] } = {};

comidaEdit: any[] = [];
comidasPorCategoria: { [key: string]: any[] } = {};
comidasSeleccionadas: { [key: string]: any[] } = {
  Entrada: [],
  Fondo: [],
  Bebida: [],
  Postre: [],
};
uniqueMenus: string[] = [];
groupedMenu: GroupedMenu[] = [];

comidasSeleccionasTemp: any[] = [];
pedidos: any[] = [];

isEditing: boolean = false;
addAdditionalFood: boolean = false;
pedidoActual: any = null;



obtenerNombresMenu(): void {
  this.vistaMenuService.getNombresMenu().subscribe((nombres) => {
    this.nombresMenu = nombres;
    this.uniqueMenus = this.getUniqueMenuNames(nombres);
  });
}

getUniqueMenuNames(nombres: any[]): string[] {
  return nombres
    .map((menu) => menu.nombremenu)
    .filter((value, index, self) => self.indexOf(value) === index);
}

obtenerComidasPorMenu(): void {
  if (this.nombreMenuSeleccionado) {
    this.vistaMenuService
      .getComidasPorMenu(this.nombreMenuSeleccionado)
      .subscribe((comidas) => {
        this.comidasPorCategoria = {
          Entrada: comidas.filter((comida) => comida.categoria === 'Entrada'),
          Fondo: comidas.filter((comida) => comida.categoria === 'Fondo'),
          Postre: comidas.filter((comida) => comida.categoria === 'Postre'),
          Bebida: comidas.filter((comida) => comida.categoria === 'Bebida'),
        };
      });
  }
}

obtenerComidasParaEditar(menuSelected: string): void {
  this.vistaMenuService
    .getComidasPorMenu(menuSelected)
    .subscribe((comidas) => {
      this.comidaSelccionadaEdit = {
        Entrada: comidas.filter((comida) => comida.categoria === 'Entrada'),
        Fondo: comidas.filter((comida) => comida.categoria === 'Fondo'),
        Postre: comidas.filter((comida) => comida.categoria === 'Postre'),
        Bebida: comidas.filter((comida) => comida.categoria === 'Bebida'),
      };
    });
}

toggleComida(comida: any, event: any) {
  const check: boolean = event.target.checked;

  if (check) {
    this.comidasSeleccionasTemp.push(comida);
  } else {
    const index = this.comidasSeleccionasTemp.findIndex(
      (item) =>
        item.nombremenu === comida.nombremenu &&
        item.nombrecomida === comida.nombrecomida
    );
    if (index !== -1) {
      this.comidasSeleccionasTemp.splice(index, 1);
    }
  }

  this.groupedMenu = this.groupByCategoryAndMenu(this.comidasSeleccionasTemp);
}

groupByCategoryAndMenu(data: any[]): GroupedMenu[] {
  const grouped: { [key: string]: { [key: string]: any[] } } = {};

  data.forEach((menu) => {
    if (!grouped[menu.categoria]) {
      grouped[menu.categoria] = {};
    }

    if (!grouped[menu.categoria][menu.nombremenu]) {
      grouped[menu.categoria][menu.nombremenu] = [];
    }

    grouped[menu.categoria][menu.nombremenu].push({
      nombrecomida: menu.nombrecomida,
      precio: menu.precio,
    });
  });

  const result: GroupedMenu[] = Object.entries(grouped).map(
    ([categoria, menus]) => {
      return {
        categoria: categoria,
        data: Object.entries(menus).map(([nombremenu, comidas]) => ({
          nombremenu: nombremenu,
          comidas: comidas,
        })),
      };
    }
  );

  return result;
}

guardarSeleccion(): void {
  const categoriasOrdenadas = ['Entrada', 'Fondo', 'Bebida', 'Postre'];
  const menusTransformados: any = {};

  const groupedMenuCopy = JSON.parse(JSON.stringify(this.groupedMenu));

  groupedMenuCopy.forEach((categoria: any) => {
    categoria.data.forEach((menu: any) => {
      if (!menusTransformados[menu.nombremenu]) {
        menusTransformados[menu.nombremenu] = {
          nombremenu: menu.nombremenu,
          data: [],
        };
      }
      menu.comidas.forEach((comida: any) => {
        menusTransformados[menu.nombremenu].data.push({
          categoria: categoria.categoria,
          nombrecomida: comida.nombrecomida,
          precio: comida.precio,
        });
      });
    });
  });

  const menusFinales = Object.values(menusTransformados).map((menu: any) => {
    menu.data.sort(
      (a: any, b: any) =>
        categoriasOrdenadas.indexOf(a.categoria) -
        categoriasOrdenadas.indexOf(b.categoria)
    );
    return menu;
  });

  const pedido = {
    pedidos: 'Pedido ' + (this.pedidos.length + 1),
    menusSeleccionados: menusFinales,
  };

  this.pedidos.push(pedido);

  this.groupedMenu = [];
  this.nombreMenuSeleccionado = '';
  this.comidasPorCategoria = {};
  this.comidasSeleccionasTemp = [];
}

validarSeleccionMenu(): boolean {
  return this.comidasSeleccionasTemp.length === 0;
}

habilitarEdicion(pedidoIndex: number, menuIndex: number, comidaIndex: number) {
  this.pedidos[pedidoIndex].menusSeleccionados[menuIndex].data[comidaIndex].isEditing = true;
}

guardarComida(pedidoIndex: number, menuIndex: number, comidaIndex: number) {
  const pedido = this.pedidos[pedidoIndex];
  const menuSeleccionado = pedido.menusSeleccionados[menuIndex];
  const comida = menuSeleccionado.data[comidaIndex];

  if (comida.isEditing) {
    comida.categoria = comida.selectedCategoria;
    comida.nombrecomida = comida.selectedComida;
    comida.isEditing = false;
  }
}

actualizarPrecio(data: any) {
  if (this.comidaSelccionadaEdit[data.selectedCategoria]) {
    const comidaSeleccionada = this.comidaSelccionadaEdit[data.selectedCategoria].find(comida => comida.nombrecomida === data.selectedComida);
    if (comidaSeleccionada) {
      data.precio = comidaSeleccionada.precio;
      this.calcularTotalPrecios();
    }
  }
}

cancelarEdicion(pedidoIndex: number, menuIndex: number, comidaIndex: number) {
  const pedido = this.pedidos[pedidoIndex];
  const menuSeleccionado = pedido.menusSeleccionados[menuIndex];
  const comida = menuSeleccionado.data[comidaIndex];

  const precioOriginal = this.getOriginalPrice(pedidoIndex, menuIndex, comidaIndex);
  comida.precio = precioOriginal;

  comida.isEditing = false;
}

getOriginalPrice(pedidoIndex: number, menuIndex: number, comidaIndex: number): number {
  const pedido = this.pedidos[pedidoIndex];
  const menuSeleccionado = pedido.menusSeleccionados[menuIndex];
  const comida = menuSeleccionado.data[comidaIndex];
  const categoria = comida.categoria;
  const nombrecomida = comida.nombrecomida;

  const originalComida = this.comidaSelccionadaEdit[categoria].find(c => c.nombrecomida === nombrecomida);
  return originalComida ? originalComida.precio : 0;
}

obtenerPedido(pedido: any) {
  this.addAdditionalFood = true;
  this.pedidoActual = pedido;
  this.isEditing = true;
  this.obtenerComidasPorMenu();
}

agregarComidas(): void {
  if (this.comidasSeleccionasTemp.length > 0) {
    this.comidasSeleccionasTemp.forEach((comida: any) => {
      let menuActual = this.pedidoActual.menusSeleccionados.find((menu: any) => menu.nombremenu === comida.nombremenu);
      if (!menuActual) {
        menuActual = {
          nombremenu: comida.nombremenu,
          data: []
        };
        this.pedidoActual.menusSeleccionados.push(menuActual);
      }
        menuActual.data.push({
          categoria: comida.categoria,
          nombrecomida: comida.nombrecomida,
          precio: comida.precio
        });
    });
  }

  this.comidasSeleccionasTemp = [];
  this.nombreMenuSeleccionado = '';
  this.addAdditionalFood = false;
}

confirmarPedido() {
  const pedidosLimpios = this.pedidos.map((pedido) => {
    const menusSeleccionadosLimpios = pedido.menusSeleccionados.map((menuSeleccionado: any) => {
      const dataLimpios = menuSeleccionado.data.map((data: any) => {
        delete data.isEditing;
        delete data.selectedCategoria;
        delete data.selectedComida;
        return data;
      });
      return { ...menuSeleccionado, data: dataLimpios };
    });
    return { ...pedido, menusSeleccionados: menusSeleccionadosLimpios };
  });

  console.log(JSON.stringify(pedidosLimpios, null, 2));

  this.pedidos = [];
}

reorganizarNombresPedidos(inicio: number): void {
  for (let i = inicio; i < this.pedidos.length; i++) {
    this.pedidos[i].pedidos = `Pedido ${i + 1}`;
  }
}

calcularTotalPrecios(): number {
  let total = 0;
  this.pedidos.map((menusSeleccionados) => {
    menusSeleccionados.menusSeleccionados.map((data: any) => {
      data.data.map((v: any) => {
        total += v.precio;
      });
    });
  });
  return total;
}

eliminarComida(pedido: any, nombremenu: string, nombrecomida: string): void {
  pedido.menusSeleccionados.forEach((menuSeleccionado: any) => {
    if (menuSeleccionado.nombremenu === nombremenu) {
      menuSeleccionado.data = menuSeleccionado.data.filter(
        (comida: any) => comida.nombrecomida !== nombrecomida
      );
    }
  });

  pedido.menusSeleccionados = pedido.menusSeleccionados.filter(
    (menuSeleccionado: any) => menuSeleccionado.data.length > 0
  );

  if (pedido.menusSeleccionados.length === 0) {
    const indicePedido = this.pedidos.indexOf(pedido);
    this.pedidos.splice(indicePedido, 1);

    this.reorganizarNombresPedidos(indicePedido);
  }
}


  //2024
  guardarEdicion(): void {
    if (!this.nuevaReserva.correo || !this.nuevaReserva.hora_reserva) {
      console.log('Por favor, completa todos los campos.');
      return;
    }
  
    // Mostrar modal de confirmación 
    if (this.editandoId !== null) {
      this.reservaDetalleService.updateReservaDetalle(this.editandoId, this.nuevaReserva)
        .subscribe(
          (data) => {
            console.log('Reserva actualizada correctamente.');
            this.editandoId = null;
            this.nuevaReserva = {
              id_reserva: null!,
              correo: '',
              hora_reserva: '',
              num_personas: 0,
              nombreu: '',
            };
            this.getReservaDetalleList();
          },
          error => console.error('Error al actualizar reserva:', error)
        );
    } else {
      this.reservaDetalleService.createReservaDetalle(this.nuevaReserva)
        .subscribe(
          (data) => {
            console.log('Reserva creada correctamente.');
            this.nuevaReserva = {
              id_reserva: null!,
              correo: '',
              hora_reserva: '',
              num_personas: 0,
              nombreu: '',
            };
            this.getReservaDetalleList();
          },
          error => console.error('Error al crear nueva reserva:', error)
        );
    }
} 

}
