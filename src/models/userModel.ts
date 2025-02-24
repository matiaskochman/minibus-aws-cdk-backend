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
import { Viaje } from "../types/viaje";

class UserModel {
  private static isLocal = process.env.USE_LOCALSTACK === "true";
  private static dynamoEndpoint =
    process.env.DYNAMODB_ENDPOINT || "http://localstack:4566";
  private static ddbClient = new DynamoDBClient({
    region: "us-east-1",
    ...(UserModel.isLocal && {
      endpoint: UserModel.dynamoEndpoint,
      credentials: { accessKeyId: "test", secretAccessKey: "test" },
    }),
  });
  private static docClient = DynamoDBDocument.from(UserModel.ddbClient, {
    marshallOptions: { removeUndefinedValues: true },
  });
  private static TABLE_NAME = process.env.USERS_TABLE || "Users";

  static async create(userData: Omit<User, "id">): Promise<User> {
    const newUser: User = {
      id: uuidv4(),
      ...userData,
      viajesList: [],
    };
    await UserModel.docClient.send(
      new PutCommand({ TableName: UserModel.TABLE_NAME, Item: newUser })
    );
    return newUser;
  }

  static async get(id: string): Promise<User | null> {
    const result = await UserModel.docClient.send(
      new GetCommand({ TableName: UserModel.TABLE_NAME, Key: { id } })
    );
    return (result.Item as User) || null;
  }

  static async update(id: string, updateData: Partial<User>): Promise<User> {
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

    const { Attributes } = await UserModel.docClient.send(
      new UpdateCommand({
        TableName: UserModel.TABLE_NAME,
        Key: { id },
        UpdateExpression: `SET ${updateExpressions.join(", ")}`,
        ExpressionAttributeNames,
        ExpressionAttributeValues,
        ReturnValues: "ALL_NEW",
      })
    );
    return Attributes as User;
  }

  static async delete(id: string): Promise<void> {
    await UserModel.docClient.send(
      new DeleteCommand({ TableName: UserModel.TABLE_NAME, Key: { id } })
    );
  }

  static async list(): Promise<User[]> {
    const result = await UserModel.docClient.send(
      new ScanCommand({ TableName: UserModel.TABLE_NAME })
    );
    return result.Items as User[];
  }
  // Función para agregar un viaje al usuario de forma atómica
  static async addViaje(userId: string, viaje: Viaje): Promise<User> {
    const { Attributes } = await UserModel.docClient.send(
      new UpdateCommand({
        TableName: UserModel.TABLE_NAME,
        Key: { id: userId },
        UpdateExpression:
          "SET viajesList = list_append(if_not_exists(viajesList, :emptyList), :newViaje)",
        ExpressionAttributeValues: {
          ":emptyList": [],
          ":newViaje": [viaje],
        },
        ReturnValues: "ALL_NEW",
      })
    );
    return Attributes as User;
  }

  // Función para quitar un viaje del usuario
  static async removeViaje(userId: string, viajeId: string): Promise<User> {
    // Primero obtenemos el usuario para filtrar el viaje a remover
    const user = await UserModel.get(userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }
    const updatedViajesList = user.viajesList.filter(
      (viaje) => viaje.id !== viajeId
    );
    // Actualizamos el registro completo con la lista filtrada
    return await UserModel.update(userId, { viajesList: updatedViajesList });
  }
}

export default UserModel;
