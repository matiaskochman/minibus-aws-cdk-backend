#!/bin/bash

# Configuración base (ajustar según entorno)
# Cargar la URL base desde un script externo
source curl-scripts/set-API-URL.sh

# Endpoint base para usuarios
USUARIOS_ENDPOINT="${API_URL}/usuarios"

# Función para crear un usuario
crear_usuario() {
  echo "Creando usuario..."
  local response=$(curl -s -X POST -H "Content-Type: application/json" \
    -d '{
      "credentials": {
        "username": "juan_perez",
        "email": "juan@example.com",
        "password": "secreto123",
        "telegram": "@juanp",
        "telefono": "+5491112345678"
      },
      "rol": "Conductor",
      "estado": "Pendiente"
    }' \
    ${USUARIOS_ENDPOINT})

  echo "Respuesta creación:"
  echo "$response" | jq .

  # Extraer ID del usuario creado
  local user_id=$(echo "$response" | jq -r '.id')
  echo "ID Usuario creado: $user_id"
  echo "$user_id"
}

# Función para obtener todos los usuarios
listar_usuarios() {
  echo -e "\nListando todos los usuarios..."
  curl -s -X GET ${USUARIOS_ENDPOINT} | jq .
}

# Función para obtener un usuario por ID
obtener_usuario() {
  local user_id=$1
  echo -e "\nObteniendo usuario $user_id..."
  curl -s -X GET ${USUARIOS_ENDPOINT}/${user_id} | jq .
}

# Función para actualizar un usuario
actualizar_usuario() {
  local user_id=$1
  echo -e "\nActualizando usuario $user_id..."
  curl -s -X PUT -H "Content-Type: application/json" \
    -d '{
      "estado": "Aprobado",
      "credentials": {
        "telefono": "+5491122334455"
      }
    }' \
    ${USUARIOS_ENDPOINT}/${user_id} | jq .
}

# Función para eliminar un usuario
eliminar_usuario() {
  local user_id=$1
  echo -e "\nEliminando usuario $user_id..."
  curl -s -X DELETE ${USUARIOS_ENDPOINT}/${user_id}
}

# Función para verificar si un usuario fue eliminado
verificar_eliminacion() {
  local user_id=$1
  echo -e "\nVerificando eliminación..."
  curl -s -X GET ${USUARIOS_ENDPOINT}/${user_id} | jq .
}

# Flujo de ejecución
USER_ID=$(crear_usuario)
listar_usuarios
obtener_usuario "$USER_ID"
actualizar_usuario "$USER_ID"
eliminar_usuario "$USER_ID"
verificar_eliminacion "$USER_ID"
