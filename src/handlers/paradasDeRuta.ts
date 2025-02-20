// File: /Users/matiaskochman/dev/personal/vercel_ex/minibus-backend-aws-cdk/handlers/paradasDeRuta.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  createParadaDeRuta,
  getParadaDeRuta,
  updateParadaDeRuta,
  deleteParadaDeRuta,
  listParadasDeRuta,
} from "../models/paradaDeRuta";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, pathParameters, body } = event;
  try {
    switch (httpMethod) {
      case "GET":
        if (pathParameters?.id) {
          const paradaDeRuta = await getParadaDeRuta(pathParameters.id);
          if (!paradaDeRuta) {
            return {
              statusCode: 404,
              body: JSON.stringify({ message: "Parada de ruta no encontrada" }),
            };
          }
          return { statusCode: 200, body: JSON.stringify(paradaDeRuta) };
        } else {
          const paradasDeRuta = await listParadasDeRuta();
          return { statusCode: 200, body: JSON.stringify(paradasDeRuta) };
        }

      case "POST":
        if (!body) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "Falta el cuerpo de la solicitud",
            }),
          };
        }
        const data = JSON.parse(body);
        if (!data.parada || data.posicion === undefined || !data.horario) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "Faltan campos requeridos: parada, posicion y horario",
            }),
          };
        }
        const newParadaDeRuta = await createParadaDeRuta(data);
        return { statusCode: 201, body: JSON.stringify(newParadaDeRuta) };

      case "PUT":
        if (!pathParameters?.id || !body) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "Falta el ID o el cuerpo de la solicitud",
            }),
          };
        }
        const updateData = JSON.parse(body);
        const updatedParadaDeRuta = await updateParadaDeRuta(
          pathParameters.id,
          updateData
        );
        return { statusCode: 200, body: JSON.stringify(updatedParadaDeRuta) };

      case "DELETE":
        if (!pathParameters?.id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "Falta el ID en la ruta" }),
          };
        }
        await deleteParadaDeRuta(pathParameters.id);
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
