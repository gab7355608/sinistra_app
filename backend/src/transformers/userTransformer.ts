import { UserWithRelations } from '@/types';

import { BasicUserDto, UserRestrictedDto } from '@shared/dto';

import { Role } from '@shared/enums';
import { User } from '@/config/client';

class UserTransformer {
    public toUserDto(user: User): BasicUserDto {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
            roles: Array.isArray(user.roles) ? user.roles as Role[] : [user.roles] as Role[],
        };
    }

    public toRestrictedUserDto(user: User): UserRestrictedDto {
        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
        };
    }
}

export const userTransformer = new UserTransformer();
