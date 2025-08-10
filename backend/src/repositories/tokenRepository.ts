import { Token } from '@/config/client';
import prisma from '@/config/prisma';
import { logger } from '@/utils/logger';

class TokenRepository {
    private logger = logger.child({
        class: '[App][TokenRepository]',
    });

    /**
     * Create a token
     * @param token - The token to create
     * @returns The created token
     */
    async create(token: Omit<Token, 'id' | 'createdAt' | 'updatedAt'>): Promise<Token> {
        return prisma.token.create({
            data: token,
        });
    }

    /**
     * Find a token by its id
     * @param id - The id of the token to find
     * @returns The token found or null if no token is found
     */
    async findById(id: string): Promise<Token | null> {
        return prisma.token.findUnique({
            where: {
                id,
            },
        });
    }

    /**
     * Delete a token by its id
     * @param id - The id of the token to delete
     * @returns The deleted token or null if no token is found
     */
    async delete(id: string): Promise<Token | null> {
        return prisma.token.delete({
            where: {
                id,
            },
        });
    }

    /*
     * Find a token by its token
     * @param token - The token to find
     * @returns The token found or null if no token is found
     */
    async findByToken(token: string): Promise<Token | null> {
        return prisma.token.findFirst({
            where: {
                token,
            },
        });
    }


    /**
     * Find all tokens by user id and type
     * @param userId - The id of the user to find tokens for
     * @param type - The type of tokens to find
     * @returns The tokens found
     */
    async findAllByUserId(userId: string): Promise<Token[]> {
        return prisma.token.findMany({
            where: {
                ownedById: userId,
            },
        });
    }


    /**
     * Delete a token by its id
     * @param id - The id of the token to delete
     * @returns The deleted token or null if no token is found
     */
    async deleteByUserAndType(userId: string, type: string): Promise<{ count: number }> {
        return prisma.token.deleteMany({
            where: {
                ownedById: userId,
                type,
            },
        });
    }

    /**
     * Find all tokens by user id and browser
     * @param userId - The id of the user to find tokens for
     * @param browser - The browser to find tokens for
     * @returns The tokens found
     */
    async findAllByUserIdAndBrowser(userId: string): Promise<Token[]> {
        return prisma.token.findMany({
            where: {
                ownedById: userId,
            },
            orderBy: {
                createdAt: 'desc',
            },
            distinct: ['browserName']

        });
    }
}

export const tokenRepository = new TokenRepository();
