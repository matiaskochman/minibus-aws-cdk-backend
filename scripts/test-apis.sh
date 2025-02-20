#!/bin/bash

# Definir la URL base de la API
API_URL="https://5oafsilfoy.execute-api.localhost.localstack.cloud:4566/dev/"

# Función para probar conductores
test_conductores() {
    echo -e "\nProbando POST /conductores"
    CONDUCTOR_RESPONSE=$(curl -s -X POST "$API_URL/conductores" \
        -H "Content-Type: application/json" \
        -d '{
            "Usuario_ID": "12345",
            "Foto_DNI": "url_foto_dni",
            "Foto_VTV": "url_foto_vtv",
            "Estado": "Pendiente"
        }')

    echo "Respuesta: $CONDUCTOR_RESPONSE"

    # Extraer ID del conductor
    CONDUCTOR_ID=$(echo "$CONDUCTOR_RESPONSE" | jq -r '.id')

    echo ""
    echo ""
    echo -e "\nProbando GET /conductores/$CONDUCTOR_ID"
    curl -s -X GET "$API_URL/conductores/$CONDUCTOR_ID"
    echo ""
    echo ""
    
    echo "ID del conductor creado: $CONDUCTOR_ID"
    echo ""
    echo ""
    echo -e "\nProbando GET /conductores"
    curl -s -X GET "$API_URL/conductores"
    echo ""
    echo ""


    echo -e "\nProbando PUT /conductores/$CONDUCTOR_ID"
    curl -s -X PUT "$API_URL/conductores/$CONDUCTOR_ID" \
        -H "Content-Type: application/json" \
        -d '{
            "Estado": "Aprobado"
        }'
    echo ""
    echo ""

    echo -e "\nProbando DELETE /conductores/$CONDUCTOR_ID"
    curl -s -X DELETE "$API_URL/conductores/$CONDUCTOR_ID"
}

# Función para probar rutas
test_rutas() {
    echo ""
    echo ""

    echo -e "\nProbando POST /rutas"
    RUTA_RESPONSE=$(curl -s -X POST "$API_URL/rutas" \
        -H "Content-Type: application/json" \
        -d '{
            "conductorId": "12345",
            "origen": "Buenos Aires",
            "destino": "Córdoba",
            "horarios": ["08:00", "14:00"],
            "tarifa": 5000,
            "asientosDisponibles": 15,
            "estado": "activa"
        }')

    echo "Respuesta: $RUTA_RESPONSE"
    echo ""
    echo ""

    # Extraer ID de la ruta
    RUTA_ID=$(echo "$RUTA_RESPONSE" | jq -r '.id')
    echo "ID de la ruta creada: $RUTA_ID"
    echo ""
    echo ""

    echo -e "\nProbando GET /rutas"
    curl -s -X GET "$API_URL/rutas"
    echo ""
    echo ""

    echo -e "\nProbando GET /rutas/$RUTA_ID"
    curl -s -X GET "$API_URL/rutas/$RUTA_ID"
    echo ""
    echo ""

    echo -e "\nProbando PUT /rutas/$RUTA_ID"
    curl -s -X PUT "$API_URL/rutas/$RUTA_ID" \
        -H "Content-Type: application/json" \
        -d '{
            "estado": "inactiva"
        }'
    echo ""
    echo ""

    echo -e "\nProbando DELETE /rutas/$RUTA_ID"
    curl -s -X DELETE "$API_URL/rutas/$RUTA_ID"
}

# # Verificar que jq está instalado
if ! command -v jq &> /dev/null
then
    echo "Error: jq no está instalado. Instálalo con 'sudo apt install jq' (Linux) o 'brew install jq' (Mac)."
    exit 1
fi

# Ejecutar todas las pruebas
test_conductores
test_rutas
