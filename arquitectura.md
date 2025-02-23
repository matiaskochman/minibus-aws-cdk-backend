graph TD
APIGateway[API Gateway] -->|POST| AuthHandler[Lambda: Auth Handler]
APIGateway -->|GET/POST/PUT/DELETE| ConductoresHandler[Lambda: Conductores Handler]
APIGateway -->|GET/POST/PUT/DELETE| RutasHandler[Lambda: Rutas Handler]
APIGateway -->|GET/POST/PUT/DELETE| ParadasHandler[Lambda: Paradas Handler]
APIGateway -->|GET/POST/PUT/DELETE| ParadasDeRutaHandler[Lambda: Paradas de Ruta Handler]
APIGateway -->|GET/POST/PUT/DELETE| ViajesHandler[Lambda: Viajes Handler]
APIGateway -->|GET/POST/PUT/DELETE| UsuariosHandler[Lambda: Usuarios Handler]

    AuthHandler -->|Uses| UsersTable[DynamoDB: Users]
    ConductoresHandler -->|Uses| DriversTable[DynamoDB: Drivers]
    RutasHandler -->|Uses| RoutesTable[DynamoDB: Routes]
    ParadasHandler -->|Uses| ParadasTable[DynamoDB: Paradas]
    ParadasDeRutaHandler -->|Uses| ParadasDeRutaTable[DynamoDB: Paradas de Ruta]
    ViajesHandler -->|Uses| ViajesTable[DynamoDB: Viajes]
    UsuariosHandler -->|Uses| UsersTable

    AuthHandler -->|Generates| JWT[JWT Tokens]
