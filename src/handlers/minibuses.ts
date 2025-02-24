import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import * as jwt from "jsonwebtoken";
import MinibusModel from "../models/minibusModel";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, pathParameters, body } = event;
  const token = getTokenFromHeaders(event.headers);

  if (!token) {
    return unauthorizedResponse("Falta el token");
  }

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
    const minibus = await MinibusModel.get(id);
    return minibus
      ? successResponse(minibus)
      : notFoundResponse("Minibus no encontrado");
  }
  const minibuses = await MinibusModel.list();
  return successResponse(minibuses);
};

const handlePostRequest = async (body: string | null) => {
  if (!body) return badRequestResponse("Falta el cuerpo de la solicitud");

  const data = JSON.parse(body);
  if (!data.Usuario_ID) {
    return badRequestResponse("Usuario_ID es obligatorio");
  }

  const newMinibus = await MinibusModel.create(data);
  return createdResponse(newMinibus);
};

const handlePutRequest = async (
  id: string | undefined,
  body: string | null
) => {
  if (!id || !body) {
    return badRequestResponse("Falta el ID o el cuerpo de la solicitud");
  }

  const updateData = JSON.parse(body);
  const updatedMinibus = await MinibusModel.update(id, updateData);
  return successResponse(updatedMinibus);
};

const handleDeleteRequest = async (id: string | undefined) => {
  if (!id) return badRequestResponse("Falta el ID en la ruta");

  await MinibusModel.delete(id);
  return noContentResponse();
};

// Helper functions
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
