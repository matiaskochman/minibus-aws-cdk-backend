#!/bin/bash

# Cargar la URL base de la API
source curl-scripts/set-API-URL.sh

# Variable global para almacenar el ID del viaje creado
VIAJE_ID=""

crear_viaje() {
    echo -e "\n🔹 Creando un nuevo viaje (POST /viajes)"
    VIAJE_RESPONSE=$(curl -s -X POST "$API_URL/viajes" \
        -H "Content-Type: application/json" \
        -d '{
            "rutaId": "ruta-12345",
            "conductorId": "conductor-67890",
            "paradasDeRuta": [
                {
                    "id": "parada-001",
                    "parada": {
                        "id": "parada-001",
                        "nombre": "Parada A",
                        "direccion": "Calle 1"
                    },
                    "posicion": 1,
                    "horario": "08:00"
                },
                {
                    "id": "parada-002",
                    "parada": {
                        "id": "parada-002",
                        "nombre": "Parada B",
                        "direccion": "Calle 2"
                    },
                    "posicion": 2,
                    "horario": "09:00"
                }
            ],
            "estado": "programado",
            "fechaInicio": "2025-02-25T08:00:00Z"
        }')

    echo "🔹 Respuesta: $VIAJE_RESPONSE"

    # Extraer ID del viaje
    VIAJE_ID=$(echo "$VIAJE_RESPONSE" | jq -r '.id')

    if [ "$VIAJE_ID" == "null" ] || [ -z "$VIAJE_ID" ]; then
        echo "❌ Error al crear el viaje."
        exit 1
    fi

    echo "✅ Viaje creado con ID: $VIAJE_ID"
}

obtener_viaje() {
    if [ -z "$VIAJE_ID" ]; then
        echo "❌ No hay un VIAJE_ID definido."
        exit 1
    fi
    echo -e "\n🔹 Obteniendo viaje con ID $VIAJE_ID (GET /viajes/$VIAJE_ID)"
    curl -s -X GET "$API_URL/viajes/$VIAJE_ID" | jq .
}

listar_viajes() {
    echo -e "\n🔹 Listando todos los viajes (GET /viajes)"
    curl -s -X GET "$API_URL/viajes" | jq .
}

actualizar_viaje() {
    if [ -z "$VIAJE_ID" ]; then
        echo "❌ No hay un VIAJE_ID definido."
        exit 1
    fi
    echo -e "\n🔹 Actualizando el estado del viaje a 'en curso' (PUT /viajes/$VIAJE_ID)"
    curl -s -X PUT "$API_URL/viajes/$VIAJE_ID" \
        -H "Content-Type: application/json" \
        -d '{
            "estado": "en curso"
        }' | jq .
}

eliminar_viaje() {
    if [ -z "$VIAJE_ID" ]; then
        echo "❌ No hay un VIAJE_ID definido."
        exit 1
    fi
    echo -e "\n🔹 Eliminando viaje con ID $VIAJE_ID (DELETE /viajes/$VIAJE_ID)"
    curl -s -X DELETE "$API_URL/viajes/$VIAJE_ID"
    echo "✅ Viaje eliminado"
}

# Verificar que jq está instalado
if ! command -v jq &> /dev/null
then
    echo "❌ Error: jq no está instalado. Instálalo con 'sudo apt install jq' (Linux) o 'brew install jq' (Mac)."
    exit 1
fi

# Ejecutar todas las pruebas en orden
crear_viaje
obtener_viaje
listar_viajes
actualizar_viaje
eliminar_viaje
