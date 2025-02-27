import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { DynamoDBConstruct } from "./dynamodb-construct";
import { HandlersConstruct } from "./handlers-construct";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";

export class MinibusBackendAwsCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    console.log("LOCALSTACK:", process.env.USE_LOCALSTACK);
    // Crear constructs
    const database = new DynamoDBConstruct(this, "Database");
    const handlers = new HandlersConstruct(this, "Handlers", {
      minibusTable: database.minibusTable,
      routesTable: database.routesTable,
      paradasTable: database.paradasTable,
      paradasDeRutaTable: database.paradasDeRutaTable,
      viajesTable: database.viajesTable,
      usersTable: database.usersTable,
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
    const minibusesResource = api.root.addResource("minibuses");
    minibusesResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(handlers.minibusesHandler)
    );
    minibusesResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(handlers.minibusesHandler)
    );

    const minibusResource = minibusesResource.addResource("{id}");
    minibusResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(handlers.minibusesHandler)
    );
    minibusResource.addMethod(
      "PUT",
      new apigateway.LambdaIntegration(handlers.minibusesHandler)
    );
    minibusResource.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(handlers.minibusesHandler)
    );

    // Outputs
    new cdk.CfnOutput(this, "ApiUrl", {
      value: api.urlForPath("/minibuses"),
      description: "Endpoint de minibuses",
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

    const paradasDeRutaResource = api.root.addResource("paradasDeRuta");
    paradasDeRutaResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(handlers.paradasDeRutaHandler)
    );
    paradasDeRutaResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(handlers.paradasDeRutaHandler)
    );
    const paradaDeRutaResource = paradasDeRutaResource.addResource("{id}");
    paradaDeRutaResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(handlers.paradasDeRutaHandler)
    );
    paradaDeRutaResource.addMethod(
      "PUT",
      new apigateway.LambdaIntegration(handlers.paradasDeRutaHandler)
    );
    paradaDeRutaResource.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(handlers.paradasDeRutaHandler)
    );
    // Configurar API Gateway
    const viajesResource = api.root.addResource("viajes");
    viajesResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(handlers.viajesHandler)
    );
    viajesResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(handlers.viajesHandler)
    );

    const viajeResource = viajesResource.addResource("{id}");
    viajeResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(handlers.viajesHandler)
    );
    viajeResource.addMethod(
      "PUT",
      new apigateway.LambdaIntegration(handlers.viajesHandler)
    );
    viajeResource.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(handlers.viajesHandler)
    );
    const usuariosResource = api.root.addResource("usuarios");
    usuariosResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(handlers.usuariosHandler)
    );
    usuariosResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(handlers.usuariosHandler)
    );
    // Añadir recursos para usuarios
    const usuarioResource = usuariosResource.addResource("{id}");
    usuarioResource.addMethod(
      "GET",
      new apigateway.LambdaIntegration(handlers.usuariosHandler)
    );
    usuarioResource.addMethod(
      "PUT",
      new apigateway.LambdaIntegration(handlers.usuariosHandler)
    );
    usuarioResource.addMethod(
      "DELETE",
      new apigateway.LambdaIntegration(handlers.usuariosHandler)
    );

    const authResource = api.root.addResource("auth");
    const signUpResource = authResource.addResource("sign-up");

    signUpResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(handlers.authHandler)
    );

    const logInResource = authResource.addResource("log-in");
    logInResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(handlers.authHandler)
    );

    const logOutResource = authResource.addResource("log-out");
    logOutResource.addMethod(
      "POST",
      new apigateway.LambdaIntegration(handlers.authHandler)
    );

    const cronRule = new events.Rule(this, "UpdateTripsCronRule", {
      schedule: events.Schedule.cron({ hour: "23", minute: "0" }), // Runs daily at 11 PM UTC
    });

    cronRule.addTarget(new targets.LambdaFunction(handlers.cronHandler1));
  }
}
