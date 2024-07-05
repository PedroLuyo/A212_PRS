export interface GroupedMenu {
  categoria: string;
  data: {
    nombremenu: string;
    comidas: {
      nombrecomida: string;
      precio: number;
    }[];
  }[];
}
