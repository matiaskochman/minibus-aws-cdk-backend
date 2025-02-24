#!/bin/bash
# Archivo: /curl-scripts/common.sh
# Descripción: Funciones comunes para autenticación y logging

# Colores para mejorar la visibilidad de los logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin color

# Cargar la URL base
source curl-scripts/set-API-URL.sh

# Variables globales para autenticación
TOKEN=""
# Variables para usuario (se usan para sign_up y login)
USER_EMAIL="matias@example.com"
USER_PASSWORD="password123"
USER_NAME="matias"

# Función para iniciar sesión y obtener el JWT
login() {
  echo -e "${BLUE}🔹 Iniciando sesión para obtener JWT...${NC}"
  local response=$(curl -s -X POST "$API_URL/auth/log-in" \
    -H "Content-Type: application/json" \
    -d "{
          \"email\": \"${USER_EMAIL}\",
          \"password\": \"${USER_PASSWORD}\"
        }")

  echo -e "${GREEN}📌 Respuesta de log-in:${NC} $response"

  # Extraer el token de la respuesta
  TOKEN=$(echo "$response" | grep -o '"token":"[^"]*' | cut -d':' -f2 | tr -d '"')

  if [[ -n "$TOKEN" ]]; then
    echo -e "${GREEN}🔑 Token obtenido: ${YELLOW}$TOKEN${NC}"
  else
    echo -e "${RED}⚠️ No se obtuvo el token. Intentando registrarse...${NC}"
    sign_up
  fi
}

# Función para registrar un usuario y luego hacer login
sign_up() {
  echo -e "${BLUE}🔹 Registrando usuario (sign-up)...${NC}"
  local telegram="@${USER_NAME}"
  local telefono="123456789"
  
  local response=$(curl -s -X POST "$API_URL/auth/sign-up" \
    -H "Content-Type: application/json" \
    -d "{
          \"username\": \"${USER_NAME}\",
          \"email\": \"${USER_EMAIL}\",
          \"password\": \"${USER_PASSWORD}\",
          \"telegram\": \"${telegram}\",
          \"telefono\": \"${telefono}\"
        }")

  echo -e "${GREEN}📌 Respuesta de sign-up:${NC} $response"

  # Verificar si la respuesta indica que el usuario fue creado
  local success=$(echo "$response" | grep -o '"message":"Usuario creado exitosamente"')

  if [[ -n "$success" ]]; then
    echo -e "${GREEN}✅ Usuario registrado exitosamente. Procediendo con login...${NC}"
    login  # Ejecutar login después del registro
  else
    echo -e "${RED}❌ Error al registrar usuario.${NC}"
    exit 1
  fi
}

# Ejecutar login al cargar el script
# login
