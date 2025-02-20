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

export const createParadaDeRuta = async (
  paradaData: Omit<ParadaDeRuta, "id">
): Promise<ParadaDeRuta> => {
  const newParada: ParadaDeRuta = {
    id: uuidv4(),
    ...paradaData,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: newParada,
    })
  );

  return newParada;
};

export const getParadaDeRuta = async (
  id: string
): Promise<ParadaDeRuta | null> => {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    })
  );
  return (result.Item as ParadaDeRuta) || null;
};

export const updateParadaDeRuta = async (
  id: string,
  updateData: Partial<ParadaDeRuta>
): Promise<ParadaDeRuta> => {
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
      [`:${key}`]: updateData[key as keyof ParadaDeRuta],
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

  return Attributes as ParadaDeRuta;
};

export const deleteParadaDeRuta = async (id: string): Promise<void> => {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
    })
  );
};

export const listParadasDeRuta = async (): Promise<ParadaDeRuta[]> => {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    })
  );
  return result.Items as ParadaDeRuta[];
};
