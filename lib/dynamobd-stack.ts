import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

export class DynamoDBStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /**
     * 📌 Tabla de Usuarios
     */
    const usersTable = new dynamodb.Table(this, "UsersTable", {
      tableName: "Users",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    usersTable.addGlobalSecondaryIndex({
      indexName: "UsersByRoleIndex",
      partitionKey: { name: "role", type: dynamodb.AttributeType.STRING },
    });

    /**
     * 📌 Tabla de Conductores
     */
    const driversTable = new dynamodb.Table(this, "DriversTable", {
      tableName: "Drivers",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    driversTable.addGlobalSecondaryIndex({
      indexName: "DriverByUserIndex",
      partitionKey: { name: "usuarioId", type: dynamodb.AttributeType.STRING },
    });

    driversTable.addGlobalSecondaryIndex({
      indexName: "DriversByVendorIndex",
      partitionKey: { name: "vendedorId", type: dynamodb.AttributeType.STRING },
    });

    /**
     * 📌 Tabla de Vendedores
     */
    const vendorsTable = new dynamodb.Table(this, "VendorsTable", {
      tableName: "Vendors",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    vendorsTable.addGlobalSecondaryIndex({
      indexName: "VendorByUserIndex",
      partitionKey: { name: "usuarioId", type: dynamodb.AttributeType.STRING },
    });

    /**
     * 📌 Tabla de Rutas
     */
    const routesTable = new dynamodb.Table(this, "RoutesTable", {
      tableName: "Routes",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    routesTable.addGlobalSecondaryIndex({
      indexName: "RoutesByConductorIndex",
      partitionKey: {
        name: "conductorId",
        type: dynamodb.AttributeType.STRING,
      },
    });

    /**
     * 📌 Tabla de Viajes
     */
    const tripsTable = new dynamodb.Table(this, "TripsTable", {
      tableName: "Trips",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    tripsTable.addGlobalSecondaryIndex({
      indexName: "TripsByRutaIndex",
      partitionKey: { name: "rutaId", type: dynamodb.AttributeType.STRING },
    });

    tripsTable.addGlobalSecondaryIndex({
      indexName: "TripsByConductorIndex",
      partitionKey: {
        name: "conductorId",
        type: dynamodb.AttributeType.STRING,
      },
    });

    /**
     * 📌 Tabla de Comisiones
     */
    const commissionsTable = new dynamodb.Table(this, "CommissionsTable", {
      tableName: "Commissions",
      partitionKey: { name: "id", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    commissionsTable.addGlobalSecondaryIndex({
      indexName: "CommissionsByVendorIndex",
      partitionKey: { name: "vendedorId", type: dynamodb.AttributeType.STRING },
    });

    commissionsTable.addGlobalSecondaryIndex({
      indexName: "CommissionsByConductorIndex",
      partitionKey: {
        name: "conductorId",
        type: dynamodb.AttributeType.STRING,
      },
    });

    // 🔍 Agregar salidas a CloudFormation
    new cdk.CfnOutput(this, "UsersTableArn", { value: usersTable.tableArn });
    new cdk.CfnOutput(this, "DriversTableArn", {
      value: driversTable.tableArn,
    });
    new cdk.CfnOutput(this, "VendorsTableArn", {
      value: vendorsTable.tableArn,
    });
    new cdk.CfnOutput(this, "RoutesTableArn", { value: routesTable.tableArn });
    new cdk.CfnOutput(this, "TripsTableArn", { value: tripsTable.tableArn });
    new cdk.CfnOutput(this, "CommissionsTableArn", {
      value: commissionsTable.tableArn,
    });
  }
}
