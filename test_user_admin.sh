#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8081"
TIMESTAMP=$(date +%s)
EMAIL="test_admin_${TIMESTAMP}@test.com"
PASSWORD="test123456"
FIRSTNAME="Admin"
LASTNAME="User"
AGE=35

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🧪 TEST: Usuario Administrador${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

# Función helper para hacer requests
make_request() {
    local method=$1
    local url=$2
    local data=$3
    local token=$4
    local description=$5
    
    echo -e "\n${YELLOW}📡 $description${NC}" >&2
    echo "   Method: $method" >&2
    echo "   URL: $url" >&2
    
    if [ -n "$token" ]; then
        RESPONSE=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer $token" \
            -d "$data" 2>&1)
    else
        RESPONSE=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
            -H "Content-Type: application/json" \
            -d "$data" 2>&1)
    fi
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    BODY=$(echo "$RESPONSE" | sed '$d')
    
    echo "   HTTP Status: $HTTP_CODE" >&2
    echo "   Response: $(echo "$BODY" | head -c 200)..." >&2
    
    echo "$HTTP_CODE|$BODY"
}

# ============================================
# CONFIGURACIÓN: Usar admin existente o crear uno
# ============================================
ADMIN_EMAIL_DEFAULT="ezequiel_g@test.com"
echo -e "${YELLOW}💡 Usando admin por defecto: $ADMIN_EMAIL_DEFAULT${NC}"
echo -e "${YELLOW}   (Puedes cambiarlo escribiendo otro email)${NC}"
read -p "Email del admin (Enter para usar '$ADMIN_EMAIL_DEFAULT'): " ADMIN_EMAIL_INPUT

if [ -z "$ADMIN_EMAIL_INPUT" ]; then
    ADMIN_EMAIL_INPUT="$ADMIN_EMAIL_DEFAULT"
    echo -e "${GREEN}✅ Usando admin por defecto${NC}"
fi

read -p "Contraseña del admin: " ADMIN_PASSWORD_INPUT
if [ -z "$ADMIN_PASSWORD_INPUT" ]; then
    ADMIN_PASSWORD_INPUT="$PASSWORD"
fi

# ============================================
# 1. LOGIN COMO ADMIN
# ============================================
echo -e "\n${BLUE}─── 1. LOGIN COMO ADMIN ───${NC}"
if [ -z "$ADMIN_PASSWORD_INPUT" ]; then
    ADMIN_PASSWORD_INPUT="$PASSWORD"
fi

LOGIN_DATA="{\"email\":\"$ADMIN_EMAIL_INPUT\",\"password\":\"$ADMIN_PASSWORD_INPUT\"}"
RESULT=$(make_request "POST" "$BASE_URL/login" "$LOGIN_DATA" "" "Login como admin")

HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
BODY=$(echo "$RESULT" | cut -d'|' -f2-)

