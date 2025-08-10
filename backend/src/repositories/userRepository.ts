import { Prisma, User } from '@/config/client';
import prisma from '@/config/prisma';
import { FilterService } from '@/services';
import { PaginationMeta } from '@/types';
import { logger } from '@/utils/logger';

import { QueryUserDto } from '@shared/dto';
import { Role, Specialization } from '@shared/enums';

class UserRepository {
    private logger = logger.child({
        class: '[App][UserRepository]',
    });

    /**
     * Create a new user
     * @param user - The user to create
     * @returns The created user
     */
    async create(user: Prisma.UserCreateInput): Promise<User> {
        return prisma.user.create({
            data: {
                ...user,
                roles: [Role.USER],
            },
        });
    }

    /**
     * Update a user
     * @param id - The id of the user to update
     * @param user - The user to update
     * @returns The updated user
     */
    async update(id: string, user: Prisma.UserUpdateInput): Promise<User> {
        return prisma.user.update({
            where: { id },
            data: user,
        });
    }

    async updatePassword(id: string, password: string): Promise<User> {
        return prisma.user.update({
            where: { id },
            data: { password },
        });
    }

    /**
     * Delete a user
     * @param id - The id of the user to delete
     * @returns The deleted user
     */
    async delete(id: string): Promise<User> {
        return prisma.user.delete({
            where: { id },
        });
    }

    /**
     * Find all users
     * @param filters - The filters to apply
     * @param skip - The number of users to skip
     * @param take - The number of users to take
     * @returns The users
     */
    async findAll(
        filters: QueryUserDto,
        skip: number = 0,
        take: number = 10
    ): Promise<{
        data: User[];
        pagination: PaginationMeta;
    }> {
        const { search, role, ...otherFilters } = filters;

        const where: Prisma.UserWhereInput = {
            deletedAt: null,
        };

        if (search) {
            where.OR = [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { email: { contains: search } },
            ];
        }

        const baseQuery = FilterService.buildQuery(otherFilters);
        Object.assign(where, baseQuery);

        // Execute the queries
        const [data, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take,
            }),
            prisma.user.count({ where }),
        ]);

        const currentPage = Math.floor(skip / take) + 1;
        const totalPages = Math.ceil(total / take);

        return {
            data: data,
            pagination: {
                currentPage,
                totalPages,
                totalItems: total,
                nextPage: currentPage < totalPages ? currentPage + 1 : 0,
                previousPage: currentPage > 1 ? currentPage - 1 : 0,
                perPage: take,
            },
        };
    }

    /**
     * Find a user by its email
     * @param email - The email of the user
     * @returns The user found or null if no user is found
     */
    async findByEmail(email: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: {
                email,
            },
        });
    }

    /**
     * Find a user by its id
     * @param id - The id of the user to find
     * @returns The user found or null if no user is found
     */
    async findById(id: string): Promise<User | null> {
        return prisma.user.findUnique({
            where: { id },
        });
    }

    /**
     * Find users ordered by number of tickets (least to most) for a specific ticket type
     * @param ticketType - The type of ticket to filter by
     * @param skip - The number of users to skip
     * @param take - The number of users to take
     * @returns Users ordered by ticket count with pagination
     */
    async findUsersByTicketCount(
        specialty: Specialization,
        skip: number = 0,
        take: number = 10
    ): Promise<{
        data: User[];
        pagination: PaginationMeta;
    }> {
        try {
            // Get all consultants first
            const consultants = await prisma.user.findMany({
                where: {
                    deletedAt: null,
                    specialization: specialty
                },
            });

            const total = consultants.length;


            const currentPage = Math.floor(skip / take) + 1;
            const totalPages = Math.ceil(total / take);

            this.logger.info(`Found ${consultants.length} consultants ordered by ${specialty} ticket count`);

            return {
                data: consultants.map(consultant => ({
                    ...consultant,
                })),
                pagination: {
                    currentPage,
                    totalPages,
                    totalItems: total,
                    nextPage: currentPage < totalPages ? currentPage + 1 : 0,
                    previousPage: currentPage > 1 ? currentPage - 1 : 0,
                    perPage: take,
                },
            };
        } catch (error) {
            this.logger.error('Error finding users by ticket count:', error);
            throw error;
        }
    }

    
}

export const userRepository = new UserRepository();
