import bcrypt from 'bcryptjs';

import { PrismaClient } from '../src/config/client';
import { fakerUser, users } from '../src/fixtures';

const prisma = new PrismaClient();

async function cleanDatabase() {
    await prisma.token.deleteMany();
    await prisma.user.deleteMany();
}

async function main() {
    await cleanDatabase();

    for (const user of users) {
        await prisma.user.create({
            data: {
                ...user,
                password: await bcrypt.hash(user.password, 10),
            },
        });
    }

    for (let i = 0; i < 50; i++) {
        await prisma.user.create({
            data: {
                ...fakerUser(),
                password: await bcrypt.hash(fakerUser().password, 10),
            },
        });
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
