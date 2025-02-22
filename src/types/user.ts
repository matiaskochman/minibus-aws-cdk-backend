import { UserCredentials } from "./userCredentials";

export interface User {
  id: string;
  credentials: UserCredentials;
  rol: "Conductor" | "Vendedor" | "Administrador";
  estado: "Activo" | "Inactivo" | "Pendiente";
  fechaCreacion: string;
  ultimaActualizacion?: string;
}
