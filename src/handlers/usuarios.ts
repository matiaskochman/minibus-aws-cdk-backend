// File: /Users/matiaskochman/dev/personal/vercel_ex/minibus-backend-aws-cdk/src/handlers/usuarios.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as jwt from "jsonwebtoken";
import UserModel from "../models/userModel";
import ViajeModel from "../models/viajeModel";
import {
  getTokenFromHeaders,
  verifyToken,
  unauthorizedResponse,
  handleJWTError,
} from "../utils/auth-utils";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, pathParameters, body } = event;
  const token = getTokenFromHeaders(event.headers);
  if (!token) return unauthorizedResponse("Falta el token");
  try {
    verifyToken(token);
  } catch (err) {
    return handleJWTError(err);
  }
  try {
    switch (httpMethod) {
      case "GET":
        return handleGetRequest(pathParameters?.id);
      case "POST":
        return handlePostRequest(body);
      case "PUT":
        return handlePutRequest(pathParameters?.id, body);
      case "DELETE":
        return handleDeleteRequest(pathParameters?.id);
      default:
        return methodNotAllowedResponse();
    }
  } catch (error: any) {
    return internalErrorResponse(error);
  }
};

const handleGetRequest = async (id?: string) => {
  if (id) {
    const user = await UserModel.get(id);
    return user
      ? successResponse(user)
      : notFoundResponse("Usuario no encontrado");
  }
  const users = await UserModel.list();
  return successResponse(users);
};

const handlePostRequest = async (body: string | null) => {
  if (!body) return badRequestResponse("Cuerpo de solicitud faltante");
  const newUser = await UserModel.create(JSON.parse(body));
  return createdResponse(newUser);
};

const handlePutRequest = async (
  id: string | undefined,
  body: string | null
) => {
  if (!id || !body) return badRequestResponse("Falta ID o cuerpo");
  const data = JSON.parse(body);

  // Si se indica la acción para modificar la lista de viajes
  if (data.action === "add" && data.viaje) {
    const updatedUser = await UserModel.addViaje(id, data.viaje);
    delete (updatedUser as any).viajesList;
    const updatedViaje = await ViajeModel.addUserToViaje(
      data.viaje.id,
      updatedUser
    );
    return successResponse(updatedUser);
  } else if (data.action === "remove" && data.viajeId) {
    const updatedUser = await UserModel.removeViaje(id, data.viajeId);
    return successResponse(updatedUser);
  }

  // Si no se especifica acción, se realiza una actualización normal
  const updatedUser = await UserModel.update(id, data);
  return successResponse(updatedUser);
};

const handleDeleteRequest = async (id: string | undefined) => {
  if (!id) return badRequestResponse("Falta ID");
  await UserModel.delete(id);
  return noContentResponse();
};

const successResponse = (data: any) => ({
  statusCode: 200,
  body: JSON.stringify(data),
});

const createdResponse = (data: any) => ({
  statusCode: 201,
  body: JSON.stringify(data),
});

const noContentResponse = () => ({
  statusCode: 204,
  body: "",
});

const badRequestResponse = (message: string) => ({
  statusCode: 400,
  body: JSON.stringify({ message }),
});

const notFoundResponse = (message: string) => ({
  statusCode: 404,
  body: JSON.stringify({ message }),
});

const methodNotAllowedResponse = () => ({
  statusCode: 405,
  body: JSON.stringify({ message: "Método no permitido" }),
});

const internalErrorResponse = (error: any) => ({
  statusCode: 500,
  body: JSON.stringify({ message: "Error interno", error: error.message }),
});
