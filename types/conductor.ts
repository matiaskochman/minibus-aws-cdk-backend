export interface Conductor {
  id: string;
  Usuario_ID: string;
  Foto_DNI?: string | null;
  Foto_VTV?: string | null;
  Estado: "Pendiente" | "Aprobado" | "Rechazado";
  Vendedor_ID?: string | null;
}
