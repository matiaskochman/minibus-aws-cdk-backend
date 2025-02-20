import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class DynamoDBConstruct extends Construct {
  public readonly usersTable: dynamodb.Table;
  public readonly driversTable: dynamodb.Table;
  public readonly vendorsTable: dynamodb.Table;
  public readonly routesTable: dynamodb.Table;
  public readonly tripsTable: dynamodb.Table;
  public readonly commissionsTable: dynamodb.Table;

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

    // Otras tablas (similar para vendors, routes, trips, commissions)
    // ... [implementación similar para las demás tablas]
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
  }
}
