#!/bin/bash

# Definir la URL base de la API
source curl-scripts/set-API-URL.sh

# Función para probar minibuses
test_minibuses() {
    echo -e "\nProbando POST /minibuses"
    CONDUCTOR_RESPONSE=$(curl -s -X POST "$API_URL/minibuses" \
        -H "Content-Type: application/json" \
        -d '{
            "Usuario_ID": "12345",
            "Foto_DNI": "url_foto_dni",
            "Foto_VTV": "url_foto_vtv",
            "Estado": "Pendiente"
        }')

    echo "Respuesta: $CONDUCTOR_RESPONSE"

    # Extraer ID del minibus
    CONDUCTOR_ID=$(echo "$CONDUCTOR_RESPONSE" | jq -r '.id')

    echo ""
    echo -e "\nProbando GET /minibuses/$CONDUCTOR_ID"
    curl -s -X GET "$API_URL/minibuses/$CONDUCTOR_ID"
    echo ""
    
    echo "ID del minibus creado: $CONDUCTOR_ID"
    echo ""
    echo -e "\nProbando GET /minibuses"
    curl -s -X GET "$API_URL/minibuses"
    echo ""


    echo -e "\nProbando PUT /minibuses/$CONDUCTOR_ID"
    curl -s -X PUT "$API_URL/minibuses/$CONDUCTOR_ID" \
        -H "Content-Type: application/json" \
        -d '{
            "Estado": "Aprobado"
        }'
    echo ""

    echo -e "\nProbando DELETE /minibuses/$CONDUCTOR_ID"
    curl -s -X DELETE "$API_URL/minibuses/$CONDUCTOR_ID"
}

# Función para probar rutas
test_rutas() {
    echo -e "\nProbando POST /rutas"
    RUTA_RESPONSE=$(curl -s -X POST "$API_URL/rutas" \
        -H "Content-Type: application/json" \
        -d '{
            "minibusId": "12345",
            "estado": "activa",
            "paradasDeRuta": [
                {
                    "id": "",
                    "parada": {
                        "id": "",
                        "nombre": "Parada 1",
                        "direccion": "Av. Primera 123",
                        "descripcion": "Parada inicial"
                    },
                    "posicion": 1,
                    "horario": "08:00"
                },
                {
                    "id": "",
                    "parada": {
                        "id": "",
                        "nombre": "Parada 2",
                        "direccion": "Av. Segunda 456",
                        "descripcion": "Parada intermedia"
                    },
                    "posicion": 2,
                    "horario": "10:00"
                }
            ]
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
    echo ""
}


# Función para probar paradas
test_paradas() {
    echo -e "\nProbando POST /paradas"
    PARADA_RESPONSE=$(curl -s -X POST "$API_URL/paradas" \
        -H "Content-Type: application/json" \
        -d '{
            "id": "parada-123",
            "nombre": "Parada Central",
            "descripcion": "Parada principal en el centro",
            "calle": "Av. Siempre Viva",
            "numero": "742",
            "localidad": "Springfield",
            "codigoPostal": "12345",
            "partido": "Capital",
            "provincia": "Buenos Aires",
            "latitud": -34.603722,
            "longitud": -58.381592
        }')

    echo "Respuesta: $PARADA_RESPONSE"

    # Extraer ID de la parada
    PARADA_ID=$(echo "$PARADA_RESPONSE" | jq -r '.id')

    echo -e "\nProbando GET /paradas/$PARADA_ID"
    curl -s -X GET "$API_URL/paradas/$PARADA_ID"
    echo ""

    echo -e "\nProbando GET /paradas"
    curl -s -X GET "$API_URL/paradas"
    echo ""

    echo -e "\nProbando PUT /paradas/$PARADA_ID"
    curl -s -X PUT "$API_URL/paradas/$PARADA_ID" \
        -H "Content-Type: application/json" \
        -d '{
            "nombre": "Parada Central Actualizada",
            "descripcion": "Parada principal actualizada",
            "calle": "Av. Siempre Viva",
            "numero": "742",
            "localidad": "Springfield",
            "codigoPostal": "12345",
            "partido": "Capital",
            "provincia": "Buenos Aires",
            "latitud": -34.603722,
            "longitud": -58.381592
        }'
    echo ""

    echo -e "\nProbando DELETE /paradas/$PARADA_ID"
    curl -s -X DELETE "$API_URL/paradas/$PARADA_ID"
    echo ""
}


