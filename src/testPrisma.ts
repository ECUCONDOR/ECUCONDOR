import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Intentar obtener todos los usuarios
    const users = await prisma.user.findMany();
    console.log('Usuarios encontrados:', users);

    // Crear un usuario de prueba
    const newUser = await prisma.user.create({
      data: {
        name: 'Usuario de Prueba',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      }
    });
    console.log('Usuario creado:', newUser);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();