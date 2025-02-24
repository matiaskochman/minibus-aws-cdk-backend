// File: src/models/minibusModel.ts
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
import { Minibus } from "../types/minibus";

class MinibusModel {
  private static isLocal = process.env.USE_LOCALSTACK === "true";
  private static dynamoEndpoint =
    process.env.DYNAMODB_ENDPOINT || "http://localstack:4566";
  private static ddbClient = new DynamoDBClient({
    region: "us-east-1",
    ...(MinibusModel.isLocal && {
      endpoint: MinibusModel.dynamoEndpoint,
      credentials: { accessKeyId: "test", secretAccessKey: "test" },
    }),
  });
  private static docClient = DynamoDBDocument.from(MinibusModel.ddbClient, {
    marshallOptions: { removeUndefinedValues: true },
  });
  private static TABLE_NAME = process.env.MINIBUSES_TABLE || "Minibuses";

  static async create(MinibusData: Omit<Minibus, "id">): Promise<Minibus> {
    const newMinibus: Minibus = {
      id: uuidv4(),
      ...MinibusData,
    };
    await MinibusModel.docClient.send(
      new PutCommand({
        TableName: MinibusModel.TABLE_NAME,
        Item: newMinibus,
      })
    );
    return newMinibus;
  }

  static async get(id: string): Promise<Minibus | null> {
    const result = await MinibusModel.docClient.send(
      new GetCommand({ TableName: MinibusModel.TABLE_NAME, Key: { id } })
    );
    return (result.Item as Minibus) || null;
  }

  static async update(
    id: string,
    updateData: Partial<Minibus>
  ): Promise<Minibus> {
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
        [`:${key}`]: updateData[key as keyof Minibus],
      }),
      {}
    );

    const { Attributes } = await MinibusModel.docClient.send(
      new UpdateCommand({
        TableName: MinibusModel.TABLE_NAME,
        Key: { id },
        UpdateExpression: `SET ${updateExpressions.join(", ")}`,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
        ReturnValues: "ALL_NEW",
      })
    );
    return Attributes as Minibus;
  }

  static async delete(id: string): Promise<void> {
    await MinibusModel.docClient.send(
      new DeleteCommand({ TableName: MinibusModel.TABLE_NAME, Key: { id } })
    );
  }

  static async list(): Promise<Minibus[]> {
    const result = await MinibusModel.docClient.send(
      new ScanCommand({ TableName: MinibusModel.TABLE_NAME })
    );
    return result.Items as Minibus[];
  }
}

export default MinibusModel;
