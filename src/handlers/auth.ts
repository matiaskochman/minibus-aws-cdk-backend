import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import UserModel from "../models/userModel";
const bcrypt = require("bcryptjs");
import * as jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const path = event.path.toLowerCase();

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Método no permitido" }),
    };
  }

  try {
    if (path.endsWith("sign-up")) {
      if (!event.body) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Cuerpo de solicitud faltante" }),
        };
      }

      const data = JSON.parse(event.body);
      const { username, email, password, telegram, telefono } = data;

      if (!username || !email || !password) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Faltan campos obligatorios" }),
        };
      }

      const users = await UserModel.list();
      const existingUser = users.find(
        (u) =>
          u.credentials.email.toLowerCase() === email.toLowerCase() ||
          u.credentials.username.toLowerCase() === username.toLowerCase()
      );

      if (existingUser) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "El usuario ya existe" }),
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = await UserModel.create({
        credentials: {
          username,
          email,
          password: "",
          hashedPassword,
          telegram: telegram || "",
          telefono: telefono || "",
        },
        rol: "Minibus",
        estado: "Pendiente",
        fechaCreacion: new Date().toISOString(),
      });

      return {
        statusCode: 201,
        body: JSON.stringify({
          message: "Usuario creado exitosamente",
          user: newUser,
        }),
      };
    } else if (path.endsWith("log-in")) {
      if (!event.body) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Cuerpo de solicitud faltante" }),
        };
      }

      const data = JSON.parse(event.body);
      const { email, password } = data;

      if (!email || !password) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Faltan campos obligatorios" }),
        };
      }

      const users = await UserModel.list();
      const user = users.find(
        (u) => u.credentials.email.toLowerCase() === email.toLowerCase()
      );

      if (!user) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Credenciales inválidas" }),
        };
      }

      const validPassword = await bcrypt.compare(
        password,
        user.credentials.hashedPassword
      );
      if (!validPassword) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Credenciales inválidas" }),
        };
      }

      const token = jwt.sign(
        { id: user.id, email: user.credentials.email, rol: user.rol },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Log in exitoso", token }),
      };
    } else if (path.endsWith("log-out")) {
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Log out exitoso" }),
      };
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Ruta no encontrada" }),
      };
    }
  } catch (error: any) {
    console.error("Error en auth handler:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error interno", error: error.message }),
    };
  }
};
