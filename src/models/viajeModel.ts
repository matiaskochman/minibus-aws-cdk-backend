// /src/models/viajeModel.ts
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocument,
  QueryCommand,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { Viaje } from "../types/viaje";
import { User } from "../types/user";

class ViajeModel {
  private static isLocal = process.env.USE_LOCALSTACK === "true";
  private static dynamoEndpoint =
    process.env.DYNAMODB_ENDPOINT || "http://localstack:4566";

  private static ddbClient = new DynamoDBClient({
    region: "us-east-1",
    ...(ViajeModel.isLocal && {
      endpoint: ViajeModel.dynamoEndpoint,
      credentials: {
        accessKeyId: "test",
        secretAccessKey: "test",
      },
    }),
  });

  private static docClient = DynamoDBDocument.from(ViajeModel.ddbClient, {
    marshallOptions: { removeUndefinedValues: true },
  });

  private static TABLE_NAME = process.env.TRIPS_TABLE || "Viajes";
  // Esta constante se define para futuros usos o validaciones
  private static PARADAS_DE_RUTA_TABLE =
    process.env.PARADAS_DE_RUTA_TABLE || "ParadasDeRuta";

  static async create(viajeData: Omit<Viaje, "id">): Promise<Viaje> {
    if (!viajeData.paradasDeRuta || !Array.isArray(viajeData.paradasDeRuta)) {
      throw new Error("ParadasDeRuta es requerido y debe ser un array");
    }

    const newViaje: Viaje = {
      id: uuidv4(),
      ...viajeData,
      usuarioList: [],
      createdAt: new Date().toISOString(),
    };

    await ViajeModel.docClient.send(
      new PutCommand({
        TableName: ViajeModel.TABLE_NAME,
        Item: newViaje,
      })
    );

    return newViaje;
  }

  static async get(id: string): Promise<Viaje | null> {
    const result = await ViajeModel.docClient.send(
      new GetCommand({
        TableName: ViajeModel.TABLE_NAME,
        Key: { id },
      })
    );
    return (result.Item as Viaje) || null;
  }

  static async update(id: string, updateData: Partial<Viaje>): Promise<Viaje> {
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

    const { Attributes } = await ViajeModel.docClient.send(
      new UpdateCommand({
        TableName: ViajeModel.TABLE_NAME,
        Key: { id },
        UpdateExpression: `SET ${updateExpressions.join(", ")}`,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
        ReturnValues: "ALL_NEW",
      })
    );

    return Attributes as Viaje;
  }

  static async delete(id: string): Promise<void> {
    await ViajeModel.docClient.send(
      new DeleteCommand({
        TableName: ViajeModel.TABLE_NAME,
        Key: { id },
      })
    );
  }

  static async list(): Promise<Viaje[]> {
    const result = await ViajeModel.docClient.send(
      new ScanCommand({
        TableName: ViajeModel.TABLE_NAME,
      })
    );
    return result.Items as Viaje[];
  }

  static async getByRuta(rutaId: string): Promise<Viaje[]> {
    const result = await ViajeModel.docClient.send(
      new QueryCommand({
        TableName: ViajeModel.TABLE_NAME,
        IndexName: "ViajesPorRutaIndex",
        KeyConditionExpression: "rutaId = :rutaId",
        ExpressionAttributeValues: {
          ":rutaId": rutaId,
        },
        ScanIndexForward: false, // Orden descendente: los viajes más recientes primero
      })
    );
    return result.Items as Viaje[];
  }

  static async getByMinibus(minibusId: string): Promise<Viaje[]> {
    const result = await ViajeModel.docClient.send(
      new QueryCommand({
        TableName: ViajeModel.TABLE_NAME,
        IndexName: "ViajesPorMinibusIndex",
        KeyConditionExpression: "minibusId = :minibusId",
        ExpressionAttributeValues: {
          ":minibusId": minibusId,
        },
        ScanIndexForward: false, // Orden descendente por fecha
      })
    );
    return result.Items as Viaje[];
  }

  /**
   * Agrega un usuario a la lista de usuarios (usuarioList) de un viaje existente.
   */
  static async addUserToViaje(viajeId: string, user: User): Promise<Viaje> {
    const { Attributes } = await ViajeModel.docClient.send(
      new UpdateCommand({
        TableName: ViajeModel.TABLE_NAME,
        Key: { id: viajeId },
        UpdateExpression:
          "SET usuarioList = list_append(if_not_exists(usuarioList, :emptyList), :newUser)",
        ExpressionAttributeValues: {
          ":emptyList": [],
          ":newUser": [user],
        },
        ReturnValues: "ALL_NEW",
      })
    );
    return Attributes as Viaje;
  }

  /**
   * Quita un usuario de la lista de usuarios (usuarioList) de un viaje.
   * Se obtiene el viaje, se filtra la lista removiendo el usuario cuyo id coincide y se actualiza el registro.
   */
  static async quitarUserDeViaje(
    viajeId: string,
    userId: string
  ): Promise<Viaje> {
    // Obtener el viaje actual
    const viaje = await ViajeModel.get(viajeId);
    if (!viaje) {
      throw new Error(`Viaje no encontrado con id ${viajeId}`);
    }

    // Filtrar la lista de usuarios removiendo el usuario con el id indicado
    const updatedUserList = viaje.usuarioList.filter(
      (user) => user.id !== userId
    );

    // Actualizar la propiedad usuarioList en DynamoDB
    const { Attributes } = await ViajeModel.docClient.send(
      new UpdateCommand({
        TableName: ViajeModel.TABLE_NAME,
        Key: { id: viajeId },
        UpdateExpression: "SET usuarioList = :updatedUserList",
        ExpressionAttributeValues: {
          ":updatedUserList": updatedUserList,
        },
        ReturnValues: "ALL_NEW",
      })
    );
    return Attributes as Viaje;
  }
}

export default ViajeModel;
