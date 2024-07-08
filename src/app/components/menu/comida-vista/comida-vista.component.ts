import { Component, OnInit } from '@angular/core';
import { GroupedMenu } from '../../models/menu/GroupedMenu';
import { VistaMenuService } from '../../services/comida/vista-menu.service';

@Component({
  selector: 'app-comida-vista',
  templateUrl: './comida-vista.component.html',
  styleUrls: ['./comida-vista.component.css'],
})
export class ComidaVistaComponent implements OnInit {
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

  constructor(private vistaMenuService: VistaMenuService) {
    this.pedidos = [];
  }

  ngOnInit(): void {
    this.obtenerNombresMenu();
  }

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
      })
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

  // La función groupByCategoryAndMenu se define dentro del mismo componente
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

    // Crear una copia profunda de groupedMenu para evitar referencias compartidas
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


  habilitarEdicion(
    pedidoIndex: number,
    menuIndex: number,
    comidaIndex: number
  ) {
    this.pedidos[pedidoIndex].menusSeleccionados[menuIndex].data[
      comidaIndex
    ].isEditing = true;
  }


  guardarComida(pedidoIndex: number, menuIndex: number, comidaIndex: number) {
    const pedido = this.pedidos[pedidoIndex];
    const menuSeleccionado = pedido.menusSeleccionados[menuIndex];
    const comida = menuSeleccionado.data[comidaIndex];

    // Solo guarda los cambios de edición, sin incluir los campos no deseados
    if (comida.isEditing) {
      // Actualiza la categoría y el nombre de la comida si se han editado
      comida.categoria = comida.selectedCategoria;
      comida.nombrecomida = comida.selectedComida;
      // Desactiva la edición
      comida.isEditing = false;
    }
  }

  actualizarPrecio(data: any) {
    // Verificar si la lista de comidas correspondiente a la categoría seleccionada está definida
    if (this.comidaSelccionadaEdit[data.selectedCategoria]) {
      // Encuentra la comida seleccionada en la lista de comidas correspondiente a la categoría seleccionada
      const comidaSeleccionada = this.comidaSelccionadaEdit[data.selectedCategoria].find(comida => comida.nombrecomida === data.selectedComida);

      // Si se encuentra la comida seleccionada, actualiza el precio en el objeto de datos
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

    // Restaurar el precio original de la comida
    const precioOriginal = this.getOriginalPrice(pedidoIndex, menuIndex, comidaIndex);
    comida.precio = precioOriginal;

    // Desactivar la edición
    comida.isEditing = false;
  }

  // Método para obtener el precio original de la comida
  getOriginalPrice(pedidoIndex: number, menuIndex: number, comidaIndex: number): number {
    const pedido = this.pedidos[pedidoIndex];
    const menuSeleccionado = pedido.menusSeleccionados[menuIndex];
    const comida = menuSeleccionado.data[comidaIndex];
    const categoria = comida.categoria;
    const nombrecomida = comida.nombrecomida;

    // Buscar el precio original de la comida en la lista de comidas correspondiente a la categoría
    const originalComida = this.comidaSelccionadaEdit[categoria].find(c => c.nombrecomida === nombrecomida);
    return originalComida ? originalComida.precio : 0;
  }



  eliminarComida(pedido: any, nombremenu: string, nombrecomida: string): void {
    pedido.menusSeleccionados.forEach((menuSeleccionado: any) => {
      if (menuSeleccionado.nombremenu === nombremenu) {
        menuSeleccionado.data = menuSeleccionado.data.filter(
          (comida: any) => comida.nombrecomida !== nombrecomida
        );
      }
    });

    // Eliminar menús vacíos del pedido
    pedido.menusSeleccionados = pedido.menusSeleccionados.filter(
      (menuSeleccionado: any) => menuSeleccionado.data.length > 0
    );

    // Eliminar pedido si no hay menús seleccionados
    if (pedido.menusSeleccionados.length === 0) {
      const indicePedido = this.pedidos.indexOf(pedido);
      this.pedidos.splice(indicePedido, 1); // Eliminar pedido del arreglo

      // Reorganizar nombres de pedidos
      this.reorganizarNombresPedidos(indicePedido);
    }
  }

  confirmarPedido() {
    // Limpiar los campos no deseados en todos los pedidos antes de imprimirlos
    const pedidosLimpios = this.pedidos.map(pedido => {
      const menusSeleccionadosLimpios = pedido.menusSeleccionados.map((menuSeleccionado: any) => {
        const dataLimpios = menuSeleccionado.data.map((data: any) => {
          // Eliminar campos no deseados
          delete data.isEditing;
          delete data.selectedCategoria;
          delete data.selectedComida;
          return data;
        });
        return { ...menuSeleccionado, data: dataLimpios };
      });
      return { ...pedido, menusSeleccionados: menusSeleccionadosLimpios };
    });

    // Imprimir los pedidos limpios
    console.log(JSON.stringify(pedidosLimpios, null, 2));

    // Limpiar los pedidos y restablecer el arreglo
    this.pedidos = [];
  }


  reorganizarNombresPedidos(inicio: number): void {
    // Renombrar pedidos después del inicio
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
}
