import prisma from '@/config/prisma';

import { faker } from '@faker-js/faker';
import { User } from '@prisma/client';
import { UserModel } from '@shared/types';
import 'module-alias/register';

import { userMock } from '../mocks/userMock';
import { disconnectPrisma } from '../prismaTestUtils';

afterAll(async () => {
    await disconnectPrisma();
});

test('create user', async () => {
    const email = faker.internet.email();

    const userModel = new UserModel({
        email: email,
        phone: faker.phone.number(),
        password: faker.internet.password(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        civility: 'M',
        birthDate: faker.date.birthdate().toISOString(),
        acceptNewsletter: true,
        roles: JSON.stringify(['ROLE_USER']),
    });
    const user = await prisma.user.create({ data: userModel as User });

    expect(user.email).toBe(email);
});

test('create multiple users', async () => {
    const userModels = userMock.map((user) => new UserModel(user));
    const users = await prisma.user.createMany({ data: userModels as User[] });

    expect(users.count).toBe(userModels.length);
});
