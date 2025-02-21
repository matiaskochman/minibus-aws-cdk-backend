#!/bin/bash

# Cargar la URL base desde un script externo
source curl-scripts/set-API-URL.sh

# Verificar que API_URL está disponible
if [ -z "$API_URL" ]; then
    echo "❌ Error: API_URL no está configurado. Revisa set-API-URL.sh"
    exit 1
fi

# Función principal
crear_paradas_de_ruta_para_todas_las_paradas() {
    echo -e "\nObteniendo todas las paradas..."
    PARADAS_RESPONSE=$(curl -s -X GET "$API_URL/paradas")
    
    # Verificar si se obtuvieron paradas
    if [ $(echo "$PARADAS_RESPONSE" | jq length) -eq 0 ]; then
        echo "⚠️ No hay paradas existentes. Crea algunas paradas primero."
        exit 1
    fi

    echo -e "\nParadas encontradas:"
    echo "$PARADAS_RESPONSE" | jq -r '.[] | "\(.nombre) - \(.id)"'
    
    # Contador para posición y horario
    local posicion=1
    local hora=8
    local minutos=0

    echo -e "\nCreando paradasDeRuta..."
    
    echo "$PARADAS_RESPONSE" | jq -c '.[]' | while read -r parada; do
        local parada_id=$(echo "$parada" | jq -r '.id')
        local nombre_parada=$(echo "$parada" | jq -r '.nombre')
        local horario=$(printf "%02d:%02d" $hora $minutos)
        
        echo -e "\n➡️ Creando paradaDeRuta para: $nombre_parada"
        echo "   Posición: $posicion | Horario: $horario"
        
        # Crear la paradaDeRuta
        local response=$(curl -s -X POST "$API_URL/paradasDeRuta" \
            -H "Content-Type: application/json" \
            -d "{
                \"parada\": \"$parada_id\",
                \"posicion\": $posicion,
                \"horario\": \"$horario\"
            }")
        
        # Mostrar resultado
        if [ $(echo "$response" | jq -r '.id') != null ]; then
            echo "✅ Creada exitosamente - ID: $(echo "$response" | jq -r '.id')"
        else
            echo "❌ Error creando paradaDeRuta: $response"
        fi
        
        # Actualizar contadores para la próxima parada
        ((posicion++))
        ((minutos += 30))
        
        # Ajustar formato de hora
        if [ $minutos -ge 60 ]; then
            ((hora++))
            minutos=0
        fi
    done
}

# Ejecutar la función principal
crear_paradas_de_ruta_para_todas_las_paradas