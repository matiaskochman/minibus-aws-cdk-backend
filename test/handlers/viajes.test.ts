// tests/handlers/viajes.test.ts
import { handler } from "../../src/handlers/viajes/viajes";
import ViajeModel from "../../src/models/viajeModel";
import jwt from "jsonwebtoken";
import { APIGatewayProxyEvent } from "aws-lambda";

// Mockear el modelo completo
jest.mock("../../src/models/viajeModel");
const mockedViajeModel = ViajeModel as jest.Mocked<typeof ViajeModel>;

// Mockear JWT
jest.mock("jsonwebtoken", () => ({
  verify: jest.fn().mockReturnValue({}),
}));

const mockEvent = (
  overrides: Partial<APIGatewayProxyEvent>
): APIGatewayProxyEvent => ({
  httpMethod: "GET",
  path: "/viajes",
  headers: {
    Authorization: "Bearer valid.token.here",
  },
  multiValueHeaders: {},
  queryStringParameters: null,
  multiValueQueryStringParameters: null,
  pathParameters: null,
  stageVariables: null,
  requestContext: {} as any,
  resource: "",
  body: null,
  isBase64Encoded: false,
  ...overrides,
});

describe("Viajes Handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  describe("GET /viajes", () => {
    it("debería retornar todos los viajes", async () => {
      const mockViajes = [{ id: "1", estado: "programado" }];
      mockedViajeModel.list.mockResolvedValue(mockViajes as any);

      const event = mockEvent({ httpMethod: "GET" });
      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual(mockViajes);
    });

    it("debería filtrar por minibusId", async () => {
      const mockViajes = [{ id: "1", minibusId: "mb-123" }];
      mockedViajeModel.getByMinibus.mockResolvedValue(mockViajes as any);

      const event = mockEvent({
        httpMethod: "GET",
        queryStringParameters: { minibusId: "mb-123" },
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      expect(ViajeModel.getByMinibus).toHaveBeenCalledWith("mb-123");
      expect(JSON.parse(response.body)).toEqual(mockViajes);
    });
  });

  describe("GET /viajes/{id}", () => {
    it("debería retornar un viaje específico", async () => {
      const mockViaje = { id: "123", estado: "programado" };
      mockedViajeModel.get.mockResolvedValue(mockViaje as any);

      const event = mockEvent({
        httpMethod: "GET",
        pathParameters: { id: "123" },
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      expect(JSON.parse(response.body)).toEqual(mockViaje);
    });

    it("debería retornar 404 si el viaje no existe", async () => {
      mockedViajeModel.get.mockResolvedValue(null);

      const event = mockEvent({
        httpMethod: "GET",
        pathParameters: { id: "not-found" },
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(404);
      expect(JSON.parse(response.body).message).toContain("no encontrado");
    });
  });

  describe("POST /viajes", () => {
    it("debería crear un nuevo viaje", async () => {
      const newViaje = {
        rutaId: "r1",
        minibusId: "mb1",
        paradasDeRuta: ["parada1"],
      };
      const mockCreatedViaje = { id: "new-id", ...newViaje };
      mockedViajeModel.create.mockResolvedValue(mockCreatedViaje as any);

      const event = mockEvent({
        httpMethod: "POST",
        body: JSON.stringify(newViaje),
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(201);
      expect(JSON.parse(response.body)).toEqual(mockCreatedViaje);
    });

    it("debería validar campos requeridos", async () => {
      const event = mockEvent({
        httpMethod: "POST",
        body: JSON.stringify({}),
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).message).toContain("requeridos");
    });
  });

  describe("PUT /viajes/{id}", () => {
    it("debería actualizar un viaje existente", async () => {
      const updatedData = { estado: "en curso" };
      const mockUpdatedViaje = { id: "123", ...updatedData };
      mockedViajeModel.update.mockResolvedValue(mockUpdatedViaje as any);

      const event = mockEvent({
        httpMethod: "PUT",
        pathParameters: { id: "123" },
        body: JSON.stringify(updatedData),
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(200);
      expect(ViajeModel.update).toHaveBeenCalledWith("123", updatedData);
      expect(JSON.parse(response.body)).toEqual(mockUpdatedViaje);
    });

    it("debería validar paradasDeRuta como array", async () => {
      const event = mockEvent({
        httpMethod: "PUT",
        pathParameters: { id: "123" },
        body: JSON.stringify({ paradasDeRuta: "invalid" }),
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
      expect(JSON.parse(response.body).message).toContain("array");
    });
  });

  describe("DELETE /viajes/{id}", () => {
    it("debería eliminar un viaje", async () => {
      const event = mockEvent({
        httpMethod: "DELETE",
        pathParameters: { id: "123" },
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(204);
      expect(ViajeModel.delete).toHaveBeenCalledWith("123");
    });

    it("debería validar presencia de ID", async () => {
      const event = mockEvent({
        httpMethod: "DELETE",
        pathParameters: null,
      });

      const response = await handler(event);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("Manejo de errores", () => {
    it("debería manejar errores internos", async () => {
      mockedViajeModel.list.mockRejectedValue(new Error("DB Error"));

      const event = mockEvent({ httpMethod: "GET" });
      const response = await handler(event);

      expect(response.statusCode).toBe(500);
      expect(JSON.parse(response.body).message).toContain("interno");
    });

    it("debería manejar tokens inválidos", async () => {
      (jwt.verify as jest.Mock).mockImplementationOnce(() => {
        throw new Error("Invalid token");
      });

      const event = mockEvent({ httpMethod: "GET" });
      const response = await handler(event);

      expect(response.statusCode).toBe(401);
    });
  });
});
