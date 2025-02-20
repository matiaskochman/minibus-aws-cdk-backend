import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { DynamoDBConstruct } from "./dynamodb-construct";
import { HandlersConstruct } from "./handlers-construct";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class MinibusBackendAwsCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    console.log("LOCALSTACK:", process.env.USE_LOCALSTACK);
    // Crear constructs
    const database = new DynamoDBConstruct(this, "Database");
    const handlers = new HandlersConstruct(this, "Handlers", {
      driversTable: database.driversTable,
      routesTable: database.routesTable,
      paradasTable: database.paradasTable,
    });

    // Configurar API Gateway
    const api = new apigateway.RestApi(this, "MinibusApi", {
      restApiName: "minibus-api",
      deployOptions: {
        stageName: process.env.USE_LOCALSTACK ? "dev" : "prod",
      },
      endpointConfiguration: {
        types: [apigateway.EndpointType.REGIONAL],
      },
    });

    // Configurar rutas
    const conductoresResource = api.root.addResource("conductores");
    conductoresResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(handlers.conductoresHandler)
    );
    conductoresResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(handlers.conductoresHandler)
    );

    const conductorResource = conductoresResource.addResource("{id}");
    conductorResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(handlers.conductoresHandler)
    );
    conductorResource.addMethod(
      "PUT",
      new apigateway.LambdaIntegration(handlers.conductoresHandler)
    );
    conductorResource.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(handlers.conductoresHandler)
    );

    // Outputs
    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.urlForPath("/conductores"),
      description: "Endpoint de conductores",
    });

    // Nueva configuración para rutas
    const rutasResource = api.root.addResource("rutas");
    rutasResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(handlers.rutasHandler)
    );
    rutasResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(handlers.rutasHandler)
    );

    const rutaResource = rutasResource.addResource("{id}");
    rutaResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(handlers.rutasHandler)
    );
    rutaResource.addMethod(
      "PUT",
      new apigateway.LambdaIntegration(handlers.rutasHandler)
    );
    rutaResource.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(handlers.rutasHandler)
    );

    // Endpoints para paradas
    const paradasResource = api.root.addResource("paradas");
    paradasResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(handlers.paradasHandler)
    );
    paradasResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(handlers.paradasHandler)
    );
    const paradaResource = paradasResource.addResource("{id}");
    paradaResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(handlers.paradasHandler)
    );
    paradaResource.addMethod(
      "PUT",
      new apigateway.LambdaIntegration(handlers.paradasHandler)
    );
    paradaResource.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(handlers.paradasHandler)
    );

    // new cdk.CfnOutput(this, "ApiUrl", {
    //   value: api.urlForPath("/conductores"),
    //   description: "Endpoint de conductores",
    // });
  }
}
