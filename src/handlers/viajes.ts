import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  createViaje,
  getViaje,
  updateViaje,
  deleteViaje,
  listViajes,
} from "../models/viajeModel";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, pathParameters, body } = event;

  try {
    switch (httpMethod) {
      case "GET":
        if (pathParameters?.id) {
          const viaje = await getViaje(pathParameters.id);
          return viaje
            ? { statusCode: 200, body: JSON.stringify(viaje) }
            : {
                statusCode: 404,
                body: JSON.stringify({ message: "Viaje no encontrado" }),
              };
        } else {
          const viajes = await listViajes();
          return { statusCode: 200, body: JSON.stringify(viajes) };
        }

      case "POST":
        if (!body)
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "Cuerpo de solicitud faltante" }),
          };

        const data = JSON.parse(body);
        if (!data.rutaId || !data.conductorId) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "rutaId y conductorId son requeridos",
            }),
          };
        }

        const newViaje = await createViaje({
          ...data,
          estado: data.estado || "Pendiente",
          createdAt: new Date().toISOString(),
        });
        return { statusCode: 201, body: JSON.stringify(newViaje) };

      case "PUT":
        if (!pathParameters?.id || !body) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "ID o cuerpo faltante" }),
          };
        }

        const updateData = JSON.parse(body);
        const updatedViaje = await updateViaje(pathParameters.id, updateData);
        return { statusCode: 200, body: JSON.stringify(updatedViaje) };

      case "DELETE":
        if (!pathParameters?.id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "ID faltante" }),
          };
        }

        await deleteViaje(pathParameters.id);
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
