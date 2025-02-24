#!/bin/bash
# Archivo: /curl-scripts/minibuses.sh
# Descripción: Pruebas para el handler de minibuses utilizando common.sh

source curl-scripts/common.sh

CONDUCTORES_ENDPOINT="$API_URL/minibuses"

list_minibuses() {
  echo -e "${BLUE}🔹 Listando minibuses...${NC}"
  local response=$(curl -s -X GET "$CONDUCTORES_ENDPOINT" \
    -H "Authorization: Bearer $TOKEN")

  echo -e "${GREEN}📌 Respuesta de list minibuses:${NC} $response"
}

create_minibus() {
  echo -e "${BLUE}🔹 Creando un nuevo minibus...${NC}"
  local response=$(curl -s -X POST "$CONDUCTORES_ENDPOINT" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "Usuario_ID": "user123",
      "Estado": "Pendiente",
      "Foto_DNI": null,
      "Foto_VTV": null,
      "Vendedor_ID": null
    }')

  echo -e "${GREEN}📌 Respuesta de create minibus:${NC} $response"

  # Extraer el ID del minibus creado
  local id=$(echo "$response" | jq -r '.id')
  
  if [[ "$id" != "null" && -n "$id" ]]; then
    echo -e "${GREEN}✅ minibus creado con ID: ${id}${NC}"
    echo "$id"
  else
    echo -e "${RED}❌ Error al obtener el ID del minibus creado.${NC}"
    exit 1
  fi
}

get_minibus() {
  local id="$1"
  echo -e "${BLUE}🔹 Obteniendo minibus con ID: ${id}...${NC}"
  local response=$(curl -s -X GET "$CONDUCTORES_ENDPOINT/$id" \
    -H "Authorization: Bearer $TOKEN")
  
  echo -e "${GREEN}📌 Respuesta de get minibus:${NC} $response"
}

update_minibus() {
  local id="$1"
  echo -e "${BLUE}🔹 Actualizando minibus con ID: ${id}...${NC}"
  local response=$(curl -s -X PUT "$CONDUCTORES_ENDPOINT/$id" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "Estado": "Aprobado",
      "Foto_DNI": "nueva_foto_dni.jpg",
      "Foto_VTV": "nueva_foto_vtv.jpg"
    }')

  echo -e "${GREEN}📌 Respuesta de update minibus:${NC} $response"
}

delete_minibus() {
  local id="$1"
  echo -e "${BLUE}🔹 Eliminando minibus con ID: ${id}...${NC}"
  local response=$(curl -s -X DELETE "$CONDUCTORES_ENDPOINT/$id" \
    -H "Authorization: Bearer $TOKEN")

  echo -e "${GREEN}📌 Respuesta de delete minibus:${NC} $response"
}

echo -e "${YELLOW}========== PRUEBAS PARA CONDUCTORES ==========${NC}"

login
CONDUCTOR_ID=$(create_minibus)
list_minibuses

if [[ -n "$CONDUCTOR_ID" ]]; then
  get_minibus "$CONDUCTOR_ID"
  update_minibus "$CONDUCTOR_ID"
  delete_minibus "$CONDUCTOR_ID"
fi

echo -e "${YELLOW}========== FIN PRUEBAS PARA CONDUCTORES ==========${NC}"
