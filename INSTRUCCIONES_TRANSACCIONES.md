# 🔧 Instrucciones para Crear la Tabla Transaction

## El Problema
La página de transacciones no funciona porque la tabla `Transaction` no existe en la base de datos de Supabase.

## Solución Rápida: Ejecutar SQL en Supabase

### Opción 1: Usar SQL Editor en Supabase (MÁS FÁCIL)

1. Ve a tu dashboard de Supabase: https://app.supabase.com
2. Selecciona tu proyecto
3. En el menú lateral, haz clic en **SQL Editor**
4. Haz clic en **New query**
5. Copia y pega el contenido del archivo `create_transactions_table.sql`
6. Haz clic en **Run** (o presiona Ctrl+Enter)
7. Deberías ver un mensaje de éxito

### Opción 2: Usar Prisma DB Push (desde terminal)

Si prefieres usar Prisma desde la terminal:

```bash
# Asegúrate de estar en el directorio del proyecto
cd /Users/jorgegonzalezmejia/Desktop/finanzas-dennis

# Generar el cliente de Prisma primero
npx prisma generate

# Ejecutar el push (esto creará la tabla)
npx prisma db push
```

**Nota:** Si tienes problemas con SSL, temporalmente cambia en `.env`:
- De: `sslmode=no-verify`
- A: `sslmode=prefer`

Y luego vuelve a cambiarlo después.

### Opción 3: Usar Prisma Migrate

```bash
npx prisma migrate dev --name add_transactions
```

## Verificar que Funcionó

Después de ejecutar cualquiera de las opciones:

1. Recarga la página `/transactions` en tu navegador
2. Deberías poder ver la página sin errores
3. Intenta crear una nueva transacción

## Funcionalidades Implementadas

✅ Crear transacciones (ingresos y gastos)
✅ Editar transacciones existentes
✅ Eliminar transacciones
✅ Filtrar transacciones por cuenta
✅ Ver resumen de ingresos, gastos y balance neto
✅ Actualización automática del balance de las cuentas

## Si Aún Hay Errores

Revisa la consola del navegador (F12) y la terminal del servidor para ver el error específico.
