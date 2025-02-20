import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { Ruta } from "../types/ruta"; // La nueva interfaz Ruta
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
        if (!data.conductorId || !data.paradasDeRuta) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "Faltan campos requeridos: conductorId y paradasDeRuta",
            }),
          };
        }
        // Validar la estructura de cada ParadaDeRuta
        for (const paradaDeRuta of data.paradasDeRuta) {
          if (
            !paradaDeRuta.parada ||
            !paradaDeRuta.parada.nombre ||
            !paradaDeRuta.parada.direccion ||
            typeof paradaDeRuta.posicion !== "number" ||
            !paradaDeRuta.horario
          ) {
            return {
              statusCode: 400,
              body: JSON.stringify({
                message: "Estructura de paradasDeRuta inválida",
              }),
            };
          }
        }
        const newRuta: Ruta = {
          id: uuidv4(),
          conductorId: data.conductorId,
          estado: data.estado || "activa",
          paradasDeRuta: data.paradasDeRuta.map((p: any) => ({
            id: p.id || uuidv4(),
            parada: {
              id: p.parada.id || uuidv4(),
              nombre: p.parada.nombre,
              direccion: p.parada.direccion,
              descripcion: p.parada.descripcion || null,
            },
            posicion: p.posicion,
            horario: p.horario,
          })),
          createdAt: new Date().toISOString(),
        };
        await docClient.put({
          TableName: TABLE_NAME,
          Item: newRuta,
        });
        return { statusCode: 201, body: JSON.stringify(newRuta) };

      case "PUT":
        if (!pathParameters?.id || !body) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "ID o cuerpo de solicitud faltante",
            }),
          };
        }
        const updateData = JSON.parse(body);
        // Si se actualiza el arreglo de paradasDeRuta, aseguramos su estructura
        if (updateData.paradasDeRuta) {
          updateData.paradasDeRuta = updateData.paradasDeRuta.map((p: any) => ({
            id: p.id || uuidv4(),
            parada: {
              id: p.parada?.id || uuidv4(),
              nombre: p.parada?.nombre,
              direccion: p.parada?.direccion,
              descripcion: p.parada?.descripcion || null,
            },
            posicion: p.posicion,
            horario: p.horario,
          }));
        }
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
