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
import { Parada } from "../types/parada";

class ParadaModel {
  private static isLocal = process.env.USE_LOCALSTACK === "true";
  private static dynamoEndpoint =
    process.env.DYNAMODB_ENDPOINT || "http://localstack:4566";
  private static ddbClient = new DynamoDBClient({
    region: "us-east-1",
    ...(ParadaModel.isLocal && {
      endpoint: ParadaModel.dynamoEndpoint,
      credentials: { accessKeyId: "test", secretAccessKey: "test" },
    }),
  });
  private static docClient = DynamoDBDocument.from(ParadaModel.ddbClient, {
    marshallOptions: { removeUndefinedValues: true },
  });
  private static TABLE_NAME = process.env.PARADAS_TABLE || "Paradas";

  static async create(paradaData: Omit<Parada, "id">): Promise<Parada> {
    const newParada: Parada = {
      id: uuidv4(),
      ...paradaData,
    };
    await ParadaModel.docClient.send(
      new PutCommand({ TableName: ParadaModel.TABLE_NAME, Item: newParada })
    );
    return newParada;
  }

  static async get(id: string): Promise<Parada | null> {
    const result = await ParadaModel.docClient.send(
      new GetCommand({ TableName: ParadaModel.TABLE_NAME, Key: { id } })
    );
    return (result.Item as Parada) || null;
  }

  static async update(
    id: string,
    updateData: Partial<Parada>
  ): Promise<Parada> {
    const updateExpressions = Object.keys(updateData).map(
      (key) => `#${key} = :${key}`
    );
    const ExpressionAttributeNames = Object.keys(updateData).reduce(
      (acc, key) => ({ ...acc, [`#${key}`]: key }),
      {}
    );
    const ExpressionAttributeValues = Object.keys(updateData).reduce(
      (acc, key) => ({ ...acc, [`:${key}`]: updateData[key as keyof Parada] }),
      {}
    );

    const { Attributes } = await ParadaModel.docClient.send(
      new UpdateCommand({
        TableName: ParadaModel.TABLE_NAME,
        Key: { id },
        UpdateExpression: `SET ${updateExpressions.join(", ")}`,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
        ReturnValues: "ALL_NEW",
      })
    );
    return Attributes as Parada;
  }

  static async delete(id: string): Promise<void> {
    await ParadaModel.docClient.send(
      new DeleteCommand({ TableName: ParadaModel.TABLE_NAME, Key: { id } })
    );
  }

  static async list(): Promise<Parada[]> {
    const result = await ParadaModel.docClient.send(
      new ScanCommand({ TableName: ParadaModel.TABLE_NAME })
    );
    return result.Items as Parada[];
  }
}

export default ParadaModel;
