export interface Users {
  email: string;
  name: string;
  password: string;
  role: string;
  dni: string;
  estado: string;
  editable?: boolean; // Esta propiedad la estamos usando en la edición
  docId?: string; // Agregamos esta propiedad temporalmente
}