if [ "$HTTP_CODE" -eq 200 ]; then
    TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    USER_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    CART_ID=$(echo "$BODY" | grep -o '"cartId":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Login exitoso${NC}"
    echo "   User ID: $USER_ID"
    echo "   Cart ID: $CART_ID"
else
    echo -e "${RED}❌ Login falló (HTTP $HTTP_CODE)${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    exit 1
fi

# ============================================
# 2. VER TODOS LOS USUARIOS (Solo Admin)
# ============================================
echo -e "\n${BLUE}─── 2. VER TODOS LOS USUARIOS ───${NC}"
RESULT=$(make_request "GET" "$BASE_URL/api/users" "" "$TOKEN" "Listando todos los usuarios")

HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
BODY=$(echo "$RESULT" | cut -d'|' -f2-)

if [ "$HTTP_CODE" -eq 200 ]; then
    USER_COUNT=$(echo "$BODY" | grep -o '"_id"' | wc -l)
    echo -e "${GREEN}✅ Usuarios obtenidos${NC}"
    echo "   Total usuarios: $USER_COUNT"
else
    echo -e "${RED}❌ Error obteniendo usuarios (HTTP $HTTP_CODE)${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
fi

# ============================================
# 3. CREAR PRODUCTO (Admin puede)
# ============================================
echo -e "\n${BLUE}─── 3. CREAR PRODUCTO ───${NC}"
PRODUCT_DATA="{\"title\":\"Producto Admin ${TIMESTAMP}\",\"description\":\"Producto creado por admin\",\"price\":199.99,\"stock\":100,\"category\":\"admin\",\"code\":\"ADM${TIMESTAMP}\",\"status\":true}"

RESULT=$(make_request "POST" "$BASE_URL/api/products" "$PRODUCT_DATA" "$TOKEN" "Creando producto como admin")

HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
BODY=$(echo "$RESULT" | cut -d'|' -f2-)

if [ "$HTTP_CODE" -eq 201 ]; then
    PRODUCT_ID=$(echo "$BODY" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
    echo -e "${GREEN}✅ Producto creado${NC}"
    echo "   Product ID: $PRODUCT_ID"
else
    echo -e "${RED}❌ Error creando producto (HTTP $HTTP_CODE)${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
fi

# ============================================
# 4. CREAR USUARIO REGULAR PARA TESTING
# ============================================
echo -e "\n${BLUE}─── 4. CREAR USUARIO REGULAR PARA TESTING ───${NC}"
TEST_USER_EMAIL="test_regular_${TIMESTAMP}@test.com"
SIGNUP_DATA="{\"email\":\"$TEST_USER_EMAIL\",\"password\":\"$PASSWORD\",\"firstname\":\"Test\",\"lastname\":\"User\",\"age\":25,\"confirm_password\":\"$PASSWORD\"}"

RESULT=$(make_request "POST" "$BASE_URL/signup" "$SIGNUP_DATA" "" "Creando usuario regular")

HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
BODY=$(echo "$RESULT" | cut -d'|' -f2-)

if [ "$HTTP_CODE" -eq 201 ]; then
    TEST_USER_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Usuario regular creado${NC}"
    echo "   Test User ID: $TEST_USER_ID"
else
    echo -e "${RED}❌ Error creando usuario regular${NC}"
    TEST_USER_ID=""
fi

# ============================================
# 5. CAMBIAR ROL DE USUARIO (Premium)
# ============================================
if [ -n "$TEST_USER_ID" ]; then
    echo -e "\n${BLUE}─── 5. CAMBIAR USUARIO A PREMIUM ───${NC}"
    PREMIUM_DATA="{\"premium\":\"true\"}"
    
    RESULT=$(make_request "POST" "$BASE_URL/api/users/premium/$TEST_USER_ID" "$PREMIUM_DATA" "$TOKEN" "Cambiando usuario a premium")
    
    HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
    BODY=$(echo "$RESULT" | cut -d'|' -f2-)
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✅ Usuario cambiado a premium${NC}"
    elif [ "$HTTP_CODE" -eq 400 ]; then
        echo -e "${YELLOW}⚠️  Cambio rechazado: Usuario necesita 3 documentos${NC}"
    else
        echo -e "${RED}❌ Error cambiando rol (HTTP $HTTP_CODE)${NC}"
    fi
fi

# ============================================
# 6. VER TODOS LOS CARRITOS
# ============================================
echo -e "\n${BLUE}─── 6. VER TODOS LOS CARRITOS ───${NC}"
RESULT=$(make_request "GET" "$BASE_URL/api/carts" "" "$TOKEN" "Listando todos los carritos")

HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
BODY=$(echo "$RESULT" | cut -d'|' -f2-)

if [ "$HTTP_CODE" -eq 200 ]; then
    CART_COUNT=$(echo "$BODY" | grep -o '"_id"' | wc -l)
    echo -e "${GREEN}✅ Carritos obtenidos${NC}"
    echo "   Total carritos: $CART_COUNT"
else
    echo -e "${RED}❌ Error obteniendo carritos (HTTP $HTTP_CODE)${NC}"
fi

# ============================================
# 7. CREAR CARRITO MANUALMENTE
# ============================================
echo -e "\n${BLUE}─── 7. CREAR CARRITO ───${NC}"
RESULT=$(make_request "POST" "$BASE_URL/api/carts" "{}" "$TOKEN" "Creando carrito")

HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
BODY=$(echo "$RESULT" | cut -d'|' -f2-)

if [ "$HTTP_CODE" -eq 200 ]; then
    NEW_CART_ID=$(echo "$BODY" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
    echo -e "${GREEN}✅ Carrito creado${NC}"
    echo "   New Cart ID: $NEW_CART_ID"
else
    echo -e "${RED}❌ Error creando carrito (HTTP $HTTP_CODE)${NC}"
fi

# ============================================
# 8. INTENTAR AGREGAR PRODUCTO AL CARRITO (DEBE FALLAR)
# ============================================
if [ -n "$PRODUCT_ID" ] && [ -n "$CART_ID" ]; then
    echo -e "\n${BLUE}─── 8. INTENTAR AGREGAR PRODUCTO AL CARRITO (DEBE FALLAR) ───${NC}"
    ADD_PRODUCT_DATA="{\"productId\":\"$PRODUCT_ID\",\"quantity\":1}"
    RESULT=$(make_request "POST" "$BASE_URL/api/carts/$CART_ID" "$ADD_PRODUCT_DATA" "$TOKEN" "Intentando agregar producto (admin no puede)")

    HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
    BODY=$(echo "$RESULT" | cut -d'|' -f2-)

    if [ "$HTTP_CODE" -eq 401 ] || [ "$HTTP_CODE" -eq 400 ]; then
        echo -e "${GREEN}✅ Correctamente rechazado (admin no puede agregar productos)${NC}"
    else
        echo -e "${RED}❌ Debería haber sido rechazado pero obtuvo HTTP $HTTP_CODE${NC}"
    fi
fi

# ============================================
# 9. ACTUALIZAR PRODUCTO
# ============================================
if [ -n "$PRODUCT_ID" ]; then
    echo -e "\n${BLUE}─── 9. ACTUALIZAR PRODUCTO ───${NC}"
    UPDATE_DATA="{\"price\":299.99,\"stock\":150}"
    RESULT=$(make_request "PUT" "$BASE_URL/api/products/$PRODUCT_ID" "$UPDATE_DATA" "$TOKEN" "Actualizando producto")

    HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
    BODY=$(echo "$RESULT" | cut -d'|' -f2-)

    if [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✅ Producto actualizado${NC}"
    else
        echo -e "${RED}❌ Error actualizando producto (HTTP $HTTP_CODE)${NC}"
    fi
fi

# ============================================
# 10. ELIMINAR PRODUCTO
# ============================================
if [ -n "$PRODUCT_ID" ]; then
    echo -e "\n${BLUE}─── 10. ELIMINAR PRODUCTO ───${NC}"
    RESULT=$(make_request "DELETE" "$BASE_URL/api/products/$PRODUCT_ID" "" "$TOKEN" "Eliminando producto")

    HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
    BODY=$(echo "$RESULT" | cut -d'|' -f2-)

    if [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✅ Producto eliminado${NC}"
    else
        echo -e "${RED}❌ Error eliminando producto (HTTP $HTTP_CODE)${NC}"
    fi
fi

# ============================================
# 11. ELIMINAR USUARIO INACTIVO
# ============================================
echo -e "\n${BLUE}─── 11. ELIMINAR USUARIOS INACTIVOS ───${NC}"
RESULT=$(make_request "GET" "$BASE_URL/api/users/deleteAccounts" "" "$TOKEN" "Eliminando usuarios inactivos (2+ días)")

HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
BODY=$(echo "$RESULT" | cut -d'|' -f2-)

if [ "$HTTP_CODE" -eq 200 ]; then
    DELETED_COUNT=$(echo "$BODY" | grep -o '"deletedCount":[0-9]*' | cut -d':' -f2)
    echo -e "${GREEN}✅ Usuarios inactivos eliminados${NC}"
    echo "   Eliminados: $DELETED_COUNT"
else
    echo -e "${RED}❌ Error eliminando usuarios inactivos (HTTP $HTTP_CODE)${NC}"
fi

# ============================================
# RESUMEN
# ============================================
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ TEST COMPLETADO: Usuario Administrador${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo "Admin Email: $ADMIN_EMAIL_INPUT"
echo "User ID: $USER_ID"
echo "Cart ID: $CART_ID"
if [ -n "$PRODUCT_ID" ]; then
    echo "Product ID creado: $PRODUCT_ID"
fi
if [ -n "$TEST_USER_ID" ]; then
    echo "Test User ID: $TEST_USER_ID"
fi