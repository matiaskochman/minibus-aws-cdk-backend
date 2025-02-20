// File: /Users/matiaskochman/dev/personal/vercel_ex/minibus-backend-aws-cdk/types/ruta.ts
export interface Ruta {
  id: string;
  conductorId: string;
  origen: string;
  destino: string;
  horarios: string[];
  estado: "activa" | "inactiva";
  createdAt: string;
}
