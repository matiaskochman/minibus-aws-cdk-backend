import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument, ScanCommandOutput } from "@aws-sdk/lib-dynamodb";
import {
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { ParadaDeRuta } from "../types/paradaDeRuta";

class ParadaDeRutaModel {
  private static isLocal = process.env.USE_LOCALSTACK === "true";
  private static dynamoEndpoint =
    process.env.DYNAMODB_ENDPOINT || "http://localstack:4566";
  private static ddbClient = new DynamoDBClient({
    region: "us-east-1",
    ...(ParadaDeRutaModel.isLocal && {
      endpoint: ParadaDeRutaModel.dynamoEndpoint,
      credentials: { accessKeyId: "test", secretAccessKey: "test" },
    }),
  });
  private static docClient = DynamoDBDocument.from(
    ParadaDeRutaModel.ddbClient,
    {
      marshallOptions: { removeUndefinedValues: true },
    }
  );
  private static TABLE_NAME =
    process.env.PARADASDE_RUTA_TABLE || "ParadasDeRuta";

  static async create(
    paradaData: Omit<ParadaDeRuta, "id">
  ): Promise<ParadaDeRuta> {
    const newParada: ParadaDeRuta = {
      id: uuidv4(),
      ...paradaData,
    };
    await ParadaDeRutaModel.docClient.send(
      new PutCommand({
        TableName: ParadaDeRutaModel.TABLE_NAME,
        Item: newParada,
      })
    );
    return newParada;
  }

  static async get(id: string): Promise<ParadaDeRuta | null> {
    const result = await ParadaDeRutaModel.docClient.send(
      new GetCommand({ TableName: ParadaDeRutaModel.TABLE_NAME, Key: { id } })
    );
    return (result.Item as ParadaDeRuta) || null;
  }

  static async update(
    id: string,
    updateData: Partial<ParadaDeRuta>
  ): Promise<ParadaDeRuta> {
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

    const { Attributes } = await ParadaDeRutaModel.docClient.send(
      new UpdateCommand({
        TableName: ParadaDeRutaModel.TABLE_NAME,
        Key: { id },
        UpdateExpression: `SET ${updateExpressions.join(", ")}`,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
        ReturnValues: "ALL_NEW",
      })
    );
    return Attributes as ParadaDeRuta;
  }

  static async delete(id: string): Promise<void> {
    await ParadaDeRutaModel.docClient.send(
      new DeleteCommand({
        TableName: ParadaDeRutaModel.TABLE_NAME,
        Key: { id },
      })
    );
  }

  static async list(): Promise<ParadaDeRuta[]> {
    const result = await ParadaDeRutaModel.docClient.send(
      new ScanCommand({ TableName: ParadaDeRutaModel.TABLE_NAME })
    );
    return result.Items as ParadaDeRuta[];
  }

  static async deleteAll(): Promise<void> {
    let lastEvaluatedKey = null;
    do {
      const scanResult: ScanCommandOutput =
        await ParadaDeRutaModel.docClient.send(
          new ScanCommand({
            TableName: ParadaDeRutaModel.TABLE_NAME,
            ExclusiveStartKey: lastEvaluatedKey || undefined,
          })
        );
      if (scanResult.Items?.length) {
        await Promise.all(
          scanResult.Items.map((item) =>
            ParadaDeRutaModel.docClient.send(
              new DeleteCommand({
                TableName: ParadaDeRutaModel.TABLE_NAME,
                Key: { id: item.id },
              })
            )
          )
        );
      }
      lastEvaluatedKey = scanResult.LastEvaluatedKey;
    } while (lastEvaluatedKey);
  }
}

export default ParadaDeRutaModel;
