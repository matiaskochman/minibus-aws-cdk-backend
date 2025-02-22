#!/bin/bash
# Archivo: /curl-scripts/auth.sh
# Descripción: Pruebas para el handler de autenticación utilizando common.sh

source curl-scripts/set-API-URL.sh

AUTH_ENDPOINT="$API_URL/auth"
USER_NAME="matias"
USER_EMAIL="matias@example.com"
USER_PASSWORD="password123"

# Función para registrar un usuario (opcional)
sign_up() {
  echo -e "${BLUE}🔹 Registrando usuario (sign-up)...${NC}"
  local telegram="@${USER_NAME}"
  local telefono="123456789"
  local response=$(curl -s -X POST "$AUTH_ENDPOINT/sign-up" \
    -H "Content-Type: application/json" \
    -d "{
          \"username\": \"${USER_NAME}\",
          \"email\": \"${USER_EMAIL}\",
          \"password\": \"${USER_PASSWORD}\",
          \"telegram\": \"${telegram}\",
          \"telefono\": \"${telefono}\"
        }")
  echo -e "${GREEN}📌 Respuesta de sign-up:${NC} $response"
}

# Función para iniciar sesión y obtener el JWT
login() {

  echo -e "${BLUE}🔹 Iniciando sesión para obtener JWT...${NC}"
  local response=$(curl -s -X POST "$API_URL/auth/log-in" \
    -H "Content-Type: application/json" \
    -d "{
          \"email\": \"${USER_EMAIL}\",
          \"password\": \"${USER_PASSWORD}\"
        }")
  TOKEN=$(echo "$response" | grep -o '"token":"[^"]*' | cut -d':' -f2 | tr -d '"')
  echo -e "${GREEN}📌 Respuesta de log-in:${NC} $response"
  if [ -n "$TOKEN" ]; then
    echo -e "${GREEN}🔑 Token obtenido: ${YELLOW}$TOKEN${NC}"
  else
    echo -e "${RED}❌ Error: No se obtuvo el token${NC}"
    exit 1
  fi
}


logout() {
  echo -e "${BLUE}🔹 Realizando log-out...${NC}"
  local response=$(curl -s -X POST "$AUTH_ENDPOINT/log-out" \
    -H "Content-Type: application/json")
  echo -e "${GREEN}📌 Respuesta de log-out:${NC} $response"
}


echo -e "${YELLOW}========== PRUEBAS PARA AUTH ==========${NC}"
# Realiza el login (si no se ha ejecutado ya al hacer source)
# Opcional: descomentar si se desea registrar el usuario
sign_up
login
logout
echo -e "${YELLOW}========== FIN PRUEBAS PARA AUTH ==========${NC}"
