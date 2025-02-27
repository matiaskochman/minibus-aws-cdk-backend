import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as jwt from "jsonwebtoken";
import ParadaDeRutaModel from "../models/paradaDeRuta";
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
    const parada = await ParadaDeRutaModel.get(id);
    return parada
      ? successResponse(parada)
      : notFoundResponse("Parada de ruta no encontrada");
  }
  const paradas = await ParadaDeRutaModel.list();
  return successResponse(paradas);
};

const handlePostRequest = async (body: string | null) => {
  if (!body) return badRequestResponse("Falta el cuerpo de la solicitud");

  const data = JSON.parse(body);
  if (!data.parada || data.posicion === undefined || !data.horario) {
    return badRequestResponse("Faltan campos: parada, posicion u horario");
  }

  const newParada = await ParadaDeRutaModel.create(data);
  return createdResponse(newParada);
};

const handlePutRequest = async (
  id: string | undefined,
  body: string | null
) => {
  if (!id || !body) {
    return badRequestResponse("Falta el ID o el cuerpo de la solicitud");
  }

  const updateData = JSON.parse(body);
  const updatedParada = await ParadaDeRutaModel.update(id, updateData);
  return successResponse(updatedParada);
};

const handleDeleteRequest = async (id: string | undefined) => {
  if (!id) return badRequestResponse("Falta el ID en la ruta");

  await ParadaDeRutaModel.delete(id);
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
