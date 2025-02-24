#!/bin/bash
# Archivo: /curl-scripts/usuarios.sh
# Descripción: Pruebas para el handler de usuarios utilizando common.sh

source curl-scripts/common.sh
# source curl-scripts/set-API-URL.sh

USUARIOS_ENDPOINT="$API_URL/usuarios"

list_usuarios() {
  # echo "${BLUE}🔹 Listando usuarios...${NC}"
  echo "token: ${TOKEN}"
  local response=$(curl -s -X GET "$USUARIOS_ENDPOINT" \
    -H "Authorization: Bearer $TOKEN")
  echo -e "${GREEN}📌 Respuesta de list usuarios:${NC}"
  echo "$response" | jq .
  echo ""

}

create_usuario() {
  echo -e "${BLUE}🔹 Creando un nuevo usuario...${NC}"
  local response=$(curl -s -X POST "$USUARIOS_ENDPOINT" \
    -H "Content-Type: application/json" \
    -d '{
          "credentials": {
            "username": "jane_doe",
            "email": "jane@example.com",
            "password": "password456",
            "hashedPassword": "hashed_example",
            "telegram": "@jane_doe",
            "telefono": "987654321"
          },
          "rol": "Minibus",
          "estado": "Pendiente",
          "fechaCreacion": "2025-02-22T12:00:00.000Z"
        }')
  echo -e "${GREEN}📌 Respuesta de create usuario:${NC}"
  echo "$response" | jq .
  echo ""

}

get_usuario() {
  local id="$1"
  echo -e "${BLUE}🔹 Obteniendo usuario con ID: ${id}...${NC}"
  local response=$(curl -s -X GET "$USUARIOS_ENDPOINT/$id" \
    -H "Authorization: Bearer $TOKEN")
  echo -e "${GREEN}📌 Respuesta de get usuario:${NC}"
  echo "$response" | jq .
  echo ""

}

update_usuario() {
  local id="$1"
  echo -e "${BLUE}🔹 Actualizando usuario con ID: ${id}...${NC}"
  local response=$(curl -s -X PUT "$USUARIOS_ENDPOINT/$id" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"estado": "Activo"}')
  echo -e "${GREEN}📌 Respuesta de update usuario:${NC}"
  echo "$response" | jq .
  echo ""
  
}

delete_usuario() {
  local id="$1"
  echo -e "${BLUE}🔹 Eliminando usuario con ID: ${id}...${NC}"
  local response=$(curl -s -X DELETE "$USUARIOS_ENDPOINT/$id" \
    -H "Authorization: Bearer $TOKEN")
  echo -e "${GREEN}📌 Respuesta de delete usuario:${NC}"
  echo "$response" | jq .
  echo ""

}

echo -e "${YELLOW}========== PRUEBAS PARA USUARIOS ==========${NC}"

login
create_usuario
list_usuarios
USUARIO_ID="usuario_id_example"  # Reemplaza con un ID real
get_usuario "$USUARIO_ID"
update_usuario "$USUARIO_ID"
delete_usuario "$USUARIO_ID"
echo -e "${YELLOW}========== FIN PRUEBAS PARA USUARIOS ==========${NC}"
