import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class DynamoDBConstruct extends Construct {
  public readonly usersTable: dynamodb.Table;
  public readonly driversTable: dynamodb.Table;
  public readonly vendorsTable: dynamodb.Table;
  public readonly routesTable: dynamodb.Table;

  public readonly commissionsTable: dynamodb.Table;
  public readonly paradasTable: dynamodb.Table; // Nueva tabla
  public readonly paradasDeRutaTable: dynamodb.Table; // Nueva tabla
  public readonly viajesTable: dynamodb.Table; // Nueva tabla

  constructor(scope: Construct, id: string) {
    super(scope, id);

    // Tabla de Usuarios
    this.usersTable = new dynamodb.Table(this, "UsersTable", {
      tableName: "Users",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    this.usersTable.addGlobalSecondaryIndex({
      indexName: "UsersByRoleIndex",
      partitionKey: { name: "role", type: dynamodb.AttributeType.STRING },
    });

    // Tabla de Conductores
    this.driversTable = new dynamodb.Table(this, "DriversTable", {
      tableName: "Drivers",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    this.driversTable.addGlobalSecondaryIndex({
      indexName: "DriverByUserIndex",
      partitionKey: { name: "usuarioId", type: dynamodb.AttributeType.STRING },
    });
    this.driversTable.addGlobalSecondaryIndex({
      indexName: "DriversByVendorIndex",
      partitionKey: { name: "vendedorId", type: dynamodb.AttributeType.STRING },
    });

    /**
     * 📌 Tabla de Rutas
     */
    this.routesTable = new dynamodb.Table(this, "RoutesTable", {
      tableName: "Routes",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    this.routesTable.addGlobalSecondaryIndex({
      indexName: "RoutesByConductorIndex",
      partitionKey: {
        name: "conductorId",
        type: dynamodb.AttributeType.STRING,
      },
    });
    // Tabla para Paradas
    this.paradasTable = new dynamodb.Table(this, "ParadasTable", {
      tableName: "Paradas",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    this.paradasTable.addGlobalSecondaryIndex({
      indexName: "ParadasByRutaIndex",
      partitionKey: { name: "direccion", type: dynamodb.AttributeType.STRING },
    });
    // Tabla para Paradas
    this.paradasDeRutaTable = new dynamodb.Table(this, "ParadasDeRutaTable", {
      tableName: "ParadasDeRuta",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    this.viajesTable = new dynamodb.Table(this, "ViajesTable", {
      tableName: "Viajes",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // Índices necesarios
    this.viajesTable.addGlobalSecondaryIndex({
      indexName: "ViajesByRutaIndex",
      partitionKey: { name: "rutaId", type: dynamodb.AttributeType.STRING },
    });

    this.viajesTable.addGlobalSecondaryIndex({
      indexName: "ViajesByConductorIndex",
      partitionKey: {
        name: "conductorId",
        type: dynamodb.AttributeType.STRING,
      },
    });
  }
}
