// File: /Users/matiaskochman/dev/personal/vercel_ex/minibus-backend-aws-cdk/lib/handlers-construct.ts
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNode from "aws-cdk-lib/aws-lambda-nodejs";
import * as path from "path";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";

interface HandlersConstructProps {
  driversTable: dynamodb.Table;
  routesTable: dynamodb.Table;
}

export class HandlersConstruct extends Construct {
  public readonly conductoresHandler: lambdaNode.NodejsFunction;
  public readonly rutasHandler: lambdaNode.NodejsFunction;

  constructor(scope: Construct, id: string, props: HandlersConstructProps) {
    super(scope, id);

    // Existing conductor handler
    this.conductoresHandler = new lambdaNode.NodejsFunction(
      this,
      "ConductoresHandler",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: path.join(__dirname, "../handlers/conductores.ts"),
        handler: "handler",
        environment: {
          USE_LOCALSTACK: process.env.USE_LOCALSTACK || "true",
          CONDUCTORES_TABLE: props.driversTable.tableName,
        },
        bundling: { externalModules: ["@aws-sdk"] },
      }
    );

    // New routes handler
    this.rutasHandler = new lambdaNode.NodejsFunction(this, "RutasHandler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, "../handlers/rutas.ts"),
      handler: "handler",
      environment: {
        USE_LOCALSTACK: process.env.USE_LOCALSTACK || "true",
        RUTAS_TABLE: props.routesTable.tableName,
      },
      bundling: { externalModules: ["@aws-sdk"] },
    });

    // Grant permissions
    props.driversTable.grantReadWriteData(this.conductoresHandler);
    props.routesTable.grantReadWriteData(this.rutasHandler);
  }
}
