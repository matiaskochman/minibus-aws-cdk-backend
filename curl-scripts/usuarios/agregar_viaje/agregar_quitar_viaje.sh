#!/bin/bash

# Archivo: /curl-scripts/usuarios/test-viajes-usuarios.sh
# Descripción: Crea un usuario, crea un viaje, asocia el viaje al usuario (con todos sus datos) y luego lo elimina.

source curl-scripts/common.sh

USUARIOS_ENDPOINT="$API_URL/usuarios"
VIAJES_ENDPOINT="$API_URL/viajes"

# Variables para IDs generados dinámicamente
USER_ID=""
VIAJE=""

# 🌟 1. Crear un usuario de prueba
crear_usuario() {
  echo -e "\n${YELLOW}========== CREANDO USUARIO DE PRUEBA ========== ${NC}"
  
  local payload=$(jq -n \
    --arg username "usuario_test" \
    --arg email "usuario_test@example.com" \
    --arg password "password123" \
    --arg hashedPassword "hashed_example" \
    --arg telegram "@usuario_test" \
    --arg telefono "987654321" \
    '{
      credentials: {
        username: $username,
        email: $email,
        password: $password,
        hashedPassword: $hashedPassword,
        telegram: $telegram,
        telefono: $telefono
      },
      rol: "Minibus",
      estado: "Pendiente",
      fechaCreacion: "2025-02-22T12:00:00.000Z"
    }')

  echo -e "${BLUE}🔹 Payload enviado:${NC}\n$payload\n"

  local response=$(curl -s -X POST "$USUARIOS_ENDPOINT" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$payload")

  echo -e "${GREEN}📌 Respuesta de la API:${NC}\n$(echo "$response" | jq .)\n"

  USER_ID=$(echo "$response" | jq -r '.id')

  if [[ -z "$USER_ID" || "$USER_ID" == "null" ]]; then
    echo -e "${RED}❌ Error al crear el usuario.${NC}"
    exit 1
  fi

  echo -e "${GREEN}✅ Usuario creado con ID: $USER_ID${NC}\n"
}

# 🌟 2. Crear un viaje de prueba
crear_viaje() {
  echo -e "\n${YELLOW}========== CREANDO VIAJE DE PRUEBA ========== ${NC}"
  
  local payload=$(jq -n \
    --arg rutaId "ruta-55555" \
    --arg fecha "2025-02-25T08:00:00Z" \
    --arg minibusId "minibus-1" \
    '{
      rutaId: $rutaId,
      fecha: $fecha,
      minibusId: $minibusId,
      estado: "programado",
      descripcion: "Viaje de prueba",
      reventaActivada: false,
      descuento: 0,
      paradasDeRuta: [
        {
          id: "parada-001",
          parada: {
            id: "parada-001",
            nombre: "Parada A",
            direccion: "Calle 1"
          },
          posicion: 1,
          horario: "08:00"
        },
        {
          id: "parada-002",
          parada: {
            id: "parada-002",
            nombre: "Parada B",
            direccion: "Calle 2"
          },
          posicion: 2,
          horario: "09:00"
        }
      ]
    }')

  echo -e "${BLUE}🔹 Payload enviado:${NC}\n$payload\n"

  local response=$(curl -s -X POST "$VIAJES_ENDPOINT" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$payload")

  echo -e "${GREEN}📌 Respuesta de la API:${NC}\n$(echo "$response" | jq .)\n"

  VIAJE=$(echo "$response" | jq '.')

  if [[ -z "$VIAJE" || "$VIAJE" == "null" ]]; then
    echo -e "${RED}❌ Error al crear el viaje.${NC}"
    exit 1
  fi

  echo -e "${GREEN}✅ Viaje creado con ID: $(echo "$VIAJE" | jq -r '.id')${NC}\n"
}

# 🌟 3. Agregar el viaje completo al usuario
agregar_viaje_a_usuario() {
  echo -e "\n${YELLOW}========== AGREGANDO VIAJE AL USUARIO ========== ${NC}"

  local payload=$(jq -n \
    --argjson viaje "$VIAJE" \
    '{
      action: "add",
      viaje: $viaje
    }')

  echo -e "${BLUE}🔹 Payload enviado:${NC}\n$payload\n"

  local response=$(curl -s -X PUT "$USUARIOS_ENDPOINT/$USER_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$payload")

  echo -e "${GREEN}📌 Respuesta de la API:${NC}\n$(echo "$response" | jq .)\n"
}

# 🌟 4. Quitar el viaje del usuario
quitar_viaje_de_usuario() {
  echo -e "\n${YELLOW}========== QUITANDO VIAJE DEL USUARIO ========== ${NC}"

  local viajeId=$(echo "$VIAJE" | jq -r '.id')

  local payload=$(jq -n \
    --arg viajeId "$viajeId" \
    '{
      action: "remove",
      viajeId: $viajeId
    }')

  echo -e "${BLUE}🔹 Payload enviado:${NC}\n$payload\n"

  local response=$(curl -s -X PUT "$USUARIOS_ENDPOINT/$USER_ID" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "$payload")

  echo -e "${GREEN}📌 Respuesta de la API:${NC}\n$(echo "$response" | jq .)\n"
}

# 🔹 Ejecutar los pasos en orden
crear_usuario
crear_viaje
agregar_viaje_a_usuario
quitar_viaje_de_usuario

echo -e "\n${YELLOW}✅ Pruebas completadas exitosamente.${NC}\n"
