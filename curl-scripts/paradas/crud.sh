#!/bin/bash
# Archivo: /curl-scripts/paradas.sh
# Descripción: Pruebas para el handler de paradas utilizando common.sh

source curl-scripts/common.sh

PARADAS_ENDPOINT="$API_URL/paradas"

list_paradas() {
  echo -e "${BLUE}🔹 Listando paradas...${NC}"
  local response=$(curl -s -X GET "$PARADAS_ENDPOINT" \
    -H "Authorization: Bearer $TOKEN")

  echo -e "${GREEN}📌 Respuesta de list paradas:${NC}"
  echo "$response" | jq .
  echo ""

}

create_parada() {
  echo -e "${BLUE}🔹 Creando una nueva parada...${NC}"
  local response=$(curl -s -X POST "$PARADAS_ENDPOINT" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
          "nombre": "Parada 1",
          "descripcion": "Parada principal",
          "calle": "Av. Principal",
          "numero": "123",
          "localidad": "Ciudad",
          "codigoPostal": "1000",
          "partido": "Partido",
          "provincia": "Provincia"
        }')

  echo -e "${GREEN}📌 Respuesta de create parada:${NC}"
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

get_parada() {
  local id="$1"
  echo -e "${BLUE}🔹 Obteniendo parada con ID: ${id}...${NC}"
  local response=$(curl -s -X GET "$PARADAS_ENDPOINT/$id" \
    -H "Authorization: Bearer $TOKEN")

  echo -e "${GREEN}📌 Respuesta de get parada:${NC}"
  echo "$response" | jq .
  echo ""

}

update_parada() {
  local id="$1"
  echo -e "${BLUE}🔹 Actualizando parada con ID: ${id}...${NC}"
  local response=$(curl -s -X PUT "$PARADAS_ENDPOINT/$id" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
          "descripcion": "Descripción actualizada",
          "calle": "Av. Secundaria",
          "numero": "456"
        }')

  echo -e "${GREEN}📌 Respuesta de update parada:${NC}"
  echo "$response" | jq .
  echo ""

}

delete_parada() {
  local id="$1"
  echo -e "${BLUE}🔹 Eliminando parada con ID: ${id}...${NC}"
  local response=$(curl -s -X DELETE "$PARADAS_ENDPOINT/$id" \
    -H "Authorization: Bearer $TOKEN")

  echo -e "${GREEN}📌 Respuesta de delete parada:${NC}"
  echo "$response" | jq .
  echo ""

}

# 🔹 **Ejecución de pruebas**
echo -e "${YELLOW}========== PRUEBAS PARA PARADAS ==========${NC}"

login
PARADA_ID=$(create_parada)
list_paradas

if [[ -n "$PARADA_ID" ]]; then
  get_parada "$PARADA_ID"
  update_parada "$PARADA_ID"
  delete_parada "$PARADA_ID"
fi

echo -e "${YELLOW}========== FIN PRUEBAS PARA PARADAS ==========${NC}"
