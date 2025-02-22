#!/bin/bash
# Archivo: /curl-scripts/conductores.sh
# Descripción: Pruebas para el handler de conductores utilizando common.sh

source curl-scripts/common.sh

CONDUCTORES_ENDPOINT="$API_URL/conductores"

list_conductores() {
  echo -e "${BLUE}🔹 Listando conductores...${NC}"
  local response=$(curl -s -X GET "$CONDUCTORES_ENDPOINT" \
    -H "Authorization: Bearer $TOKEN")

  echo -e "${GREEN}📌 Respuesta de list conductores:${NC} $response"
}

create_conductor() {
  echo -e "${BLUE}🔹 Creando un nuevo conductor...${NC}"
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

  echo -e "${GREEN}📌 Respuesta de create conductor:${NC} $response"

  # Extraer el ID del conductor creado
  local id=$(echo "$response" | jq -r '.id')
  
  if [[ "$id" != "null" && -n "$id" ]]; then
    echo -e "${GREEN}✅ Conductor creado con ID: ${id}${NC}"
    echo "$id"
  else
    echo -e "${RED}❌ Error al obtener el ID del conductor creado.${NC}"
    exit 1
  fi
}

get_conductor() {
  local id="$1"
  echo -e "${BLUE}🔹 Obteniendo conductor con ID: ${id}...${NC}"
  local response=$(curl -s -X GET "$CONDUCTORES_ENDPOINT/$id" \
    -H "Authorization: Bearer $TOKEN")
  
  echo -e "${GREEN}📌 Respuesta de get conductor:${NC} $response"
}

update_conductor() {
  local id="$1"
  echo -e "${BLUE}🔹 Actualizando conductor con ID: ${id}...${NC}"
  local response=$(curl -s -X PUT "$CONDUCTORES_ENDPOINT/$id" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d '{
      "Estado": "Aprobado",
      "Foto_DNI": "nueva_foto_dni.jpg",
      "Foto_VTV": "nueva_foto_vtv.jpg"
    }')

  echo -e "${GREEN}📌 Respuesta de update conductor:${NC} $response"
}

delete_conductor() {
  local id="$1"
  echo -e "${BLUE}🔹 Eliminando conductor con ID: ${id}...${NC}"
  local response=$(curl -s -X DELETE "$CONDUCTORES_ENDPOINT/$id" \
    -H "Authorization: Bearer $TOKEN")

  echo -e "${GREEN}📌 Respuesta de delete conductor:${NC} $response"
}

echo -e "${YELLOW}========== PRUEBAS PARA CONDUCTORES ==========${NC}"

login
CONDUCTOR_ID=$(create_conductor)
list_conductores

if [[ -n "$CONDUCTOR_ID" ]]; then
  get_conductor "$CONDUCTOR_ID"
  update_conductor "$CONDUCTOR_ID"
  delete_conductor "$CONDUCTOR_ID"
fi

echo -e "${YELLOW}========== FIN PRUEBAS PARA CONDUCTORES ==========${NC}"
