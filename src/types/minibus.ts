export interface Minibus {
  id: string;
  usuario_ID: string;
  marca: string;
  modelo: string;
  año: number;
  patente: string;
  foto_DNI?: string | null;
  foto_VTV?: string | null;
  estado: "Pendiente" | "Aprobado" | "Rechazado";
  vendedor_ID?: string | null;
}
