#!/bin/bash

# Definir la URL base de la API
API_URL="https://texwr1fbp4.execute-api.localhost.localstack.cloud:4566/dev/"

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
    echo -e "\nProbando GET /conductores/$CONDUCTOR_ID"
    curl -s -X GET "$API_URL/conductores/$CONDUCTOR_ID"
    echo ""
    
    echo "ID del conductor creado: $CONDUCTOR_ID"
    echo ""
    echo -e "\nProbando GET /conductores"
    curl -s -X GET "$API_URL/conductores"
    echo ""


    echo -e "\nProbando PUT /conductores/$CONDUCTOR_ID"
    curl -s -X PUT "$API_URL/conductores/$CONDUCTOR_ID" \
        -H "Content-Type: application/json" \
        -d '{
            "Estado": "Aprobado"
        }'
    echo ""

    echo -e "\nProbando DELETE /conductores/$CONDUCTOR_ID"
    curl -s -X DELETE "$API_URL/conductores/$CONDUCTOR_ID"
}

# Función para probar rutas
test_rutas() {
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

    # Extraer ID de la ruta
    RUTA_ID=$(echo "$RUTA_RESPONSE" | jq -r '.id')
    echo "ID de la ruta creada: $RUTA_ID"
    echo ""

    echo -e "\nProbando GET /rutas"
    curl -s -X GET "$API_URL/rutas"
    echo ""

    echo -e "\nProbando GET /rutas/$RUTA_ID"
    curl -s -X GET "$API_URL/rutas/$RUTA_ID"
    echo ""

    echo -e "\nProbando PUT /rutas/$RUTA_ID"
    curl -s -X PUT "$API_URL/rutas/$RUTA_ID" \
        -H "Content-Type: application/json" \
        -d '{
            "estado": "inactiva"
        }'
    echo ""

    echo -e "\nProbando DELETE /rutas/$RUTA_ID"
    curl -s -X DELETE "$API_URL/rutas/$RUTA_ID"
}


# Función para probar paradas
test_paradas() {
    echo -e "\nProbando POST /paradas"
    PARADA_RESPONSE=$(curl -s -X POST "$API_URL/paradas" \
        -H "Content-Type: application/json" \
        -d '{
            "rutaId": "12345",
            "nombre": "Parada Central",
            "direccion": "Av. Siempre Viva 742",
            "descripcion": "Parada principal en el centro",
            "orden": 1
        }')

    echo "Respuesta: $PARADA_RESPONSE"

    # Extraer ID de la parada
    PARADA_ID=$(echo "$PARADA_RESPONSE" | jq -r '.id')

    echo -e "\nProbando GET /paradas"
    curl -s -X GET "$API_URL/paradas"
    echo ""

    echo -e "\nProbando GET /paradas/$PARADA_ID"
    curl -s -X GET "$API_URL/paradas/$PARADA_ID"
    echo ""

    echo -e "\nProbando PUT /paradas/$PARADA_ID"
    curl -s -X PUT "$API_URL/paradas/$PARADA_ID" \
        -H "Content-Type: application/json" \
        -d '{
            "descripcion": "Parada principal renovada"
        }'
    echo ""

    echo -e "\nProbando DELETE /paradas/$PARADA_ID"
    curl -s -X DELETE "$API_URL/paradas/$PARADA_ID"
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
test_paradas