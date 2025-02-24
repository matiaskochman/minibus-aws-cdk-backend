import { UserCredentials } from "./userCredentials";

export interface User {
  id: string;
  credentials: UserCredentials;
  rol: "Minibus" | "Vendedor" | "Administrador";
  estado: "Activo" | "Inactivo" | "Pendiente";
  fechaCreacion: string;
  ultimaActualizacion?: string;
}
