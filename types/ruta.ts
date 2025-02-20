import { ParadaDeRuta } from "./paradaDeRuta";
export interface Ruta {
  id: string;
  conductorId: string;
  estado: "activa" | "inactiva";
  paradasDeRuta: ParadaDeRuta[];
  createdAt: string;
}
