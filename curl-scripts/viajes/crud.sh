#!/bin/bash
# Archivo: /curl-scripts/viajes.sh
# Descripción: Pruebas para el handler de viajes utilizando common.sh

source curl-scripts/common.sh

VIAJES_ENDPOINT="$API_URL/viajes"

create_viaje() {
  echo -e "${BLUE}🔹 Creando un nuevo viaje...${NC}"
  local response=$(curl -s -X POST "$VIAJES_ENDPOINT" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
          "rutaId": "ruta_id_example",
          "minibusId": "minibus_id_example",
          "paradasDeRuta": ["parada_ruta_id_1", "parada_ruta_id_2"],
          "estado": "programado"
        }')

  echo -e "${GREEN}📌 Respuesta de create viaje:${NC}"
  echo "$response" | jq .
  echo ""


  # Extraer el ID del viaje creado
  local id=$(echo "$response" | jq -r '.id')

  if [[ "$id" != "null" && -n "$id" ]]; then
    echo -e "${GREEN}✅ Viaje creado con ID: ${id}${NC}"
    echo "$id"
  else
    echo -e "${RED}❌ Error al obtener el ID del viaje creado.${NC}"
    exit 1
  fi
}

list_viajes() {
  echo -e "${BLUE}🔹 Listando todos los viajes...${NC}"
  local response=$(curl -s -X GET "$VIAJES_ENDPOINT" \
    -H "Authorization: Bearer $TOKEN")
  echo -e "${GREEN}📌 Respuesta de list viajes:${NC}"
  echo "$response" | jq .
  echo ""

}



get_viaje() {
  local id="$1"
  echo -e "${BLUE}🔹 Obteniendo viaje con ID: ${id}...${NC}"
  local response=$(curl -s -X GET "$VIAJES_ENDPOINT/$id" \
    -H "Authorization: Bearer $TOKEN")
  echo -e "${GREEN}📌 Respuesta de get viaje:${NC}"
  echo "$response" | jq .
  echo ""

}

update_viaje() {
  local id="$1"
  echo -e "${BLUE}🔹 Actualizando viaje con ID: ${id}...${NC}"
  local response=$(curl -s -X PUT "$VIAJES_ENDPOINT/$id" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"estado": "en curso"}')
  echo -e "${GREEN}📌 Respuesta de update viaje:${NC}"
  echo "$response" | jq .
  echo ""

}

delete_viaje() {
  local id="$1"
  echo -e "${BLUE}🔹 Eliminando viaje con ID: ${id}...${NC}"
  local response=$(curl -s -X DELETE "$VIAJES_ENDPOINT/$id" \
    -H "Authorization: Bearer $TOKEN")
  echo -e "${GREEN}📌 Respuesta de delete viaje:${NC}"
  echo "$response" | jq .
  echo ""

}

get_viajes_por_minibus() {
  local minibus_id="$1"
  echo -e "${BLUE}🔹 Obteniendo viajes por minibus (ID: ${minibus_id})...${NC}"
  local response=$(curl -s -X GET "$VIAJES_ENDPOINT?minibusId=${minibus_id}" \
    -H "Authorization: Bearer $TOKEN")
  echo -e "${GREEN}📌 Respuesta de viajes por minibus:${NC}"
  echo "$response" | jq .
  echo ""

}

get_viajes_por_ruta() {
  local ruta_id="$1"
  echo -e "${BLUE}🔹 Obteniendo viajes por ruta (ID: ${ruta_id})...${NC}"
  local response=$(curl -s -X GET "$VIAJES_ENDPOINT?rutaId=${ruta_id}" \
    -H "Authorization: Bearer $TOKEN")
  echo -e "${GREEN}📌 Respuesta de viajes por ruta:${NC}"
  echo "$response" | jq .
  echo ""

}

# 🔹 **Ejecución de pruebas**
echo -e "${YELLOW}========== PRUEBAS PARA VIAJES ==========${NC}"

# Evitar login duplicado
if [[ -z "$TOKEN" ]]; then
  login
fi

# Crear un viaje y almacenar el ID
VIAJE_ID=$(create_viaje)

# Listar viajes después de crear uno


# Verificar si el ID del viaje fue obtenido correctamente antes de continuar
if [[ -n "$VIAJE_ID" ]]; then
  get_viaje "$VIAJE_ID"
  update_viaje "$VIAJE_ID"
  delete_viaje "$VIAJE_ID"
fi

get_viajes_por_minibus "minibus_id_example"
get_viajes_por_ruta "ruta_id_example"

list_viajes

echo -e "${YELLOW}========== FIN PRUEBAS PARA VIAJES ==========${NC}"
