#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8081"
TIMESTAMP=$(date +%s)
EMAIL="admin_test_${TIMESTAMP}@test.com"
PASSWORD="admin123456"
FIRSTNAME="Admin"
LASTNAME="Test"
AGE=30

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🔧 CREAR USUARIO ADMIN PARA PRUEBAS${NC}"
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
# 1. CREAR USUARIO NORMAL
# ============================================
echo -e "\n${BLUE}─── 1. CREANDO USUARIO NORMAL ───${NC}"
SIGNUP_DATA="{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\",\"firstname\":\"$FIRSTNAME\",\"lastname\":\"$LASTNAME\",\"age\":$AGE,\"confirm_password\":\"$PASSWORD\"}"

RESULT=$(make_request "POST" "$BASE_URL/signup" "$SIGNUP_DATA" "" "Registrando usuario")

HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
BODY=$(echo "$RESULT" | cut -d'|' -f2-)

if [ "$HTTP_CODE" -eq 201 ]; then
    USER_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    CART_ID=$(echo "$BODY" | grep -o '"cartId":"[^"]*' | cut -d'"' -f4)
    
    echo -e "${GREEN}✅ Usuario creado exitosamente${NC}"
    echo "   User ID: $USER_ID"
    echo "   Cart ID: $CART_ID"
else
    echo -e "${RED}❌ Error creando usuario (HTTP $HTTP_CODE)${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    exit 1
fi

# ============================================
# 2. LOGIN COMO ADMIN EXISTENTE
# ============================================
echo -e "\n${BLUE}─── 2. LOGIN COMO ADMIN EXISTENTE ───${NC}"
ADMIN_EMAIL_DEFAULT="ezequiel_g@test.com"
echo -e "${YELLOW}💡 Usando admin por defecto: $ADMIN_EMAIL_DEFAULT${NC}"
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
    echo -e "${GREEN}✅ Login como admin exitoso${NC}"
else
    echo -e "${RED}❌ Error en login admin (HTTP $HTTP_CODE)${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    exit 1
fi

# ============================================
# 3. CONVERTIR USUARIO A ADMIN
# ============================================
echo -e "\n${BLUE}─── 3. CONVIRTIENDO USUARIO A ADMIN ───${NC}"
ADMIN_DATA="{\"admin\":\"true\"}"

RESULT=$(make_request "POST" "$BASE_URL/api/users/admin/$USER_ID" "$ADMIN_DATA" "$ADMIN_TOKEN" "Cambiando usuario a admin")

HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
BODY=$(echo "$RESULT" | cut -d'|' -f2-)

if [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Usuario convertido a admin exitosamente${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null | head -10
else
    echo -e "${RED}❌ Error convirtiendo usuario a admin (HTTP $HTTP_CODE)${NC}"
    echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"
    exit 1
fi

# ============================================
# 4. VERIFICAR QUE ES ADMIN
# ============================================
echo -e "\n${BLUE}─── 4. VERIFICANDO QUE ES ADMIN ───${NC}"
LOGIN_DATA="{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}"
RESULT=$(make_request "POST" "$BASE_URL/login" "$LOGIN_DATA" "" "Login como nuevo admin")

HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
BODY=$(echo "$RESULT" | cut -d'|' -f2-)

if [ "$HTTP_CODE" -eq 200 ]; then
    NEW_ADMIN_TOKEN=$(echo "$BODY" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Login exitoso${NC}"
    
    # Verificar perfil
    RESULT=$(make_request "GET" "$BASE_URL/api/users/profile" "" "$NEW_ADMIN_TOKEN" "Verificando perfil admin")
    HTTP_CODE=$(echo "$RESULT" | cut -d'|' -f1 | tr -d '[:space:]')
    BODY=$(echo "$RESULT" | cut -d'|' -f2-)
    
    if [ "$HTTP_CODE" -eq 200 ]; then
        ADMIN_STATUS=$(echo "$BODY" | grep -o '"admin":[^,}]*' | cut -d':' -f2 | tr -d ' ')
        if [ "$ADMIN_STATUS" = "true" ]; then
            echo -e "${GREEN}✅ Confirmado: Usuario es admin${NC}"
        else
            echo -e "${YELLOW}⚠️  Usuario no es admin aún (admin: $ADMIN_STATUS)${NC}"
        fi
    fi
else
    echo -e "${RED}❌ Error en login (HTTP $HTTP_CODE)${NC}"
fi

# ============================================
# RESUMEN
# ============================================
echo -e "\n${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ USUARIO ADMIN CREADO EXITOSAMENTE${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Credenciales del nuevo admin:${NC}"
echo "   Email: $EMAIL"
echo "   Password: $PASSWORD"
echo "   User ID: $USER_ID"
echo "   Cart ID: $CART_ID"
echo ""
echo -e "${YELLOW}💡 Puedes usar estas credenciales en los tests${NC}"
echo -e "${YELLOW}   O actualizar config_test.sh con estos valores${NC}"

