import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class DynamoDBConstruct extends Construct {
  public readonly usersTable: dynamodb.Table;
  // public readonly driversTable: dynamodb.Table;
  public readonly minibusTable: dynamodb.Table;

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
      indexName: "UsersByEmailIndex",
      partitionKey: { name: "email", type: dynamodb.AttributeType.STRING },
    });

    // Tabla de Minibuses
    this.minibusTable = new dynamodb.Table(this, "MinibusTable", {
      tableName: "Minibuses",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    this.minibusTable.addGlobalSecondaryIndex({
      indexName: "MinibusByUserIndex",
      partitionKey: { name: "usuarioId", type: dynamodb.AttributeType.STRING },
    });
    this.minibusTable.addGlobalSecondaryIndex({
      indexName: "MinibusByVendorIndex",
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
      indexName: "RoutesByMinibusIndex",
      partitionKey: {
        name: "minibusId",
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
    this.paradasDeRutaTable.addGlobalSecondaryIndex({
      indexName: "ParadasPorLocalidadIndex",
      partitionKey: { name: "localidad", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "provincia", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL, // Indexa todas las columnas
    });

    // Índices necesarios
    this.viajesTable = new dynamodb.Table(this, "ViajesTable", {
      tableName: "Viajes",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // Nuevo GSI
    this.viajesTable.addGlobalSecondaryIndex({
      indexName: "ViajesByParadasIndex",
      partitionKey: { name: "paradaId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "createdAt", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.INCLUDE,
      nonKeyAttributes: ["rutaId", "minibusId", "estado"],
    });

    this.viajesTable.addGlobalSecondaryIndex({
      indexName: "ViajesPorRutaIndex",
      partitionKey: { name: "rutaId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "createdAt", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });
    this.viajesTable.addGlobalSecondaryIndex({
      indexName: "ViajesPorMinibusIndex",
      partitionKey: {
        name: "minibusId",
        type: dynamodb.AttributeType.STRING,
      },
      sortKey: { name: "createdAt", type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });
  }
}
