// File: /Users/matiaskochman/dev/personal/vercel_ex/minibus-backend-aws-cdk/types/parada.ts
export interface Parada {
  id: string;
  nombre: string;
  direccion: string;
  descripcion: string;
  latitud?: number;
  longitud?: number;
  // Puedes agregar más propiedades según lo requieras
}
