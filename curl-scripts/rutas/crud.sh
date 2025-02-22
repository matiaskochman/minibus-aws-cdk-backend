#!/bin/bash
# Archivo: /curl-scripts/rutas.sh
# Descripción: Pruebas para el handler de rutas utilizando common.sh

source curl-scripts/common.sh

RUTAS_ENDPOINT="$API_URL/rutas"

list_rutas() {
  echo -e "${BLUE}🔹 Listando rutas...${NC}"
  local response=$(curl -s -X GET "$RUTAS_ENDPOINT" \
    -H "Authorization: Bearer $TOKEN")

  echo -e "${GREEN}📌 Respuesta de list rutas:${NC} $response"
}

create_ruta() {
  echo -e "${BLUE}🔹 Creando una nueva ruta...${NC}"
  local response=$(curl -s -X POST "$RUTAS_ENDPOINT" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
          "conductorId": "conductor_id_example",
          "paradasDeRuta": ["parada_ruta_id_1", "parada_ruta_id_2"],
          "estado": "activa"
        }')

  echo -e "${GREEN}📌 Respuesta de create ruta:${NC} $response"

  # Extraer el ID de la ruta creada
  local id=$(echo "$response" | jq -r '.id')

  if [[ "$id" != "null" && -n "$id" ]]; then
    echo -e "${GREEN}✅ Ruta creada con ID: ${id}${NC}"
    echo "$id"
  else
    echo -e "${RED}❌ Error al obtener el ID de la ruta creada.${NC}"
    exit 1
  fi
}

get_ruta() {
  local id="$1"
  echo -e "${BLUE}🔹 Obteniendo ruta con ID: ${id}...${NC}"
  local response=$(curl -s -X GET "$RUTAS_ENDPOINT/$id" \
    -H "Authorization: Bearer $TOKEN")

  echo -e "${GREEN}📌 Respuesta de get ruta:${NC} $response"
}

update_ruta() {
  local id="$1"
  echo -e "${BLUE}🔹 Actualizando ruta con ID: ${id}...${NC}"
  local response=$(curl -s -X PUT "$RUTAS_ENDPOINT/$id" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
          "estado": "inactiva",
          "paradasDeRuta": ["parada_ruta_id_1", "parada_ruta_id_3"]
        }')

  echo -e "${GREEN}📌 Respuesta de update ruta:${NC} $response"
}

delete_ruta() {
  local id="$1"
  echo -e "${BLUE}🔹 Eliminando ruta con ID: ${id}...${NC}"
  local response=$(curl -s -X DELETE "$RUTAS_ENDPOINT/$id" \
    -H "Authorization: Bearer $TOKEN")

  echo -e "${GREEN}📌 Respuesta de delete ruta:${NC} $response"
}

# 🔹 **Ejecución de pruebas**
echo -e "${YELLOW}========== PRUEBAS PARA RUTAS ==========${NC}"

login
RUTA_ID=$(create_ruta)
list_rutas

if [[ -n "$RUTA_ID" ]]; then
  get_ruta "$RUTA_ID"
  update_ruta "$RUTA_ID"
  delete_ruta "$RUTA_ID"
fi

echo -e "${YELLOW}========== FIN PRUEBAS PARA RUTAS ==========${NC}"
