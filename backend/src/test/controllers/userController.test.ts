import { userController } from '@/controllers';

import { fakeReply, fakeRequest } from '../prismaTestUtils';

test('should create a user', async () => {
    const users = await userController.getAllUsers(fakeRequest, fakeReply);

    expect(users).toBeDefined();
    expect(users.length).toBe(3);
});
