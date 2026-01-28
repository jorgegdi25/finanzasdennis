// Script de prueba para verificar la conexión a Account
// Ejecutar con: node test_accounts.js

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function test() {
  try {
    console.log('🔍 Probando conexión a la base de datos...')
    
    // Intentar obtener cuentas
    const accounts = await prisma.account.findMany({
      take: 1
    })
    
    console.log('✅ Conexión exitosa!')
    console.log(`📊 Cuentas encontradas: ${accounts.length}`)
    
    // Intentar crear una cuenta de prueba
    console.log('\n🔍 Probando creación de cuenta...')
    const testAccount = await prisma.account.create({
      data: {
        name: 'Cuenta de Prueba',
        balance: 1000,
        userId: 'test-user-id-123', // Esto fallará si no existe el usuario, pero probará la tabla
      }
    })
    console.log('✅ Cuenta creada:', testAccount)
    
    // Eliminar la cuenta de prueba
    await prisma.account.delete({
      where: { id: testAccount.id }
    })
    console.log('✅ Cuenta de prueba eliminada')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error('Detalles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

test()
