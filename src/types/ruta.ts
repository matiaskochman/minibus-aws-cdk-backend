import { ParadaDeRuta } from "./paradaDeRuta";
export interface Ruta {
  id: string;
  minibusId: string;
  estado: "activa" | "inactiva";
  paradasDeRuta: ParadaDeRuta[];
  createdAt: string;
}
