import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { ParadaDeRuta } from "../types/paradaDeRuta";

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

const TABLE_NAME = process.env.PARADASDE_RUTA_TABLE || "ParadasDeRuta";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { httpMethod, pathParameters, body } = event;
  try {
    switch (httpMethod) {
      case "GET":
        if (pathParameters?.id) {
          // Obtener una ParadaDeRuta específica
          const result = await docClient.get({
            TableName: TABLE_NAME,
            Key: { id: pathParameters.id },
          });
          if (!result.Item) {
            return {
              statusCode: 404,
              body: JSON.stringify({ message: "Parada de ruta no encontrada" }),
            };
          }
          return {
            statusCode: 200,
            body: JSON.stringify(result.Item),
          };
        } else {
          // Obtener todas las ParadasDeRuta
          const result = await docClient.scan({ TableName: TABLE_NAME });
          return {
            statusCode: 200,
            body: JSON.stringify(result.Items),
          };
        }

      case "POST":
        if (!body) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "Falta el cuerpo de la solicitud",
            }),
          };
        }
        const data = JSON.parse(body);
        // Validación de campos requeridos
        if (!data.parada || data.posicion === undefined || !data.horario) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "Faltan campos requeridos: parada, posicion y horario",
            }),
          };
        }
        const newParadaDeRuta: ParadaDeRuta = {
          id: uuidv4(),
          parada: data.parada,
          posicion: data.posicion,
          horario: data.horario,
        };
        await docClient.put({
          TableName: TABLE_NAME,
          Item: newParadaDeRuta,
        });
        return {
          statusCode: 201,
          body: JSON.stringify(newParadaDeRuta),
        };

      case "PUT":
        if (!pathParameters?.id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "Falta el ID en la ruta" }),
          };
        }
        if (!body) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "Falta el cuerpo de la solicitud",
            }),
          };
        }
        const updateData = JSON.parse(body);
        const updateExpressions = Object.keys(updateData).map(
          (key) => `#${key} = :${key}`
        );
        const updateResult = await docClient.update({
          TableName: TABLE_NAME,
          Key: { id: pathParameters.id },
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
        return {
          statusCode: 200,
          body: JSON.stringify(updateResult.Attributes),
        };

      case "DELETE":
        if (!pathParameters?.id) {
          return {
            statusCode: 400,
            body: JSON.stringify({ message: "Falta el ID en la ruta" }),
          };
        }
        await docClient.delete({
          TableName: TABLE_NAME,
          Key: { id: pathParameters.id },
        });
        return {
          statusCode: 204,
          body: "",
        };

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
      body: JSON.stringify({
        message: "Error interno",
        error: error.message,
      }),
    };
  }
};
