# TP2-Proyecto
Proyecto final TP2

- RUTAS
- CONTROLLERS
- ENTRY POINT
- AUTH MIDDLEWARES

## Autenticación JWT

Este proyecto utiliza JSON Web Tokens (JWT) para la autenticación de usuarios en las APIs.

### Configuración

Las variables de entorno necesarias para JWT están en el archivo `.env`:

```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
```

### Estructura

- **`src/utils/jwt.js`**: Utilidades para generar y verificar tokens JWT
- **`src/middlewares/auth/jwtAuth.js`**: Middleware de autenticación JWT

### Uso

#### Generar un Token

Para generar un token JWT, necesitas autenticar un usuario. El token contiene:
- `_id`: ID del usuario
- `email`: Email del usuario
- `admin`: Si es administrador
- `premium`: Si es usuario premium
- `cartId`: ID del carrito del usuario

#### Usar el Token en Requests

Una vez que tengas un token, debes incluirlo en el header `Authorization` de todas las requests protegidas:

```
Authorization: Bearer <tu-token-jwt>
```

#### Ejemplo con cURL

```bash
# Request protegida con JWT
curl http://localhost:8081/api/protected-route \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Ejemplo con JavaScript (fetch)

```javascript
fetch('http://localhost:8081/api/protected-route', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
```

### Middleware de Autenticación

#### `authenticateJWT`

Middleware que verifica el token JWT y carga el usuario en `req.user`. Si el token es inválido o no se proporciona, retorna un error 401.

**Uso:**
```javascript
const { authenticateJWT } = require("./src/middlewares/auth/jwtAuth");

app.get("/api/<rutaProtegida>", authenticateJWT, (req, res) => {
  // req.user está disponible aquí
  res.json({ user: req.user });
});
```

#### `optionalJWT`

Middleware opcional que carga el usuario si hay un token válido, pero no falla si no hay token.

**Uso:**
```javascript
const { optionalJWT } = require("./src/middlewares/auth/jwtAuth");

app.get("/api/public", optionalJWT, (req, res) => {
  // req.user puede estar definido o no
  if (req.user) {
    // Usuario autenticado
  } else {
    // Usuario no autenticado
  }
});
```

### Utilidades JWT

#### `generateToken(user)`

Genera un token JWT para un usuario.

```javascript
const { generateToken } = require("./src/utils/jwt");

const token = generateToken(user);
```

#### `verifyToken(token)`

Verifica y decodifica un token JWT. Lanza error si el token es inválido o expiró.

```javascript
const { verifyToken } = require("./src/utils/jwt");

try {
  const decoded = verifyToken(token);
  console.log(decoded); // { _id, email, admin, premium, ... }
} catch (error) {
  console.error("Token inválido:", error.message);
}
```

#### `extractTokenFromHeader(authHeader)`

Extrae el token del header Authorization.

```javascript
const { extractTokenFromHeader } = require("./src/utils/jwt");

const token = extractTokenFromHeader(req.headers.authorization);
```

### Respuestas de Error

Cuando el token es inválido o no se proporciona, el middleware retorna:

```json
{
  "success": false,
  "error": "No token provided. Authorization header required: Bearer <token>"
}
```

O si el token es inválido:

```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

### Notas

- Los tokens expiran según la configuración `JWT_EXPIRES_IN` (por defecto 24 horas)
- El token debe ser enviado en cada request protegida
- El token contiene información del usuario pero no datos sensibles como la contraseña
- Para mayor seguridad, cambia `JWT_SECRET` en producción
