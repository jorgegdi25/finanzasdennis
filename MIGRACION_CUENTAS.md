# Migración de Base de Datos - Cuentas Bancarias

## ⚠️ IMPORTANTE: Ejecutar la migración antes de usar la funcionalidad

La funcionalidad de cuentas bancarias está implementada, pero necesitas ejecutar la migración de base de datos para crear la tabla `Account` en Supabase.

## Opción 1: Usar Prisma DB Push (Recomendado para desarrollo)

```bash
npx prisma db push
```

Este comando sincroniza el schema de Prisma con la base de datos sin crear archivos de migración.

## Opción 2: Usar Prisma Migrate (Para producción)

```bash
npx prisma migrate dev --name add_accounts
```

Este comando crea un archivo de migración y lo aplica a la base de datos.

## Si tienes problemas con SSL

Si encuentras errores de certificado SSL al ejecutar los comandos, puedes:

1. **Temporalmente cambiar** `sslmode=require` a `sslmode=prefer` o `sslmode=no-verify` en el archivo `.env`
2. Ejecutar el comando de migración
3. Volver a cambiar a `sslmode=require` después

## Verificar que funcionó

Después de ejecutar la migración, deberías poder:

1. Acceder a `/accounts` desde el dashboard
2. Crear nuevas cuentas bancarias
3. Ver las cuentas en el dashboard

## Generar el cliente de Prisma

Si cambias el schema, siempre ejecuta:

```bash
npx prisma generate
```

Esto actualiza el cliente de Prisma con los nuevos modelos.
