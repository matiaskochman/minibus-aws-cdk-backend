import { UserCredentials } from "./userCredentials";
import { Viaje } from "./viaje";

export interface User {
  id: string;
  credentials: UserCredentials;
  username: string;
  email: string;
  telegram?: string;
  telefono?: string;
  estado: "Activo" | "Inactivo" | "Pendiente";
  fechaCreacion: string;
  ultimaActualizacion: string;
  viajesList: Viaje[];
}
