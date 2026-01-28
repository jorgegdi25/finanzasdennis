# 🔧 Solución: Error Foreign Key Constraint

## El Problema

Error: `Foreign key constraint violated: 'Account_userId_fkey'`

Esto significa que estás intentando crear una cuenta con un `userId` que **no existe** en la tabla `User`.

## Causas Posibles

1. **Usuario eliminado de la base de datos** pero la cookie de sesión sigue activa
2. **Cookie de sesión corrupta o inválida**
3. **Problema con la base de datos** (tabla User vacía o datos inconsistentes)

## Solución

### Opción 1: Cerrar sesión e iniciar sesión nuevamente (MÁS FÁCIL)

1. Haz clic en "Cerrar sesión" en la aplicación
2. Inicia sesión nuevamente con tus credenciales
3. Intenta crear la cuenta de nuevo

### Opción 2: Verificar que existe un usuario en la base de datos

1. Ve a Supabase Dashboard > SQL Editor
2. Ejecuta este query para ver los usuarios:
   ```sql
   SELECT id, email, name FROM "User";
   ```
3. Si no hay usuarios, necesitas crear uno:
   - Ve a `/login` en tu aplicación
   - Si no tienes cuenta, necesitas registrarte o crear un usuario manualmente

### Opción 3: Crear un usuario manualmente en Supabase

Si no tienes usuarios, puedes crear uno:

1. Ve a Supabase Dashboard > SQL Editor
2. Ejecuta (reemplaza con tus datos):
   ```sql
   -- Primero, hashea la contraseña (ejemplo: "password123")
   -- Necesitas usar bcrypt, pero para prueba puedes usar este hash de "password123":
   INSERT INTO "User" (id, email, password, name, "createdAt", "updatedAt")
   VALUES (
     gen_random_uuid()::text,
     'tu-email@ejemplo.com',
     '$2a$10$rOzJqZqZqZqZqZqZqZqZqOqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZqZq',
     'Tu Nombre',
     NOW(),
     NOW()
   );
   ```

   **Nota:** El hash de arriba es solo un ejemplo. Para producción, usa el sistema de registro/login de tu aplicación.

### Opción 4: Limpiar cookies y reiniciar

1. Abre las herramientas de desarrollador (F12)
2. Ve a Application/Storage > Cookies
3. Elimina todas las cookies de `localhost`
4. Recarga la página
5. Inicia sesión nuevamente

## Prevención

He mejorado el código para:
- ✅ Verificar que el usuario existe antes de crear la cuenta
- ✅ Mostrar un mensaje de error más claro
- ✅ Sugerir cerrar sesión e iniciar sesión nuevamente

## Verificación

Después de aplicar la solución:

1. Verifica que puedas iniciar sesión correctamente
2. Verifica que el dashboard muestre tu información
3. Intenta crear una cuenta nuevamente
