// File: /Users/matiaskochman/dev/personal/vercel_ex/minibus-backend-aws-cdk/handlers/rutas.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  createRuta,
  getRuta,
  updateRuta,
  deleteRuta,
  listRutas,
} from "../models/rutaModel";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, pathParameters, body } = event;
  try {
    switch (httpMethod) {
      case "GET":
        if (pathParameters?.id) {
          const ruta = await getRuta(pathParameters.id);
          if (!ruta) {
            return {
              statusCode: 404,
              body: JSON.stringify({ message: "Ruta no encontrada" }),
            };
          }
          return { statusCode: 200, body: JSON.stringify(ruta) };
        } else {
          const rutas = await listRutas();
          return { statusCode: 200, body: JSON.stringify(rutas) };
        }

      case "POST":
        if (!body) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "Cuerpo de solicitud faltante" }),
          };
        }
        const data = JSON.parse(body);
        if (!data.conductorId || !data.paradasDeRuta) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "Faltan campos requeridos: conductorId y paradasDeRuta",
            }),
          };
        }
        // Se puede incluir validación adicional para la estructura de paradasDeRuta si es necesario.
        const newRuta = await createRuta({
          conductorId: data.conductorId,
          estado: data.estado || "activa",
          paradasDeRuta: data.paradasDeRuta,
          createdAt: new Date().toISOString(),
        });
        return { statusCode: 201, body: JSON.stringify(newRuta) };

      case "PUT":
        if (!pathParameters?.id || !body) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "ID o cuerpo de solicitud faltante",
            }),
          };
        }
        const updateData = JSON.parse(body);
        const updatedRuta = await updateRuta(pathParameters.id, updateData);
        return { statusCode: 200, body: JSON.stringify(updatedRuta) };

      case "DELETE":
        if (!pathParameters?.id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "ID faltante" }),
          };
        }
        await deleteRuta(pathParameters.id);
        return { statusCode: 204, body: "" };

      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ message: "Método no permitido" }),
        };
    }
  } catch (error: any) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error interno", error: error.message }),
    };
  }
};
