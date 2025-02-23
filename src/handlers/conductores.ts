// File: /Users/matiaskochman/dev/personal/vercel_ex/minibus-backend-aws-cdk/handlers/conductores.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as jwt from "jsonwebtoken";
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
