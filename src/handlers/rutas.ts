import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as jwt from "jsonwebtoken";
import RutaModel from "../models/rutaModel";

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
  if (!data.conductorId || !data.paradasDeRuta) {
    return badRequestResponse("Faltan campos: conductorId y paradasDeRuta");
  }

  const newRuta = await RutaModel.create({
    conductorId: data.conductorId,
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

// Reutilizar las mismas funciones helper
const getTokenFromHeaders = (headers: any) => {
  const authHeader = headers?.Authorization || headers?.authorization;
  return authHeader?.split(" ")[1];
};

const verifyToken = (token: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET no está definido");
  jwt.verify(token, secret);
};

const unauthorizedResponse = (message: string) => ({
  statusCode: 401,
  body: JSON.stringify({ message: `No autorizado: ${message}` }),
});

const handleJWTError = (err: any) => {
  if (
    err instanceof jwt.JsonWebTokenError ||
    err instanceof jwt.TokenExpiredError
  ) {
    return unauthorizedResponse("token inválido");
  }
  throw err;
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
