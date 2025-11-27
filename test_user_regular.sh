#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8081"
TIMESTAMP=$(date +%s)
EMAIL="test_user_${TIMESTAMP}@test.com"
PASSWORD="Password123"
FIRSTNAME="Test"
LASTNAME="User"
AGE=25

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🧪 TEST: Usuario Regular${NC}"
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
# 1. SIGNUP
# ============================================
echo -e "\n${BLUE}─── 1. REGISTRO ───${NC}"
SIGNUP_DATA="{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"firstname\":\"$FIRSTNAME\",\"lastname\":\"$LASTNAME\",\"age\":$AGE,\"confirm_password\":\"$PASSWORD\"}"

RESULT=$(make_request "POST" "$BASE_URL/signup" "$SIGNUP_DATA" "" "Registrando usuario")

HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
BODY=$(echo "$RESULT" | cut -d'|' -f2-)

if [ "$HTTP_CODE" -eq 201 ]; then
    TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    USER_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    CART_ID=$(echo "$BODY" | grep -o '"cartId":"[^"]*' | cut -d'"' -f4)
    
    echo -e "${GREEN}✅ Signup exitoso${NC}"
    echo "   User ID: $USER_ID"
    echo "   Cart ID: $CART_ID"
    echo "   Token: ${TOKEN:0:50}..."
else
    echo -e "${RED}❌ Signup falló (HTTP $HTTP_CODE)${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    exit 1
fi

# ============================================
# 2. LOGIN
# ============================================
echo -e "\n${BLUE}─── 2. LOGIN ───${NC}"
LOGIN_DATA="{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"

RESULT=$(make_request "POST" "$BASE_URL/login" "$LOGIN_DATA" "" "Iniciando sesión")

HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
BODY=$(echo "$RESULT" | cut -d'|' -f2-)

if [ "$HTTP_CODE" -eq 200 ]; then
    TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Login exitoso${NC}"
    echo "   Token: ${TOKEN:0:50}..."
else
    echo -e "${RED}❌ Login falló (HTTP $HTTP_CODE)${NC}"
    exit 1
fi

# ============================================
# 3. VER PRODUCTOS (PÚBLICO)
# ============================================
echo -e "\n${BLUE}─── 3. VER PRODUCTOS (Endpoint Público) ───${NC}"
RESULT=$(make_request "GET" "$BASE_URL/api/products" "" "" "Listando productos (sin auth)")

HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
BODY=$(echo "$RESULT" | cut -d'|' -f2-)

