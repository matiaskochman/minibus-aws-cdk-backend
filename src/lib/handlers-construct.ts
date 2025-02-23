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
  paradasTable: dynamodb.Table;
  paradasDeRutaTable: dynamodb.Table;
  viajesTable: dynamodb.Table;
  usersTable: dynamodb.Table;
}

export class HandlersConstruct extends Construct {
  public readonly conductoresHandler: lambdaNode.NodejsFunction;
  public readonly rutasHandler: lambdaNode.NodejsFunction;
  public readonly paradasHandler: lambdaNode.NodejsFunction;
  public readonly paradasDeRutaHandler: lambdaNode.NodejsFunction;
  public readonly viajesHandler: lambdaNode.NodejsFunction;
  public readonly usuariosHandler: lambdaNode.NodejsFunction;
  public readonly authHandler: lambdaNode.NodejsFunction;
  public readonly cronHandler1: lambdaNode.NodejsFunction;

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
          JWT_SECRET: process.env.JWT_SECRET as string, // Agregado
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
        JWT_SECRET: process.env.JWT_SECRET as string, // Agregado
      },
      bundling: { externalModules: ["@aws-sdk"] },
    });

    this.paradasHandler = new lambdaNode.NodejsFunction(
      this,
      "ParadasHandler",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: path.join(__dirname, "../handlers/paradas.ts"),
        handler: "handler",
        environment: {
          USE_LOCALSTACK: process.env.USE_LOCALSTACK || "true",
          PARADAS_TABLE: props.paradasTable.tableName,
          JWT_SECRET: process.env.JWT_SECRET as string, // Agregado
        },
        bundling: { externalModules: ["@aws-sdk"] },
      }
    );

    this.paradasDeRutaHandler = new lambdaNode.NodejsFunction(
      this,
      "ParadasDeRutaHandler",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: path.join(__dirname, "../handlers/paradasDeRuta.ts"),
        handler: "handler",
        environment: {
          USE_LOCALSTACK: process.env.USE_LOCALSTACK || "true",
          PARADAS_TABLE: props.paradasDeRutaTable.tableName,
          JWT_SECRET: process.env.JWT_SECRET as string, // Agregado
        },
        bundling: { externalModules: ["@aws-sdk"] },
      }
    );
    this.viajesHandler = new lambdaNode.NodejsFunction(this, "ViajesHandler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, "../handlers/viajes/viajes.ts"),
      handler: "handler",
      environment: {
        USE_LOCALSTACK: process.env.USE_LOCALSTACK || "true",
        TRIPS_TABLE: props.viajesTable.tableName,
        PARADAS_DE_RUTA_TABLE: props.paradasDeRutaTable.tableName, // Nuevo
        JWT_SECRET: process.env.JWT_SECRET as string, // Agregado
      },
      bundling: { externalModules: ["@aws-sdk"] },
    });

    // Añadir este handler
    this.usuariosHandler = new lambdaNode.NodejsFunction(
      this,
      "UsuariosHandler",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        entry: path.join(__dirname, "../handlers/usuarios.ts"),
        handler: "handler",
        environment: {
          USE_LOCALSTACK: process.env.USE_LOCALSTACK || "true",
          USERS_TABLE: props.usersTable.tableName,
          JWT_SECRET: process.env.JWT_SECRET as string, // Agregado
        },
        bundling: { externalModules: ["@aws-sdk"] },
      }
    );
    this.authHandler = new lambdaNode.NodejsFunction(this, "AuthHandler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(__dirname, "../handlers/auth.ts"),
      handler: "handler",
      environment: {
        USE_LOCALSTACK: process.env.USE_LOCALSTACK || "true",
        USERS_TABLE: props.usersTable.tableName,
        JWT_SECRET: process.env.JWT_SECRET as string,
      },
      bundling: { externalModules: ["@aws-sdk"] },
    });

    this.cronHandler1 = new lambdaNode.NodejsFunction(this, "CronHandler", {
      runtime: lambda.Runtime.NODEJS_18_X,
      entry: path.join(
        __dirname,
        "../handlers/viajes/cron-actualizar-viajes.ts"
      ),
      handler: "handler",
      environment: {
        USE_LOCALSTACK: process.env.USE_LOCALSTACK || "true",
        TRIPS_TABLE: props.viajesTable.tableName,
      },
    });
    props.viajesTable.grantReadWriteData(this.cronHandler1);

    props.usersTable.grantReadWriteData(this.usuariosHandler);
    props.viajesTable.grantReadWriteData(this.viajesHandler);
    props.driversTable.grantReadWriteData(this.conductoresHandler);
    props.routesTable.grantReadWriteData(this.rutasHandler);
    props.paradasTable.grantReadWriteData(this.paradasHandler);
    props.paradasDeRutaTable.grantReadWriteData(this.paradasDeRutaHandler);
  }
}
