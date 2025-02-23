import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

import * as jwt from "jsonwebtoken";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import ViajeModel from "../../models/viajeModel";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, pathParameters, body, queryStringParameters } = event;

  // Verificar que se incluya un header Authorization con formato "Bearer <token>"
  const authHeader = event.headers.Authorization || event.headers.authorization;
  if (!authHeader) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "No autorizado: falta el token" }),
    };
  }
  const token = authHeader.split(" ")[1]; // Se espera formato "Bearer <token>"
  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "No autorizado: token mal formado" }),
    };
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined");
    }
    jwt.verify(token, secret);
  } catch (err) {
    if (err instanceof JsonWebTokenError || err instanceof TokenExpiredError) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "No autorizado: token inválido" }),
      };
    } else {
      throw err; // O manejar como error 500
    }
  }
  try {
    switch (httpMethod) {
      case "GET":
        if (event.queryStringParameters?.conductorId) {
          const viajes = await ViajeModel.getByConductor(
            event.queryStringParameters.conductorId
          );
          return { statusCode: 200, body: JSON.stringify(viajes) };
        }
        if (queryStringParameters?.rutaId) {
          const viajes = await ViajeModel.getByRuta(
            queryStringParameters.rutaId
          );
          return { statusCode: 200, body: JSON.stringify(viajes) };
        }
        if (pathParameters?.id) {
          const viaje = await ViajeModel.get(pathParameters.id);
          if (!viaje) {
            return {
              statusCode: 404,
              body: JSON.stringify({ message: "Viaje no encontrado" }),
            };
          }
          return { statusCode: 200, body: JSON.stringify(viaje) };
        } else {
          const viajes = await ViajeModel.list();
          return { statusCode: 200, body: JSON.stringify(viajes) };
        }
      case "POST":
        if (!body) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "Cuerpo de solicitud faltante" }),
          };
        }
        const data = JSON.parse(body);
        if (!data.rutaId || !data.conductorId || !data.paradasDeRuta) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message:
                "Faltan campos requeridos: rutaId, conductorId, paradasDeRuta",
            }),
          };
        }
        const newViaje = await ViajeModel.create({
          ...data,
          estado: data.estado || "programado",
          fechaInicio: new Date().toISOString(),
        });
        return { statusCode: 201, body: JSON.stringify(newViaje) };
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
        if (
          updateData.paradasDeRuta &&
          !Array.isArray(updateData.paradasDeRuta)
        ) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "paradasDeRuta debe ser un array",
            }),
          };
        }
        const updatedViaje = await ViajeModel.update(
          pathParameters.id,
          updateData
        );
        return { statusCode: 200, body: JSON.stringify(updatedViaje) };
      case "DELETE":
        if (!pathParameters?.id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "ID faltante" }),
          };
        }
        await ViajeModel.delete(pathParameters.id);
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