if [ "$HTTP_CODE" -eq 200 ]; then
    PRODUCT_COUNT=$(echo "$BODY" | grep -o '"_id"' | wc -l)
    echo -e "${GREEN}✅ Productos obtenidos${NC}"
    echo "   Productos encontrados: $PRODUCT_COUNT"
    
    # Extraer primer producto ID si existe
    FIRST_PRODUCT_ID=$(echo "$BODY" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
    if [ -n "$FIRST_PRODUCT_ID" ]; then
        echo "   Primer Product ID: $FIRST_PRODUCT_ID"
    fi
else
    echo -e "${RED}❌ Error obteniendo productos (HTTP $HTTP_CODE)${NC}"
fi

# ============================================
# 4. VER PERFIL PROPIO
# ============================================
echo -e "\n${BLUE}─── 4. VER PERFIL PROPIO ───${NC}"
RESULT=$(make_request "GET" "$BASE_URL/api/users/profile" "" "$TOKEN" "Obteniendo perfil")

HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
BODY=$(echo "$RESULT" | cut -d'|' -f2-)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Perfil obtenido${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null | head -15
else
    echo -e "${RED}❌ Error obteniendo perfil (HTTP $HTTP_CODE)${NC}"
fi

# ============================================
# 5. ACTUALIZAR PERFIL
# ============================================
echo -e "\n${BLUE}─── 5. ACTUALIZAR PERFIL ───${NC}"
UPDATE_DATA="{\"firstname\":\"Updated\",\"lastname\":\"Name\"}"
RESULT=$(make_request "POST" "$BASE_URL/api/users/profile" "$UPDATE_DATA" "$TOKEN" "Actualizando perfil")

HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
BODY=$(echo "$RESULT" | cut -d'|' -f2-)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Perfil actualizado${NC}"
else
    echo -e "${RED}❌ Error actualizando perfil (HTTP $HTTP_CODE)${NC}"
fi

# ============================================
# 6. VER CARRITO PROPIO
# ============================================
echo -e "\n${BLUE}─── 6. VER CARRITO PROPIO ───${NC}"
RESULT=$(make_request "GET" "$BASE_URL/api/carts/$CART_ID" "" "" "Obteniendo carrito (público)")

HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
BODY=$(echo "$RESULT" | cut -d'|' -f2-)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Carrito obtenido${NC}"
else
    echo -e "${RED}❌ Error obteniendo carrito (HTTP $HTTP_CODE)${NC}"
fi

# ============================================
# 7. AGREGAR PRODUCTO AL CARRITO
# ============================================
if [ -n "$FIRST_PRODUCT_ID" ]; then
    echo -e "\n${BLUE}─── 7. AGREGAR PRODUCTO AL CARRITO ───${NC}"
    ADD_PRODUCT_DATA="{\"productId\":\"$FIRST_PRODUCT_ID\",\"quantity\":1}"
    RESULT=$(make_request "POST" "$BASE_URL/api/carts/$CART_ID" "$ADD_PRODUCT_DATA" "$TOKEN" "Agregando producto al carrito")

    HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
    BODY=$(echo "$RESULT" | cut -d'|' -f2-)

    if [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✅ Producto agregado al carrito${NC}"
    else
        echo -e "${RED}❌ Error agregando producto (HTTP $HTTP_CODE)${NC}"
        echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    fi
fi

# ============================================
# 7.5. FINALIZAR COMPRA Y GENERAR TICKET
# ============================================
if [ -n "$CART_ID" ]; then
    echo -e "\n${BLUE}─── 7.5. FINALIZAR COMPRA Y GENERAR TICKET ───${NC}"
    RESULT=$(make_request "GET" "$BASE_URL/api/carts/$CART_ID/purchase" "" "$TOKEN" "Finalizando compra y generando ticket")

    HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
    BODY=$(echo "$RESULT" | cut -d'|' -f2-)

    if [ "$HTTP_CODE" -eq 200 ]; then
        TICKET_CODE=$(echo "$BODY" | grep -o '"code":"[^"]*' | cut -d'"' -f4)
        TICKET_AMOUNT=$(echo "$BODY" | grep -o '"amount":[0-9.]*' | cut -d':' -f2)
        TICKET_PURCHASER=$(echo "$BODY" | grep -o '"purchaser":"[^"]*' | cut -d'"' -f4)
        echo -e "${GREEN}✅ Compra finalizada exitosamente${NC}"
        echo "   Ticket Code: $TICKET_CODE"
        echo "   Amount: $TICKET_AMOUNT"
        echo "   Purchaser: $TICKET_PURCHASER"
        echo "$BODY" | python3 -m json.tool 2>/dev/null | head -20
    else
        echo -e "${YELLOW}⚠️  Error finalizando compra (HTTP $HTTP_CODE)${NC}"
        echo -e "${YELLOW}   (Puede ser que el carrito esté vacío o no haya stock suficiente)${NC}"
        echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    fi
fi

# ============================================
# 8. INTENTAR CREAR PRODUCTO (DEBE FALLAR)
# ============================================
echo -e "\n${BLUE}─── 8. INTENTAR CREAR PRODUCTO (DEBE FALLAR) ───${NC}"
PRODUCT_DATA="{\"title\":\"Test Product\",\"description\":\"Test\",\"price\":100,\"stock\":10,\"category\":\"test\",\"code\":\"TEST${TIMESTAMP}\"}"
RESULT=$(make_request "POST" "$BASE_URL/api/products" "$PRODUCT_DATA" "$TOKEN" "Intentando crear producto (sin permisos)")

HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
BODY=$(echo "$RESULT" | cut -d'|' -f2-)

if [ "$HTTP_CODE" -eq 403 ] || [ "$HTTP_CODE" -eq 401 ]; then
    echo -e "${GREEN}✅ Correctamente rechazado (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ Debería haber sido rechazado pero obtuvo HTTP $HTTP_CODE${NC}"
fi

# ============================================
# 9. INTENTAR VER TODOS LOS USUARIOS (DEBE FALLAR)
# ============================================
echo -e "\n${BLUE}─── 9. INTENTAR VER TODOS LOS USUARIOS (DEBE FALLAR) ───${NC}"
RESULT=$(make_request "GET" "$BASE_URL/api/users" "" "$TOKEN" "Intentando ver todos los usuarios (sin permisos)")

HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
BODY=$(echo "$RESULT" | cut -d'|' -f2-)

if [ "$HTTP_CODE" -eq 403 ] || [ "$HTTP_CODE" -eq 401 ]; then
    echo -e "${GREEN}✅ Correctamente rechazado (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${RED}❌ Debería haber sido rechazado pero obtuvo HTTP $HTTP_CODE${NC}"
fi

# ============================================
# 10. LOGOUT
# ============================================
echo -e "\n${BLUE}─── 10. LOGOUT ───${NC}"
RESULT=$(make_request "GET" "$BASE_URL/api/users/logout" "" "$TOKEN" "Cerrando sesión")

HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
BODY=$(echo "$RESULT" | cut -d'|' -f2-)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Logout exitoso${NC}"
else
    echo -e "${RED}❌ Error en logout (HTTP $HTTP_CODE)${NC}"
fi

# ============================================
# RESUMEN
# ============================================
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ TEST COMPLETADO: Usuario Regular${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo "Email usado: $EMAIL"
echo "User ID: $USER_ID"
echo "Cart ID: $CART_ID"

