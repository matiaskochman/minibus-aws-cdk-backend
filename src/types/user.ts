import { UserCredentials } from "./userCredentials";
import { Viaje } from "./viaje";

export interface User {
  id: string;
  credentials: UserCredentials;
  estado: "Activo" | "Inactivo" | "Pendiente";
  fechaCreacion: string;
  ultimaActualizacion: string;
  viajesList: Viaje[];
}
