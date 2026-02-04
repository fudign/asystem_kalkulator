require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updatePassword() {
  try {
    const password = 'admin';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Updating password for user: asystem');
    console.log('New password will be: admin');

    await prisma.user.update({
      where: { email: 'asystem' },
      data: { password: hashedPassword }
    });

    console.log('✓ Password updated successfully!');
    console.log('\nLogin credentials:');
    console.log('Email: asystem');
    console.log('Password: admin');

  } catch (error) {
    console.error('Error updating password:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword();
