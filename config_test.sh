#!/bin/bash
# config_test.sh - Configuración para tests
# 
# Este archivo contiene las credenciales por defecto para los tests.
# Puedes modificarlo según tus necesidades o crear variables de entorno.

# Email del admin por defecto
export ADMIN_EMAIL="ezequiel_g@test.com"

# Contraseña del admin (CAMBIAR por la contraseña real)
# Si no quieres hardcodear la contraseña, déjala vacía y se pedirá en cada test
export ADMIN_PASSWORD=""

# URL base del servidor
export BASE_URL="http://localhost:8081"

# Para usar este archivo en los scripts, agrega al inicio:
# source ./config_test.sh

