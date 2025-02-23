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

class RutaModel {
  private static isLocal = process.env.USE_LOCALSTACK === "true";
  private static dynamoEndpoint =
    process.env.DYNAMODB_ENDPOINT || "http://localstack:4566";
  private static ddbClient = new DynamoDBClient({
    region: "us-east-1",
    ...(RutaModel.isLocal && {
      endpoint: RutaModel.dynamoEndpoint,
      credentials: { accessKeyId: "test", secretAccessKey: "test" },
    }),
  });
  private static docClient = DynamoDBDocument.from(RutaModel.ddbClient, {
    marshallOptions: { removeUndefinedValues: true },
  });
  private static TABLE_NAME = process.env.RUTAS_TABLE || "Routes";

  static async create(rutaData: Omit<Ruta, "id">): Promise<Ruta> {
    const newRuta: Ruta = {
      id: uuidv4(),
      ...rutaData,
    };
    await RutaModel.docClient.send(
      new PutCommand({ TableName: RutaModel.TABLE_NAME, Item: newRuta })
    );
    return newRuta;
  }

  static async get(id: string): Promise<Ruta | null> {
    const result = await RutaModel.docClient.send(
      new GetCommand({ TableName: RutaModel.TABLE_NAME, Key: { id } })
    );
    return (result.Item as Ruta) || null;
  }

  static async update(id: string, updateData: Partial<Ruta>): Promise<Ruta> {
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

    const { Attributes } = await RutaModel.docClient.send(
      new UpdateCommand({
        TableName: RutaModel.TABLE_NAME,
        Key: { id },
        UpdateExpression: `SET ${updateExpressions.join(", ")}`,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
        ReturnValues: "ALL_NEW",
      })
    );
    return Attributes as Ruta;
  }

  static async delete(id: string): Promise<void> {
    await RutaModel.docClient.send(
      new DeleteCommand({ TableName: RutaModel.TABLE_NAME, Key: { id } })
    );
  }

  static async list(): Promise<Ruta[]> {
    const result = await RutaModel.docClient.send(
      new ScanCommand({ TableName: RutaModel.TABLE_NAME })
    );
    return result.Items as Ruta[];
  }
}

export default RutaModel;
