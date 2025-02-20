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
import { Conductor } from "../types/conductor";

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

const TABLE_NAME = process.env.CONDUCTORES_TABLE || "Conductores";

export const createConductor = async (
  conductorData: Omit<Conductor, "id">
): Promise<Conductor> => {
  const newConductor: Conductor = {
    id: uuidv4(),
    ...conductorData,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: newConductor,
    })
  );

  return newConductor;
};

export const getConductor = async (id: string): Promise<Conductor | null> => {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    })
  );
  return (result.Item as Conductor) || null;
};

export const updateConductor = async (
  id: string,
  updateData: Partial<Conductor>
): Promise<Conductor> => {
  const updateExpressions = Object.keys(updateData).map(
    (key) => `#${key} = :${key}`
  );
  const ExpressionAttributeNames = Object.keys(updateData).reduce(
    (acc, key) => ({ ...acc, [`#${key}`]: key }),
    {}
  );
  const ExpressionAttributeValues = Object.keys(updateData).reduce(
    (acc, key) => ({ ...acc, [`:${key}`]: updateData[key as keyof Conductor] }),
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

  return Attributes as Conductor;
};

export const deleteConductor = async (id: string): Promise<void> => {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
    })
  );
};

export const listConductores = async (): Promise<Conductor[]> => {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    })
  );
  return result.Items as Conductor[];
};
