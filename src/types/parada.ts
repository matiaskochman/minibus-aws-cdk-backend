// File: /Users/matiaskochman/dev/personal/vercel_ex/minibus-backend-aws-cdk/types/parada.ts
export interface Parada {
  id: string;
  nombre: string;
  descripcion: string;
  calle: string;
  numero: string;
  localidad: string;
  codigoPostal: string;
  partido: string;
  provincia: string;
  latitud?: number;
  longitud?: number;
}
