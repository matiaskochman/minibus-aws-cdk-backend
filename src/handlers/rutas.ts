// File: /Users/matiaskochman/dev/personal/vercel_ex/minibus-backend-aws-cdk/handlers/rutas.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as jwt from "jsonwebtoken";
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
    if (
      err instanceof jwt.JsonWebTokenError ||
      err instanceof jwt.TokenExpiredError
    ) {
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
