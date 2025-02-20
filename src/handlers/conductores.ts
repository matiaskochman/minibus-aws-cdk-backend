// File: /Users/matiaskochman/dev/personal/vercel_ex/minibus-backend-aws-cdk/handlers/conductores.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import {
  createConductor,
  getConductor,
  updateConductor,
  deleteConductor,
  listConductores,
} from "../models/conductorModel";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, pathParameters, body } = event;
  try {
    switch (httpMethod) {
      case "GET":
        if (pathParameters?.id) {
          const conductor = await getConductor(pathParameters.id);
          if (!conductor) {
            return {
              statusCode: 404,
              body: JSON.stringify({ message: "Conductor no encontrado" }),
            };
          }
          return { statusCode: 200, body: JSON.stringify(conductor) };
        } else {
          const conductores = await listConductores();
          return { statusCode: 200, body: JSON.stringify(conductores) };
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
        if (!data.Usuario_ID) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "Usuario_ID es obligatorio" }),
          };
        }
        const newConductor = await createConductor(data);
        return { statusCode: 201, body: JSON.stringify(newConductor) };

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
        const updatedConductor = await updateConductor(
          pathParameters.id,
          updateData
        );
        return { statusCode: 200, body: JSON.stringify(updatedConductor) };

      case "DELETE":
        if (!pathParameters?.id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "Falta el ID en la ruta" }),
          };
        }
        await deleteConductor(pathParameters.id);
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
