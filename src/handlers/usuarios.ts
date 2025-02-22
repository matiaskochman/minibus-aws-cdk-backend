import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
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
