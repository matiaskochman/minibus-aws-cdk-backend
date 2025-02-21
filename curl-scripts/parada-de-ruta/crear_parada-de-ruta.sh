#!/bin/bash

# Cargar la URL base desde un script externo
source curl-scripts/set-API-URL.sh

# Verificar que API_URL está disponible
if [ -z "$API_URL" ]; then
    echo "❌ Error: API_URL no está configurado. Revisa set-API-URL.sh"
    exit 1
fi

# Función para crear una paradaDeRuta con parámetros
crear_parada_de_ruta_con_datos() {
    local parada_id="$1"
    local posicion="$2"
    local horario="$3"
    
    echo -e "\nProbando POST /paradasDeRuta"
    
    PARADA_DE_RUTA_RESPONSE=$(curl -s -X POST "$API_URL/paradasDeRuta" \
        -H "Content-Type: application/json" \
        -d "{
            \"parada\": \"$parada_id\",
            \"posicion\": $posicion,
            \"horario\": \"$horario\"
        }")

    echo "Respuesta: $PARADA_DE_RUTA_RESPONSE"

    # Extraer el ID de la parada de ruta creada
    local PARADA_DE_RUTA_ID=$(echo "$PARADA_DE_RUTA_RESPONSE" | jq -r '.id')
    echo "✅ Parada de Ruta creada con ID: $PARADA_DE_RUTA_ID"
}

# Función de prueba que primero crea una parada y luego su paradaDeRuta
test_crear_parada_de_ruta_con_datos() {
    # Primero creamos una parada normal
    echo -e "\nCreando parada base..."
    PARADA_BASE_RESPONSE=$(curl -s -X POST "$API_URL/paradas" \
        -H "Content-Type: application/json" \
        -d '{
            "nombre": "Parada Central Test",
            "descripcion": "Parada para testing",
            "calle": "Calle Falsa",
            "numero": "123",
            "localidad": "Testingville",
            "codigoPostal": "1234",
            "partido": "Test",
            "provincia": "Buenos Aires"
        }')
    
    local PARADA_ID=$(echo "$PARADA_BASE_RESPONSE" | jq -r '.id')
    echo "✅ Parada base creada con ID: $PARADA_ID"

    # Ahora creamos la parada de ruta asociada
    crear_parada_de_ruta_con_datos "$PARADA_ID" 1 "07:30"
    crear_parada_de_ruta_con_datos "$PARADA_ID" 2 "08:15"
    
    # Prueba adicional: crear paradaDeRuta en posición no numérica (debe fallar)
    echo -e "\nProbando posición inválida..."
    curl -s -X POST "$API_URL/paradasDeRuta" \
        -H "Content-Type: application/json" \
        -d "{
            \"parada\": \"$PARADA_ID\",
            \"posicion\": \"no-es-un-numero\",
            \"horario\": \"09:00\"
        }"
}

# Ejecutar la prueba
test_crear_parada_de_ruta_con_datos