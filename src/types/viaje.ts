import { Ruta } from "./ruta";

export interface Viaje {
  id: string;
  rutaId: string;
  fecha: string;
  conductorId: string;
  estado: "Pendiente" | "Cancelado" | "Realizado" | "En curso" | "Pausado";
  descripcion: string;
  reventaActivada: boolean;
  descuento: number;
  ruta: Ruta;
  createdAt: string;
}
