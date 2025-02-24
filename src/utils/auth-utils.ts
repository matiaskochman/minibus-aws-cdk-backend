// File: /src/lib/auth-utils.ts
import * as jwt from "jsonwebtoken";

export const getTokenFromHeaders = (headers: any): string | null => {
  const authHeader = headers?.Authorization || headers?.authorization;
  if (!authHeader) return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2) return null;
  return parts[1];
};

export const verifyToken = (token: string): any => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET no está definido");
  }
  // Devuelve el payload si el token es válido o lanza un error si no lo es
  return jwt.verify(token, secret);
};

export const unauthorizedResponse = (message: string) => ({
  statusCode: 401,
  body: JSON.stringify({ message: `No autorizado: ${message}` }),
});

export const handleJWTError = (err: any) => {
  if (
    err instanceof jwt.JsonWebTokenError ||
    err instanceof jwt.TokenExpiredError
  ) {
    return unauthorizedResponse("token inválido");
  }
  throw err;
};
