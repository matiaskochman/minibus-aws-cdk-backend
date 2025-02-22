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
import { User } from "../types/user";

const isLocal = process.env.USE_LOCALSTACK === "true";
const dynamoEndpoint = process.env.DYNAMODB_ENDPOINT;

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

const TABLE_NAME = process.env.USERS_TABLE || "Users";

export const createUser = async (userData: Omit<User, "id">): Promise<User> => {
  const newUser: User = {
    id: uuidv4(),
    ...userData,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: newUser,
    })
  );
  return newUser;
};

export const getUser = async (id: string): Promise<User | null> => {
  const result = await docClient.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { id },
    })
  );
  return (result.Item as User) || null;
};

export const updateUser = async (
  id: string,
  updateData: Partial<User>
): Promise<User> => {
  const updateExpressions = Object.keys(updateData).map(
    (key) => `#${key} = :${key}`
  );

  const ExpressionAttributeNames = Object.keys(updateData).reduce(
    (acc, key) => ({ ...acc, [`#${key}`]: key }),
    {}
  );

  const ExpressionAttributeValues = Object.keys(updateData).reduce(
    (acc, key) => ({ ...acc, [`:${key}`]: updateData[key as keyof User] }),
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
  return Attributes as User;
};

export const deleteUser = async (id: string): Promise<void> => {
  await docClient.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id },
    })
  );
};

export const listUsers = async (): Promise<User[]> => {
  const result = await docClient.send(
    new ScanCommand({
      TableName: TABLE_NAME,
    })
  );
  return result.Items as User[];
};
