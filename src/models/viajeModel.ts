import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { Viaje } from "../types/viaje";

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

const TABLE_NAME = process.env.TRIPS_TABLE || "Viajes";
const PARADAS_DE_RUTA_TABLE =
  process.env.PARADAS_DE_RUTA_TABLE || "ParadasDeRuta";

export const createViaje = async (
  viajeData: Omit<Viaje, "id">
): Promise<Viaje> => {
  if (!viajeData.paradasDeRuta || !Array.isArray(viajeData.paradasDeRuta)) {
    throw new Error("ParadasDeRuta es requerido y debe ser un array");
  }

  const newViaje: Viaje = {
    id: uuidv4(),
    ...viajeData,
    createdAt: new Date().toISOString(),
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: newViaje,
    })
  );

  return newViaje;
};

export const getViaje = async (id: string): Promise<Viaje | null> => {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    })
  );
  return (result.Item as Viaje) || null;
};

export const updateViaje = async (
  id: string,
  updateData: Partial<Viaje>
): Promise<Viaje> => {
  const updateExpressions = Object.keys(updateData).map(
    (key) => `#${key} = :${key}`
  );

  const ExpressionAttributeNames = Object.keys(updateData).reduce(
    (acc, key) => ({ ...acc, [`#${key}`]: key }),
    {}
  );

  const ExpressionAttributeValues = Object.keys(updateData).reduce(
    (acc, key) => ({
      ...acc,
      [`:${key}`]: updateData[key as keyof Viaje],
    }),
    {}
  );

  const { Attributes } = await docClient.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames,
      ExpressionAttributeValues,
      ReturnValues: "ALL_NEW",
    })
  );

  return Attributes as Viaje;
};

export const deleteViaje = async (id: string): Promise<void> => {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
    })
  );
};

export const listViajes = async (): Promise<Viaje[]> => {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    })
  );
  return result.Items as Viaje[];
};
