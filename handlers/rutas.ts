// File: /Users/matiaskochman/dev/personal/vercel_ex/minibus-backend-aws-cdk/handlers/rutas.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { Ruta } from "../types/ruta";

const isLocal = process.env.USE_LOCALSTACK === "true";

const dynamoEndpoint =
  process.env.DYNAMODB_ENDPOINT || "http://localstack:4566";
const ddbClient = new DynamoDBClient({
  region: "us-east-1",
  ...(isLocal && {
    endpoint: dynamoEndpoint,
    credentials: {
      accessKeyId: "test",
      secretAccessKey: "test",
    },
  }),
});

const docClient = DynamoDBDocument.from(ddbClient, {
  marshallOptions: { removeUndefinedValues: true },
});

const TABLE_NAME = process.env.RUTAS_TABLE || "Routes";

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
            Key: { id: pathParameters.id },
          });
          return result.Item
            ? { statusCode: 200, body: JSON.stringify(result.Item) }
            : {
                statusCode: 404,
                body: JSON.stringify({ message: "Ruta no encontrada" }),
              };
        } else {
          const result = await docClient.scan({ TableName: TABLE_NAME });
          return { statusCode: 200, body: JSON.stringify(result.Items) };
        }

      case "POST":
        if (!body)
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "Cuerpo de solicitud faltante" }),
          };

        const data = JSON.parse(body);
        const newRuta: Ruta = {
          id: uuidv4(),
          conductorId: data.conductorId,
          origen: data.origen,
          destino: data.destino,
          horarios: data.horarios || [],
          tarifa: data.tarifa,
          asientosDisponibles: data.asientosDisponibles,
          estado: data.estado || "activa",
          createdAt: new Date().toISOString(),
        };

        await docClient.put({ TableName: TABLE_NAME, Item: newRuta });
        return { statusCode: 201, body: JSON.stringify(newRuta) };

      case "PUT":
        if (!pathParameters?.id || !body) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "ID o cuerpo faltante" }),
          };
        }

        const updateData = JSON.parse(body);
        const updateExpressions = Object.keys(updateData)
          .map((key) => `#${key} = :${key}`)
          .join(", ");

        const result = await docClient.update({
          TableName: TABLE_NAME,
          Key: { id: pathParameters.id },
          UpdateExpression: `SET ${updateExpressions}`,
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
        if (!pathParameters?.id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "ID faltante" }),
          };
        }

        await docClient.delete({
          TableName: TABLE_NAME,
          Key: { id: pathParameters.id },
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
      body: JSON.stringify({
        message: "Error interno",
        error: (error as Error).message,
      }),
    };
  }
};
