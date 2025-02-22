// File: /Users/matiaskochman/dev/personal/vercel_ex/minibus-backend-aws-cdk/src/handlers/auth.ts
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { createUser, listUsers } from "../models/userModel";
const bcrypt = require("bcryptjs");
import * as jwt from "jsonwebtoken";

// Se espera que el nombre de la tabla se configure en el entorno (ver userModel.ts)
const USERS_TABLE = process.env.USERS_TABLE || "Users";
// Se debe definir una variable de entorno JWT_SECRET para firmar los tokens
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // Suponemos rutas del tipo: /auth/sign-up, /auth/log-in, /auth/log-out
  const path = event.path.toLowerCase();

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Método no permitido" }),
    };
  }

  try {
    if (path.endsWith("sign-up")) {
      // Registro de usuario (Sign Up)
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

      // Verificamos si ya existe un usuario con el mismo email o username
      const users = await listUsers();
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

      // Hasheamos la contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      // Creamos el nuevo usuario. Nota: no se almacena la contraseña en claro.
      const newUser = await createUser({
        credentials: {
          username,
          email,
          password: "", // se omite la contraseña en claro
          hashedPassword,
          telegram: telegram || "",
          telefono: telefono || "",
        },
        rol: "Conductor", // o el rol por defecto que requieras
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
      // Inicio de sesión (Log In)
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
      // Buscamos el usuario por email
      const users = await listUsers();
      const user = users.find(
        (u) => u.credentials.email.toLowerCase() === email.toLowerCase()
      );
      if (!user) {
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Credenciales inválidas" }),
        };
      }
      // Comparamos la contraseña ingresada con la almacenada (hasheada)
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
      // Generamos un token JWT (válido por 1 hora, por ejemplo)
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
      // Cierre de sesión (Log Out)
      // En un sistema basado en JWT y autenticación stateless, la "desconexión"
      // se suele manejar en el cliente eliminando el token. Aquí se retorna un mensaje.
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
