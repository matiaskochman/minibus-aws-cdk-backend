import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as jwt from "jsonwebtoken";
import {
  createUser,
  getUser,
  updateUser,
  deleteUser,
  listUsers,
} from "../models/userModel";

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
          const user = await getUser(pathParameters.id);
          return user
            ? { statusCode: 200, body: JSON.stringify(user) }
            : {
                statusCode: 404,
                body: JSON.stringify({ message: "Usuario no encontrado" }),
              };
        } else {
          const users = await listUsers();
          return { statusCode: 200, body: JSON.stringify(users) };
        }
      case "POST":
        if (!body) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "Cuerpo de solicitud faltante" }),
          };
        }
        const newUser = await createUser(JSON.parse(body));
        return { statusCode: 201, body: JSON.stringify(newUser) };
      case "PUT":
        if (!pathParameters?.id || !body) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "Falta ID o cuerpo de solicitud" }),
          };
        }
        const updatedUser = await updateUser(
          pathParameters.id,
          JSON.parse(body)
        );
        return { statusCode: 200, body: JSON.stringify(updatedUser) };
      case "DELETE":
        if (!pathParameters?.id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "Falta ID en la ruta" }),
          };
        }
        await deleteUser(pathParameters.id);
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
