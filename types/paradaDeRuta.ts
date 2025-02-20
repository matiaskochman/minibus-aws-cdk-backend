// File: /Users/matiaskochman/dev/personal/vercel_ex/minibus-backend-aws-cdk/types/parada.ts
import { Parada } from "./parada";

export interface ParadaDeRuta {
  id: string;
  parada: Parada;
  posicion: number;
  horario: string;
}
