import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";

const isLocal = process.env.USE_LOCALSTACK === "true";

const ddbClient = new DynamoDBClient({
  region: "us-east-1",
  ...(isLocal && {
    // endpoint: "http://localhost:4566",
    endpoint: "http://localstack:4566",
    credentials: {
      accessKeyId: "test",
      secretAccessKey: "test",
    },
  }),
});

const docClient = DynamoDBDocument.from(ddbClient, {
  marshallOptions: { removeUndefinedValues: true },
});

const TABLE_NAME = process.env.CONDUCTORES_TABLE || "Conductores";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, pathParameters, body } = event;

  try {
    switch (httpMethod) {
      case "GET":
        if (pathParameters?.id) {
          const result = await docClient.get({
            TableName: TABLE_NAME,
            Key: { ID: pathParameters.id },
          });

          if (!result.Item) {
            return {
              statusCode: 404,
              body: JSON.stringify({ message: "Conductor no encontrado" }),
            };
          }
          return { statusCode: 200, body: JSON.stringify(result.Item) };
        } else {
          const result = await docClient.scan({ TableName: TABLE_NAME });
          return { statusCode: 200, body: JSON.stringify(result.Items) };
        }

      case "POST":
        if (!body)
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "Falta el cuerpo de la solicitud",
            }),
          };

        const data = JSON.parse(body);
        if (!data.Usuario_ID)
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "Usuario_ID es obligatorio" }),
          };

        const newConductor = {
          id: uuidv4(),
          Usuario_ID: data.Usuario_ID,
          Foto_DNI: data.Foto_DNI || null,
          Foto_VTV: data.Foto_VTV || null,
          Estado: data.Estado || "Pendiente",
          Vendedor_ID: data.Vendedor_ID || null,
        };

        await docClient.put({
          TableName: TABLE_NAME,
          Item: newConductor,
        });

        return { statusCode: 201, body: JSON.stringify(newConductor) };

      case "PUT":
        if (!pathParameters?.id)
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "Falta el ID en la ruta" }),
          };
        if (!body)
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "Falta el cuerpo de la solicitud",
            }),
          };

        const updateData = JSON.parse(body);
        const updateExpressions = Object.keys(updateData).map(
          (key) => `#${key} = :${key}`
        );

        const result = await docClient.update({
          TableName: TABLE_NAME,
          Key: { ID: pathParameters.id },
          UpdateExpression: `SET ${updateExpressions.join(", ")}`,
          ExpressionAttributeNames: Object.keys(updateData).reduce(
            (acc, key) => ({ ...acc, [`#${key}`]: key }),
            {}
          ),
          ExpressionAttributeValues: Object.keys(updateData).reduce(
            (acc, key) => ({ ...acc, [`:${key}`]: updateData[key] }),
            {}
          ),
          ReturnValues: "ALL_NEW",
        });

        return { statusCode: 200, body: JSON.stringify(result.Attributes) };

      case "DELETE":
        if (!pathParameters?.id)
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "Falta el ID en la ruta" }),
          };

        await docClient.delete({
          TableName: TABLE_NAME,
          Key: { ID: pathParameters.id },
        });

        return { statusCode: 204, body: "" };

      default:
        return {
          statusCode: 405,
          body: JSON.stringify({ message: "Método no permitido" }),
        };
    }
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error interno", error: error.message }),
    };
  }
};
