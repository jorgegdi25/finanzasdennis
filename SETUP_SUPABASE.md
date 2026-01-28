# Configuración de Supabase

## Paso 1: Crear cuenta y proyecto en Supabase

1. Ve a https://supabase.com
2. Haz clic en "Start your project" o "Sign up"
3. Crea una cuenta (puedes usar GitHub, Google o email)
4. Una vez dentro, haz clic en "New Project"
5. Completa el formulario:
   - **Name**: `finanzas-dennis` (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña segura (¡GUÁRDALA BIEN!)
   - **Region**: Elige la más cercana (ej: `South America (São Paulo)`)
   - **Pricing Plan**: Free (suficiente para empezar)
6. Haz clic en "Create new project"
7. Espera 2-3 minutos mientras se crea el proyecto

## Paso 2: Obtener la Connection String

1. En el dashboard de Supabase, ve a **Settings** (icono de engranaje) en el menú lateral
2. Haz clic en **Database**
3. Busca la sección **Connection string**
4. Selecciona la pestaña **URI**
5. Copia la URL que aparece (algo como: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)
6. **IMPORTANTE**: Reemplaza `[YOUR-PASSWORD]` con la contraseña que creaste en el Paso 1
   - Ejemplo: Si tu password es `miPassword123`, la URL debería ser:
   - `postgresql://postgres:miPassword123@db.xxxxx.supabase.co:5432/postgres`

## Paso 3: Configurar el proyecto

1. Abre el archivo `.env` en la raíz del proyecto
2. Reemplaza la línea `DATABASE_URL` con la URL que copiaste (con tu password incluido)
3. Asegúrate de que termine con `?sslmode=require`
   - Ejemplo completo:
   ```
   DATABASE_URL="postgresql://postgres:miPassword123@db.xxxxx.supabase.co:5432/postgres?sslmode=require"
   ```

## Paso 4: Ejecutar migraciones y seed

Una vez configurado el `.env`, ejecuta estos comandos:

```bash
# 1. Generar el cliente de Prisma para PostgreSQL
npm run db:generate

# 2. Crear las tablas en Supabase
npm run db:migrate

# 3. Crear el usuario admin
npm run db:seed
```

## Paso 5: Verificar que funciona

1. Inicia el servidor: `npm run dev`
2. Ve a http://localhost:3000/login
3. Inicia sesión con:
   - Email: `admin@example.com`
   - Password: `admin123`

## Acceso para tu cliente

Tu cliente puede acceder a:
- **Panel de administración**: https://app.supabase.com (con las credenciales que le des)
- **Base de datos**: A través de Supabase Studio (interfaz web para ver datos)
- **Tu aplicación**: Cuando la despliegues (Vercel, Netlify, etc.)

## Seguridad

- **NUNCA** subas el archivo `.env` a GitHub
- El archivo `.env` ya está en `.gitignore` para protegerlo
- Comparte las credenciales de Supabase con tu cliente de forma segura (no por email público)

## Ayuda adicional

- Documentación de Supabase: https://supabase.com/docs
- Panel de Supabase: https://app.supabase.com
