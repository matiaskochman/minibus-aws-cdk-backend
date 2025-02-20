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

export const createRuta = async (rutaData: Omit<Ruta, "id">): Promise<Ruta> => {
  const newRuta: Ruta = {
    id: uuidv4(),
    ...rutaData,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: newRuta,
    })
  );

  return newRuta;
};

export const getRuta = async (id: string): Promise<Ruta | null> => {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    })
  );
  return (result.Item as Ruta) || null;
};

export const updateRuta = async (
  id: string,
  updateData: Partial<Ruta>
): Promise<Ruta> => {
  const updateExpressions = Object.keys(updateData).map(
    (key) => `#${key} = :${key}`
  );
  const ExpressionAttributeNames = Object.keys(updateData).reduce(
    (acc, key) => ({ ...acc, [`#${key}`]: key }),
    {}
  );
  const ExpressionAttributeValues = Object.keys(updateData).reduce(
    (acc, key) => ({ ...acc, [`:${key}`]: updateData[key as keyof Ruta] }),
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

  return Attributes as Ruta;
};

export const deleteRuta = async (id: string): Promise<void> => {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
    })
  );
};

export const listRutas = async (): Promise<Ruta[]> => {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    })
  );
  return result.Items as Ruta[];
};
