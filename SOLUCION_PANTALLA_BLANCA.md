# 🔧 Solución: Pantalla en Blanco / Se Queda Cargando

## El Problema

La página se queda en blanco o mostrando "Cargando..." indefinidamente.

## Causas Posibles

1. **La API está tardando demasiado o colgándose**
2. **Error de JavaScript que bloquea el renderizado**
3. **Problema de conexión con la base de datos**
4. **El servidor no está respondiendo**

## Soluciones Implementadas

He agregado:

1. ✅ **Timeouts de seguridad** (10 segundos máximo)
2. ✅ **Timeouts en las peticiones fetch** (8 segundos)
3. ✅ **Indicadores de carga visibles** (spinner animado)
4. ✅ **Mensajes de error más claros**
5. ✅ **Manejo mejorado de errores de conexión**

## Pasos para Diagnosticar

### 1. Verifica la consola del navegador

1. Abre la consola (F12 → pestaña Console)
2. Busca errores en rojo
3. Copia cualquier error que aparezca

### 2. Verifica la terminal del servidor

1. Mira la terminal donde corre `npm run dev`
2. Busca errores en rojo
3. Verifica que el servidor esté corriendo

### 3. Verifica la pestaña Network

1. Abre las herramientas de desarrollador (F12)
2. Ve a la pestaña "Network"
3. Recarga la página
4. Busca peticiones que estén pendientes o que fallen
5. Revisa las peticiones a `/api/accounts` o `/api/transactions`

### 4. Verifica la conexión a la base de datos

El problema puede ser que:
- Supabase está en mantenimiento
- La conexión a la base de datos está fallando
- Las credenciales de la base de datos son incorrectas

## Soluciones Rápidas

### Solución 1: Recargar la página

1. Presiona `Cmd+Shift+R` (Mac) o `Ctrl+Shift+R` (Windows) para hard refresh
2. O cierra y vuelve a abrir la pestaña

### Solución 2: Verificar el servidor

1. Asegúrate de que el servidor esté corriendo
2. Verifica que no haya errores en la terminal
3. Si hay errores, compártelos para solucionarlos

### Solución 3: Verificar la base de datos

1. Ve a Supabase Dashboard
2. Verifica que no haya mantenimiento programado
3. Verifica que las tablas existan (Account, Transaction, User)

### Solución 4: Limpiar y reiniciar

1. Detén el servidor (Ctrl+C)
2. Limpia la caché:
   ```bash
   rm -rf .next
   ```
3. Reinicia el servidor:
   ```bash
   npm run dev
   ```

## Si el Problema Persiste

Comparte:

1. **¿Qué página específica se queda en blanco?** (accounts, transactions, dashboard)
2. **¿Qué aparece en la consola del navegador?** (F12 → Console)
3. **¿Qué aparece en la terminal del servidor?**
4. **¿Qué aparece en la pestaña Network?** (F12 → Network)
5. **¿Cuánto tiempo se queda cargando?** (¿más de 10 segundos?)

Con esta información podré identificar el problema exacto.
