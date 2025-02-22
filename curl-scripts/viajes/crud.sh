#!/bin/bash
# Archivo: /curl-scripts/viajes.sh
# Descripción: Pruebas para el handler de viajes utilizando common.sh

source curl-scripts/common.sh

VIAJES_ENDPOINT="$API_URL/viajes"

list_viajes() {
  echo -e "${BLUE}🔹 Listando todos los viajes...${NC}"
  local response=$(curl -s -X GET "$VIAJES_ENDPOINT" \
    -H "Authorization: Bearer $TOKEN")
  echo -e "${GREEN}📌 Respuesta de list viajes:${NC} $response"
}

create_viaje() {
  echo -e "${BLUE}🔹 Creando un nuevo viaje...${NC}"
  local response=$(curl -s -X POST "$VIAJES_ENDPOINT" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
          "rutaId": "ruta_id_example",
          "conductorId": "conductor_id_example",
          "paradasDeRuta": ["parada_ruta_id_1", "parada_ruta_id_2"],
          "estado": "programado"
        }')
  echo -e "${GREEN}📌 Respuesta de create viaje:${NC} $response"
}

get_viaje() {
  local id="$1"
  echo -e "${BLUE}🔹 Obteniendo viaje con ID: ${id}...${NC}"
  local response=$(curl -s -X GET "$VIAJES_ENDPOINT/$id" \
    -H "Authorization: Bearer $TOKEN")
  echo -e "${GREEN}📌 Respuesta de get viaje:${NC} $response"
}

update_viaje() {
  local id="$1"
  echo -e "${BLUE}🔹 Actualizando viaje con ID: ${id}...${NC}"
  local response=$(curl -s -X PUT "$VIAJES_ENDPOINT/$id" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"estado": "en curso"}')
  echo -e "${GREEN}📌 Respuesta de update viaje:${NC} $response"
}

delete_viaje() {
  local id="$1"
  echo -e "${BLUE}🔹 Eliminando viaje con ID: ${id}...${NC}"
  local response=$(curl -s -X DELETE "$VIAJES_ENDPOINT/$id" \
    -H "Authorization: Bearer $TOKEN")
  echo -e "${GREEN}📌 Respuesta de delete viaje:${NC} $response"
}

get_viajes_por_conductor() {
  local conductor_id="$1"
  echo -e "${BLUE}🔹 Obteniendo viajes por conductor (ID: ${conductor_id})...${NC}"
  local response=$(curl -s -X GET "$VIAJES_ENDPOINT?conductorId=${conductor_id}" \
    -H "Authorization: Bearer $TOKEN")
  echo -e "${GREEN}📌 Respuesta de viajes por conductor:${NC} $response"
}

get_viajes_por_ruta() {
  local ruta_id="$1"
  echo -e "${BLUE}🔹 Obteniendo viajes por ruta (ID: ${ruta_id})...${NC}"
  local response=$(curl -s -X GET "$VIAJES_ENDPOINT?rutaId=${ruta_id}" \
    -H "Authorization: Bearer $TOKEN")
  echo -e "${GREEN}📌 Respuesta de viajes por ruta:${NC} $response"
}

echo -e "${YELLOW}========== PRUEBAS PARA VIAJES ==========${NC}"
login
create_viaje
list_viajes
VIAJE_ID="viaje_id_example"  # Reemplaza con un ID real
get_viaje "$VIAJE_ID"
update_viaje "$VIAJE_ID"
delete_viaje "$VIAJE_ID"
get_viajes_por_conductor "conductor_id_example"
get_viajes_por_ruta "ruta_id_example"
echo -e "${YELLOW}========== FIN PRUEBAS PARA VIAJES ==========${NC}"
