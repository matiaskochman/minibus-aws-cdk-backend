import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import ViajeModel from "../../models/viajeModel";
import { Viaje } from "../../types/viaje";

const TABLE_NAME = process.env.TRIPS_TABLE || "Viajes";
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

export const handler = async () => {
  try {
    console.log("Starting cron job to update trips...");
    const now = new Date().toISOString();
    const viajes = await ViajeModel.list();

    const expiredViajes = viajes.filter((viaje) => {
      const viajeDate = new Date(viaje.fecha);
      return viajeDate <= new Date() && viaje.estado !== "Realizado";
    });

    console.log(`Found ${expiredViajes.length} trips to update.`);

    for (const viaje of expiredViajes) {
      await ViajeModel.update(viaje.id, { estado: "Realizado" });
      console.log(`Trip ${viaje.id} marked as realizado.`);
    }

    return { statusCode: 200, body: "OK" };
  } catch (error) {
    console.error("Error in cron handler:", error);
    return { statusCode: 500, body: "Error" };
  }
};
