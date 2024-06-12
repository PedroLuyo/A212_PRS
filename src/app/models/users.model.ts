export interface Users {
  email: string;
  name: string;
  password: string;
  role: string;
  direccion: string;
  dni: string;
  estado: string;
  ruc: string;
  editable?: boolean; // Esta propiedad la estamos usando en la edición
  docId?: string; // Agregamos esta propiedad temporalmente
}
