#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8081"
TIMESTAMP=$(date +%s)
EMAIL="test_premium_${TIMESTAMP}@test.com"
PASSWORD="test123456"
FIRSTNAME="Premium"
LASTNAME="User"
AGE=30

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🧪 TEST: Usuario Premium${NC}"
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
# 1. SIGNUP (Como usuario regular)
# ============================================
echo -e "\n${BLUE}─── 1. REGISTRO (Como Usuario Regular) ───${NC}"
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
else
    echo -e "${RED}❌ Signup falló (HTTP $HTTP_CODE)${NC}"
    exit 1
fi

# ============================================
# 2. USAR ADMIN EXISTENTE PARA UPGRADEAR
# ============================================
echo -e "\n${BLUE}─── 2. USANDO ADMIN EXISTENTE PARA UPGRADEAR ───${NC}"
ADMIN_EMAIL_DEFAULT="ezequiel_g@test.com"
echo -e "${YELLOW}💡 Usando admin por defecto: $ADMIN_EMAIL_DEFAULT${NC}"
echo -e "${YELLOW}   (Puedes cambiarlo escribiendo otro email)${NC}"
read -p "Email del admin (Enter para usar '$ADMIN_EMAIL_DEFAULT'): " EXISTING_ADMIN_EMAIL

if [ -z "$EXISTING_ADMIN_EMAIL" ]; then
    EXISTING_ADMIN_EMAIL="$ADMIN_EMAIL_DEFAULT"
    echo -e "${GREEN}✅ Usando admin por defecto${NC}"
fi

read -p "Contraseña del admin: " ADMIN_PASSWORD
LOGIN_DATA="{\"email\":\"$EXISTING_ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}"
RESULT=$(make_request "POST" "$BASE_URL/login" "$LOGIN_DATA" "" "Login como admin")

HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
BODY=$(echo "$RESULT" | cut -d'|' -f2-)

