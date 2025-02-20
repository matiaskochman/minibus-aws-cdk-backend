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
  }
}
