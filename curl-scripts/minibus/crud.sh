#!/bin/bash
# Archivo: /curl-scripts/minibuses.sh
# Descripción: Pruebas para el handler de minibuses utilizando common.sh

source curl-scripts/common.sh

MINIBUS_ENDPOINT="$API_URL/minibuses"

list_minibuses() {
  echo -e "${BLUE}🔹 Listando minibuses...${NC}"
  local response=$(curl -s -X GET "$MINIBUS_ENDPOINT" \
    -H "Authorization: Bearer $TOKEN")

  echo -e "${GREEN}📌 Respuesta de list minibuses:${NC}"
  echo "$response" | jq .
  echo ""
}

create_minibus() {
  echo -e "${BLUE}🔹 Creando un nuevo minibus...${NC}"
  local response=$(curl -s -X POST "$MINIBUS_ENDPOINT" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "Usuario_ID": "user123",
      "Estado": "Pendiente",
      "Foto_DNI": null,
      "Foto_VTV": null,
      "Vendedor_ID": null
    }')

  echo -e "${GREEN}📌 Respuesta de create minibus:${NC}"
  echo "$response" | jq .
  echo ""

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
  local response=$(curl -s -X GET "$MINIBUS_ENDPOINT/$id" \
    -H "Authorization: Bearer $TOKEN")
  
  echo -e "${GREEN}📌 Respuesta de get minibus:${NC}"
  echo "$response" | jq .
  echo "" 
}

update_minibus() {
  local id="$1"
  echo -e "${BLUE}🔹 Actualizando minibus con ID: ${id}...${NC}"
  local response=$(curl -s -X PUT "$MINIBUS_ENDPOINT/$id" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "Estado": "Aprobado",
      "Foto_DNI": "nueva_foto_dni.jpg",
      "Foto_VTV": "nueva_foto_vtv.jpg"
    }')

  echo -e "${GREEN}📌 Respuesta de update minibus:${NC}"
  echo "$response" | jq .
  echo ""

}

delete_minibus() {
  local id="$1"
  echo -e "${BLUE}🔹 Eliminando minibus con ID: ${id}...${NC}"
  local response=$(curl -s -X DELETE "$MINIBUS_ENDPOINT/$id" \
    -H "Authorization: Bearer $TOKEN")

  echo -e "${GREEN}📌 Respuesta de delete minibus:${NC}"
  echo "$response" | jq .
  echo ""

}

echo -e "${YELLOW}========== PRUEBAS PARA MINIBUSES ==========${NC}"

login
# create_minibus
CONDUCTOR_ID=$(create_minibus)
list_minibuses

if [[ -n "$CONDUCTOR_ID" ]]; then
  get_minibus "$CONDUCTOR_ID"
  update_minibus "$CONDUCTOR_ID"
  delete_minibus "$CONDUCTOR_ID"
fi

echo -e "${YELLOW}========== FIN PRUEBAS PARA MINIBUSES ==========${NC}"
