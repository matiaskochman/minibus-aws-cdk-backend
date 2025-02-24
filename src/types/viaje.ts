import { ParadaDeRuta } from "./paradaDeRuta";
import { Ruta } from "./ruta";
import { User } from "./user";

export interface Viaje {
  id: string;
  rutaId: string;
  fecha: string;
  minibusId: string;
  estado: "Pendiente" | "Cancelado" | "Realizado" | "En curso" | "Pausado";
  descripcion: string;
  reventaActivada: boolean;
  descuento: number;
  ruta: Ruta;
  // usuarioList: User[];
  paradasDeRuta: ParadaDeRuta[];
  createdAt: string;
}
