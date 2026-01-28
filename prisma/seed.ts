import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

/**
 * Seed script para crear usuario admin inicial
 * 
 * Ejecutar con: npm run db:seed
 */
async function main() {
  console.log('🌱 Iniciando seed...')

  // Datos del usuario admin
  const adminEmail = 'admin@example.com'
  const adminPassword = 'admin123'
  const adminName = 'Administrador'

  // Verificar si el usuario ya existe
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail },
  })

  if (existingUser) {
    console.log('⚠️  Usuario admin ya existe, saltando creación...')
    return
  }

  // Hashear contraseña
  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  // Crear usuario admin
  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      password: hashedPassword,
      name: adminName,
    },
  })

  console.log('✅ Usuario admin creado exitosamente:')
  console.log(`   Email: ${admin.email}`)
  console.log(`   Password: ${adminPassword}`)
  console.log(`   ID: ${admin.id}`)
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
