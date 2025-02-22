import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as jwt from "jsonwebtoken";
import {
  createParada,
  getParada,
  updateParada,
  deleteParada,
  listParadas,
} from "../models/paradaModel";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, pathParameters, body } = event;
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
    // Se verifica el token con el mismo secreto utilizado en auth
    jwt.verify(token, secret);
  } catch (err) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "No autorizado: token inválido" }),
    };
  }
  try {
    switch (httpMethod) {
      case "GET":
        if (pathParameters?.id) {
          const parada = await getParada(pathParameters.id);
          if (!parada) {
            return {
              statusCode: 404,
              body: JSON.stringify({ message: "Parada no encontrada" }),
            };
          }
          return { statusCode: 200, body: JSON.stringify(parada) };
        } else {
          const paradas = await listParadas();
          return { statusCode: 200, body: JSON.stringify(paradas) };
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
        if (
          !data.nombre ||
          !data.descripcion ||
          !data.calle ||
          !data.numero ||
          !data.localidad ||
          !data.codigoPostal ||
          !data.partido ||
          !data.provincia
        ) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message:
                "Faltan campos requeridos: nombre, descripcion, calle, numero, localidad, codigoPostal, partido, provincia",
            }),
          };
        }
        const newParada = await createParada(data);
        return { statusCode: 201, body: JSON.stringify(newParada) };

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
        const updatedParada = await updateParada(pathParameters.id, updateData);
        return { statusCode: 200, body: JSON.stringify(updatedParada) };

      case "DELETE":
        if (!pathParameters?.id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "Falta el ID en la ruta" }),
          };
        }
        await deleteParada(pathParameters.id);
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
