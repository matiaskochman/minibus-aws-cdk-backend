#!/bin/bash
# Archivo: /curl-scripts/paradasDeRuta.sh
# Descripción: Pruebas para el handler de paradas de ruta utilizando common.sh

source curl-scripts/common.sh

PARADAS_DE_RUTA_ENDPOINT="$API_URL/paradasDeRuta"

list_paradas_de_ruta() {
  echo -e "${BLUE}🔹 Listando paradas de ruta...${NC}"
  local response=$(curl -s -X GET "$PARADAS_DE_RUTA_ENDPOINT" \
    -H "Authorization: Bearer $TOKEN")
  echo -e "${GREEN}📌 Respuesta de list paradas de ruta:${NC}"
  echo "$response" | jq .
  echo ""
}

create_parada_de_ruta() {
  echo -e "${BLUE}🔹 Creando una nueva parada de ruta...${NC}"
  local response=$(curl -s -X POST "$PARADAS_DE_RUTA_ENDPOINT" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
          "parada": "parada_id_example",
          "posicion": 1,
          "horario": "08:00"
        }')

  echo -e "${GREEN}📌 Respuesta de create parada de ruta:${NC}"
  echo "$response" | jq .
  echo ""

  # Extraer el ID de la parada creada
  local id=$(echo "$response" | jq -r '.id')

  if [[ "$id" != "null" && -n "$id" ]]; then
    echo -e "${GREEN}✅ Parada creada con ID: ${id}${NC}"
    echo "$id"
  else
    echo -e "${RED}❌ Error al obtener el ID de la parada creada.${NC}"
    exit 1
  fi
}

get_parada_de_ruta() {
  local id="$1"
  echo -e "${BLUE}🔹 Obteniendo parada de ruta con ID: ${id}...${NC}"
  local response=$(curl -s -X GET "$PARADAS_DE_RUTA_ENDPOINT/$id" \
    -H "Authorization: Bearer $TOKEN")
  echo -e "${GREEN}📌 Respuesta de get parada de ruta:${NC}"
  echo "$response" | jq .
  echo ""

}

update_parada_de_ruta() {
  local id="$1"
  echo -e "${BLUE}🔹 Actualizando parada de ruta con ID: ${id}...${NC}"
  local response=$(curl -s -X PUT "$PARADAS_DE_RUTA_ENDPOINT/$id" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
          "posicion": 2,
          "horario": "08:15"
        }')

  echo -e "${GREEN}📌 Respuesta de update parada de ruta:${NC}"
  echo "$response" | jq .
  echo ""
}

delete_parada_de_ruta() {
  local id="$1"
  echo -e "${BLUE}🔹 Eliminando parada de ruta con ID: ${id}...${NC}"
  local response=$(curl -s -X DELETE "$PARADAS_DE_RUTA_ENDPOINT/$id" \
    -H "Authorization: Bearer $TOKEN")

  echo -e "${GREEN}📌 Respuesta de delete parada de ruta:${NC}"
  echo "$response" | jq .
  echo ""

}

echo -e "${YELLOW}========== PRUEBAS PARA PARADAS DE RUTA ==========${NC}"

login
PR_ID=$(create_parada_de_ruta)
list_paradas_de_ruta

if [[ -n "$PR_ID" ]]; then
  get_parada_de_ruta "$PR_ID"
  update_parada_de_ruta "$PR_ID"
  delete_parada_de_ruta "$PR_ID"
fi

echo -e "${YELLOW}========== FIN PRUEBAS PARA PARADAS DE RUTA ==========${NC}"
