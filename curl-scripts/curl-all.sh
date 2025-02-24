#!/bin/bash
# Archivo: /curl-scripts/curl-all.sh
# Descripción: Ejecuta todas las pruebas de los scripts que dependen de common.sh

# source curl-scripts/common.sh

echo -e "${YELLOW}========== EJECUTANDO TODAS LAS PRUEBAS ==========${NC}"

# Ejecutar pruebas en cada módulo
echo -e "\n${BLUE}🔹 Ejecutando pruebas de autenticación...${NC}"
bash curl-scripts/auth/auth.sh

echo -e "\n${BLUE}🔹 Ejecutando pruebas de minibuses...${NC}"
bash curl-scripts/minibuses/crud.sh

echo -e "\n${BLUE}🔹 Ejecutando pruebas de paradas...${NC}"
bash curl-scripts/paradas/crud.sh

echo -e "\n${BLUE}🔹 Ejecutando pruebas de paradas de ruta...${NC}"
bash curl-scripts/parada-de-ruta/crud.sh

echo -e "\n${BLUE}🔹 Ejecutando pruebas de rutas...${NC}"
bash curl-scripts/rutas/crud.sh

echo -e "\n${BLUE}🔹 Ejecutando pruebas de viajes...${NC}"
bash curl-scripts/viajes/crud.sh

echo -e "\n${BLUE}🔹 Ejecutando pruebas de usuarios...${NC}"
bash curl-scripts/usuarios/crud.sh

echo -e "${YELLOW}========== FIN DE TODAS LAS PRUEBAS ==========${NC}"
