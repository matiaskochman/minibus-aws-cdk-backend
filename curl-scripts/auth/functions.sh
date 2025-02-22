#!/bin/bash

# Cargar la URL base desde un script externo
source curl-scripts/set-API-URL.sh

# Verificar que API_URL está disponible
if [ -z "$API_URL" ]; then
    echo "❌ Error: API_URL no está configurado. Revisa set-API-URL.sh"
    exit 1
fi


# Variables globales para almacenar resultados
USER_EMAIL=""
USER_PASSWORD="Test1234!"
USER_NAME=""
TOKEN=""

# Función para generar un email aleatorio
generate_random_email() {
  USER_EMAIL="user$RANDOM@example.com"
}

# Función para generar un nombre de usuario aleatorio
generate_random_username() {
  USER_NAME="user$RANDOM"
}

# Función para registrar un usuario
sign_up() {
  generate_random_username
  generate_random_email
  local telegram="@${USER_NAME}"
  local telefono="123456789"

  echo "🔹 Registrando usuario: $USER_NAME ($USER_EMAIL)"

  local response=$(curl -s -X POST "$API_URL/auth/sign-up" \
    -H "Content-Type: application/json" \
    -d "{
          \"username\": \"$USER_NAME\",
          \"email\": \"$USER_EMAIL\",
          \"password\": \"$USER_PASSWORD\",
          \"telegram\": \"$telegram\",
          \"telefono\": \"$telefono\"
        }")

  echo "📌 Respuesta de sign-up:"
  echo "$response"
}

# Función para iniciar sesión
log_in() {
  echo "🔹 Iniciando sesión con: $USER_EMAIL"

  local response=$(curl -s -X POST "$API_URL/auth/log-in" \
    -H "Content-Type: application/json" \
    -d "{
          \"email\": \"$USER_EMAIL\",
          \"password\": \"$USER_PASSWORD\"
        }")

  TOKEN=$(echo "$response" | grep -o '"token":"[^"]*' | cut -d':' -f2 | tr -d '"')

  echo "📌 Respuesta de log-in:"
  echo "$response"

  if [ -n "$TOKEN" ]; then
    echo "🔑 Token obtenido: $TOKEN"
  else
    echo "❌ Error al obtener el token."
    exit 1
  fi
}

# Función para cerrar sesión
log_out() {
  if [ -z "$TOKEN" ]; then
    echo "❌ No se encontró un token activo. Inicia sesión primero."
    exit 1
  fi

  echo "🔹 Cerrando sesión..."

  local response=$(curl -s -X POST "$API_URL/auth/log-out" \
    -H "Authorization: Bearer $TOKEN")

  echo "📌 Respuesta de log-out:"
  echo "$response"

  # Limpiar variables
  TOKEN=""
  USER_EMAIL=""
  USER_NAME=""
}

# Ejecutar todas las funciones automáticamente
sign_up
log_in
log_out

