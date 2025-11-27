#!/bin/bash

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🧪 EJECUTANDO TODOS LOS TESTS${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"

chmod +x test_user_regular.sh
chmod +x test_user_premium.sh
chmod +x test_user_admin.sh

echo -e "\n${BLUE}1. Test Usuario Regular${NC}"
./test_user_regular.sh

echo -e "\n\n${BLUE}2. Test Usuario Premium${NC}"
./test_user_premium.sh

echo -e "\n\n${BLUE}3. Test Usuario Admin${NC}"
./test_user_admin.sh

echo -e "\n${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}✅ TODOS LOS TESTS COMPLETADOS${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"