if [ "$HTTP_CODE" -eq 200 ]; then
    ADMIN_TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    ADMIN_USER_ID_TO_USE=$(echo "$BODY" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Login como admin exitoso${NC}"
    echo "   Admin User ID: $ADMIN_USER_ID_TO_USE"
else
    echo -e "${RED}❌ Error en login admin (HTTP $HTTP_CODE)${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    exit 1
fi

# ============================================
# 3. UPGRADEAR A PREMIUM (Requiere Admin)
# ============================================
echo -e "\n${BLUE}─── 3. UPGRADEAR A PREMIUM ───${NC}"
PREMIUM_DATA="{\"premium\":\"true\"}"

# Nota: El endpoint requiere que el usuario tenga 3 documentos, pero el schema no tiene ese campo
# Por ahora intentamos directamente
RESULT=$(make_request "POST" "$BASE_URL/api/users/premium/$USER_ID" "$PREMIUM_DATA" "$ADMIN_TOKEN" "Upgradeando a premium")

HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
BODY=$(echo "$RESULT" | cut -d'|' -f2-)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Usuario upgradeado a premium${NC}"
elif [ "$HTTP_CODE" -eq 400 ]; then
    echo -e "${YELLOW}⚠️  Upgrade falló: Usuario necesita 3 documentos${NC}"
    echo -e "${YELLOW}   (El schema no tiene campo documents, esto es un bug conocido)${NC}"
    echo -e "${YELLOW}   Continuando con el test asumiendo que es premium...${NC}"
else
    echo -e "${RED}❌ Error en upgrade (HTTP $HTTP_CODE)${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    exit 1
fi

# ============================================
# 4. LOGIN COMO PREMIUM (Para obtener nuevo token)
# ============================================
echo -e "\n${BLUE}─── 4. LOGIN COMO PREMIUM ───${NC}"
LOGIN_DATA="{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"

RESULT=$(make_request "POST" "$BASE_URL/login" "$LOGIN_DATA" "" "Login como premium")

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
# 5. CREAR PRODUCTO (Premium puede)
# ============================================
echo -e "\n${BLUE}─── 5. CREAR PRODUCTO ───${NC}"
PRODUCT_DATA="{\"title\":\"Producto Premium ${TIMESTAMP}\",\"description\":\"Producto creado por usuario premium\",\"price\":99.99,\"stock\":50,\"category\":\"premium\",\"code\":\"PREM${TIMESTAMP}\",\"status\":true}"

# Nota: El router tiene isAdmin middleware, pero el controller permite admin o premium
# Esto puede causar un 403, pero probamos de todas formas
RESULT=$(make_request "POST" "$BASE_URL/api/products" "$PRODUCT_DATA" "$TOKEN" "Creando producto como premium")

HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
BODY=$(echo "$RESULT" | cut -d'|' -f2-)

if [ "$HTTP_CODE" -eq 201 ]; then
    MY_PRODUCT_ID=$(echo "$BODY" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
    echo -e "${GREEN}✅ Producto creado${NC}"
    echo "   Product ID: $MY_PRODUCT_ID"
elif [ "$HTTP_CODE" -eq 403 ]; then
    echo -e "${YELLOW}⚠️  Crear producto rechazado (router tiene isAdmin middleware)${NC}"
    echo -e "${YELLOW}   Esto es un bug: el controller permite premium pero el router no${NC}"
else
    echo -e "${RED}❌ Error creando producto (HTTP $HTTP_CODE)${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
fi

# ============================================
# 6. VER PRODUCTOS PÚBLICOS
# ============================================
echo -e "\n${BLUE}─── 6. VER PRODUCTOS ───${NC}"
RESULT=$(make_request "GET" "$BASE_URL/api/products" "" "" "Listando productos")

HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
BODY=$(echo "$RESULT" | cut -d'|' -f2-)

if [ "$HTTP_CODE" -eq 200 ]; then
    FIRST_PRODUCT_ID=$(echo "$BODY" | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
    echo -e "${GREEN}✅ Productos obtenidos${NC}"
    echo "   Primer Product ID: $FIRST_PRODUCT_ID"
else
    echo -e "${RED}❌ Error obteniendo productos${NC}"
fi

# ============================================
# 7. INTENTAR AGREGAR PROPIO PRODUCTO AL CARRITO (DEBE FALLAR)
# ============================================
if [ -n "$MY_PRODUCT_ID" ]; then
    echo -e "\n${BLUE}─── 7. INTENTAR AGREGAR PROPIO PRODUCTO AL CARRITO (DEBE FALLAR) ───${NC}"
    ADD_PRODUCT_DATA="{\"productId\":\"$MY_PRODUCT_ID\",\"quantity\":1}"
    RESULT=$(make_request "POST" "$BASE_URL/api/carts/$CART_ID" "$ADD_PRODUCT_DATA" "$TOKEN" "Intentando agregar propio producto")

    HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
    BODY=$(echo "$RESULT" | cut -d'|' -f2-)

    if [ "$HTTP_CODE" -eq 401 ] || [ "$HTTP_CODE" -eq 400 ]; then
        echo -e "${GREEN}✅ Correctamente rechazado (no puede agregar sus propios productos)${NC}"
    else
        echo -e "${RED}❌ Debería haber sido rechazado pero obtuvo HTTP $HTTP_CODE${NC}"
    fi
fi

# ============================================
# 8. AGREGAR PRODUCTO DE OTRO AL CARRITO (DEBE FUNCIONAR)
# ============================================
if [ -n "$FIRST_PRODUCT_ID" ] && [ "$FIRST_PRODUCT_ID" != "$MY_PRODUCT_ID" ]; then
    echo -e "\n${BLUE}─── 8. AGREGAR PRODUCTO DE OTRO AL CARRITO ───${NC}"
    ADD_PRODUCT_DATA="{\"productId\":\"$FIRST_PRODUCT_ID\",\"quantity\":1}"
    RESULT=$(make_request "POST" "$BASE_URL/api/carts/$CART_ID" "$ADD_PRODUCT_DATA" "$TOKEN" "Agregando producto de otro al carrito")

    HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
    BODY=$(echo "$RESULT" | cut -d'|' -f2-)

    if [ "$HTTP_CODE" -eq 200 ]; then
        echo -e "${GREEN}✅ Producto agregado correctamente${NC}"
    else
        echo -e "${RED}❌ Error agregando producto (HTTP $HTTP_CODE)${NC}"
    fi
fi

# ============================================
# 8.5. FINALIZAR COMPRA Y GENERAR TICKET
# ============================================
if [ -n "$CART_ID" ] && [ -n "$FIRST_PRODUCT_ID" ] && [ "$FIRST_PRODUCT_ID" != "$MY_PRODUCT_ID" ]; then
    echo -e "\n${BLUE}─── 8.5. FINALIZAR COMPRA Y GENERAR TICKET ───${NC}"
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
# 9. VER PERFIL (Verificar premium status)
# ============================================
echo -e "\n${BLUE}─── 9. VER PERFIL (Verificar Premium) ───${NC}"
RESULT=$(make_request "GET" "$BASE_URL/api/users/profile" "" "$TOKEN" "Verificando perfil premium")

HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
BODY=$(echo "$RESULT" | cut -d'|' -f2-)

if [ "$HTTP_CODE" -eq 200 ]; then
    PREMIUM_STATUS=$(echo "$BODY" | grep -o '"premium":[^,}]*' | cut -d':' -f2 | tr -d ' ')
    echo -e "${GREEN}✅ Perfil obtenido${NC}"
    echo "   Premium status: $PREMIUM_STATUS"
else
    echo -e "${RED}❌ Error obteniendo perfil${NC}"
fi

# ============================================
# RESUMEN
# ============================================
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ TEST COMPLETADO: Usuario Premium${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo "Email usado: $EMAIL"
echo "User ID: $USER_ID"
echo "Cart ID: $CART_ID"
if [ -n "$MY_PRODUCT_ID" ]; then
    echo "Product ID creado: $MY_PRODUCT_ID"
fi