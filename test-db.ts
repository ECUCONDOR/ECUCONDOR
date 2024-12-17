import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    const users = await prisma.user.findMany()
    console.log('Conexión exitosa!')
    console.log('Usuarios encontrados:', users.length)
  } catch (error) {
    console.error('Error al conectar:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