test_paradas_de_ruta() {
    echo -e "\nProbando POST /paradasDeRuta"
    PARADA_RESPONSE=$(curl -s -X POST "$API_URL/paradasDeRuta" \
        -H "Content-Type: application/json" \
        -d '{
            "parada": {
                "id": "",
                "nombre": "Parada Central",
                "direccion": "Av. Siempre Viva 742",
                "descripcion": "Parada principal en el centro"
            },
            "posicion": 1,
            "horario": "07:30"
        }')

    echo "Respuesta: $PARADA_RESPONSE"
    echo ""

    # Extraer ID de la parada de ruta
    PARADA_ID=$(echo "$PARADA_RESPONSE" | jq -r '.id')
    echo "ID de la parada creada: $PARADA_ID"
    echo ""

    echo -e "\nProbando GET /paradasDeRuta"
    curl -s -X GET "$API_URL/paradasDeRuta"
    echo ""

    echo -e "\nProbando GET /paradasDeRuta/$PARADA_ID"
    curl -s -X GET "$API_URL/paradasDeRuta/$PARADA_ID"
    echo ""

    echo -e "\nProbando PUT /paradasDeRuta/$PARADA_ID"
    curl -s -X PUT "$API_URL/paradasDeRuta/$PARADA_ID" \
        -H "Content-Type: application/json" \
        -d '{
            "horario": "08:15"
        }'
    echo ""

    echo -e "\nProbando DELETE /paradasDeRuta/$PARADA_ID"
    curl -s -X DELETE "$API_URL/paradasDeRuta/$PARADA_ID"
    echo ""
}

# Función para agregar una parada a una ruta
agregar_parada_a_ruta() {
    echo -e "\nProbando agregar parada a ruta"
    curl -s -X PUT "$API_URL/rutas/$RUTA_ID" \
        -H "Content-Type: application/json" \
        -d '{
            "paradasDeRuta": [
                {
                    "id": "",
                    "parada": {
                        "id": "",
                        "nombre": "Nueva Parada",
                        "direccion": "Calle 123",
                        "descripcion": "Descripción opcional"
                    },
                    "posicion": 3,
                    "horario": "08:30"
                }
            ]
        }'
    echo ""
}

# Función para eliminar una parada de una ruta
eliminar_parada_de_ruta() {
    echo -e "\nProbando eliminar parada de ruta"
    curl -s -X PUT "$API_URL/rutas/$RUTA_ID" \
        -H "Content-Type: application/json" \
        -d '{
            "paradasDeRuta": [
                {
                    "id": "id-de-la-parada-a-eliminar"
                }
            ]
        }'
    echo ""
}

# Función para probar viajes
test_viajes() {
    echo -e "\nProbando POST /viajes"
    VIAJE_RESPONSE=$(curl -s -X POST "$API_URL/viajes" \
        -H "Content-Type: application/json" \
        -d '{
            "minibusId": "12345",
            "rutaId": "67890",
            "estado": "programado",
            "fechaHoraSalida": "2025-02-25T08:00:00Z",
            "fechaHoraLlegada": "2025-02-25T10:00:00Z",
            "capacidad": 20,
            "pasajeros": []
        }')

    echo "Respuesta: $VIAJE_RESPONSE"

    # Extraer ID del viaje
    VIAJE_ID=$(echo "$VIAJE_RESPONSE" | jq -r '.id')

    echo ""
    echo -e "\nProbando GET /viajes/$VIAJE_ID"
    curl -s -X GET "$API_URL/viajes/$VIAJE_ID"
    echo ""
    
    echo "ID del viaje creado: $VIAJE_ID"
    echo ""
    echo -e "\nProbando GET /viajes"
    curl -s -X GET "$API_URL/viajes"
    echo ""

    echo -e "\nProbando PUT /viajes/$VIAJE_ID"
    curl -s -X PUT "$API_URL/viajes/$VIAJE_ID" \
        -H "Content-Type: application/json" \
        -d '{
            "estado": "en curso"
        }'
    echo ""

    echo -e "\nProbando DELETE /viajes/$VIAJE_ID"
    curl -s -X DELETE "$API_URL/viajes/$VIAJE_ID"
    echo ""
}
# # Verificar que jq está instalado
if ! command -v jq &> /dev/null
then
    echo "Error: jq no está instalado. Instálalo con 'sudo apt install jq' (Linux) o 'brew install jq' (Mac)."
    exit 1
fi

# Ejecutar todas las pruebas
# test_paradas
# test_rutas
test_paradas_de_ruta
# test_minibuses
# agregar_parada_a_ruta
# eliminar_parada_de_ruta
# test_viajes