import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as jwt from "jsonwebtoken";
import ViajeModel from "../../models/viajeModel";
import {
  getTokenFromHeaders,
  verifyToken,
  unauthorizedResponse,
  handleJWTError,
} from "../../utils/auth-utils";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, pathParameters, body, queryStringParameters } = event;
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
        return handleGetRequest(pathParameters?.id, queryStringParameters);
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

const handleGetRequest = async (id?: string, query?: any) => {
  if (id) {
    const viaje = await ViajeModel.get(id);
    return viaje
      ? successResponse(viaje)
      : notFoundResponse("Viaje no encontrado");
  }

  if (query?.minibusId) {
    const viajes = await ViajeModel.getByMinibus(query.minibusId);
    return successResponse(viajes);
  }

  if (query?.rutaId) {
    const viajes = await ViajeModel.getByRuta(query.rutaId);
    return successResponse(viajes);
  }

  const viajes = await ViajeModel.list();
  return successResponse(viajes);
};

const handlePostRequest = async (body: string | null) => {
  if (!body) return badRequestResponse("Cuerpo faltante");

  const data = JSON.parse(body);
  if (!data.rutaId || !data.minibusId || !data.paradasDeRuta) {
    return badRequestResponse("Faltan campos requeridos");
  }

  const newViaje = await ViajeModel.create({
    ...data,
    estado: data.estado || "programado",
    fechaInicio: new Date().toISOString(),
  });

  return createdResponse(newViaje);
};

const handlePutRequest = async (
  id: string | undefined,
  body: string | null
) => {
  if (!id || !body) return badRequestResponse("ID o cuerpo faltante");

  const updateData = JSON.parse(body);
  if (updateData.paradasDeRuta && !Array.isArray(updateData.paradasDeRuta)) {
    return badRequestResponse("paradasDeRuta debe ser array");
  }

  const updatedViaje = await ViajeModel.update(id, updateData);
  return successResponse(updatedViaje);
};

const handleDeleteRequest = async (id: string | undefined) => {
  if (!id) return badRequestResponse("ID faltante");

  await ViajeModel.delete(id);
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
