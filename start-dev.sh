#!/bin/bash

# Script para iniciar el servidor limpiando puertos ocupados

echo "🧹 Limpiando puertos 3000-3008..."

# Cerrar procesos en los puertos comunes (ignorar errores si no hay procesos)
kill -9 $(lsof -ti:3000,3001,3002,3003,3004,3005,3006,3007,3008) 2>/dev/null || true

echo "✅ Puertos limpiados"
echo "🚀 Iniciando servidor en puerto 3000..."
echo ""

# Iniciar el servidor
npm run dev
