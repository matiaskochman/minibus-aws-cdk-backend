import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as jwt from "jsonwebtoken";
import RutaModel from "../models/rutaModel";
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
    const ruta = await RutaModel.get(id);
    return ruta
      ? successResponse(ruta)
      : notFoundResponse("Ruta no encontrada");
  }
  const rutas = await RutaModel.list();
  return successResponse(rutas);
};

const handlePostRequest = async (body: string | null) => {
  if (!body) return badRequestResponse("Cuerpo de solicitud faltante");

  const data = JSON.parse(body);
  if (!data.minibusId || !data.paradasDeRuta) {
    return badRequestResponse("Faltan campos: minibusId y paradasDeRuta");
  }

  const newRuta = await RutaModel.create({
    minibusId: data.minibusId,
    estado: data.estado || "activa",
    paradasDeRuta: data.paradasDeRuta,
    createdAt: new Date().toISOString(),
  });

  return createdResponse(newRuta);
};

const handlePutRequest = async (
  id: string | undefined,
  body: string | null
) => {
  if (!id || !body) return badRequestResponse("ID o cuerpo faltante");

  const updateData = JSON.parse(body);
  const updatedRuta = await RutaModel.update(id, updateData);
  return successResponse(updatedRuta);
};

const handleDeleteRequest = async (id: string | undefined) => {
  if (!id) return badRequestResponse("ID faltante");

  await RutaModel.delete(id);
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
