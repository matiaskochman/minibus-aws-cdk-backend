#!/bin/bash

# Cargar la URL base desde un script externo
source curl-scripts/set-API-URL.sh

# Verificar que API_URL está disponible
if [ -z "$API_URL" ]; then
    echo "❌ Error: API_URL no está configurado. Revisa set-API-URL.sh"
    exit 1
fi

# Función para crear una parada con parámetros
crear_parada_con_datos() {
    local nombre="$1"
    local calle="$2"
    local localidad="$3"
    local descripcion="$4"
    
    # Generar un ID único basado en el nombre (remueve espacios y convierte a minúsculas)
    local id="parada-$(echo "$nombre" | tr ' ' '-' | tr '[:upper:]' '[:lower:]')"

    echo -e "\nProbando POST /paradas (ID: $id)"
    
    PARADA_RESPONSE=$(curl -s -X POST "$API_URL/paradas" \
        -H "Content-Type: application/json" \
        -d "{
            \"id\": \"$id\",
            \"nombre\": \"$nombre\",
            \"descripcion\": \"$descripcion\",
            \"calle\": \"$calle\",
            \"numero\": \"$((RANDOM % 500 + 1))\",
            \"localidad\": \"$localidad\",
            \"codigoPostal\": \"12345\",
            \"partido\": \"Capital\",
            \"provincia\": \"Buenos Aires\",
            \"latitud\": -34.603722,
            \"longitud\": -58.381592
        }")

    echo "Respuesta: $PARADA_RESPONSE"

    # Extraer el ID de la parada creada
    local PARADA_ID=$(echo "$PARADA_RESPONSE" | jq -r '.id')
    echo "✅ Parada creada con ID: $PARADA_ID"
}

# Función de prueba para crear una parada con datos específicos
test_crear_parada_con_datos() {
    crear_parada_con_datos "Parada Norte" "Av. Siempre Viva" "Springfield" "Parada principal en la ciudad"
    crear_parada_con_datos "Parada Sur" "Calle 13" "Shelbyville" "Parada secundaria cerca del parque"
}

# Ejecutar la prueba
test_crear_parada_con_datos
