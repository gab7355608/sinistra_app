import { Token } from '@/config/client';
import prisma from '@/config/prisma';
import { tokenRepository } from '@/repositories/tokenRepository';

import { FastifyRequest } from 'fastify';
import { sign, verify } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

import { logger } from '../utils/logger';

class TokenService {
    private logger = logger.child({
        module: '[Nexelis][TokenService]',
    });

    /**
     * Find a token by its token
     * @param token - The token to find
     * @returns The found token or null if no token is found
     */
    async findByToken(token: string): Promise<Token | null> {
        return tokenRepository.findByToken(token);
    }

    /**
     * Delete a token by its id
     * @param id - The id of the token to delete
     * @returns The deleted token or null if no token is found
     */
    async deleteToken(id: string): Promise<Token | null> {
        return tokenRepository.delete(id);
    }

    /**
     * Generate a password reset token for a user
     * @param userId - The id of the user
     * @param ip - The ip of the user
     * @returns The password reset token
     */
    async generatePasswordResetToken(userId: string, ip: string): Promise<string> {
        await tokenRepository.deleteByUserAndType(userId, 'reset_password');

        const token = uuidv4();

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 2);

        await tokenRepository.create({
            token,
            ownedById: userId,
            type: 'reset_password',
            scopes: 'reset',
            deviceName: 'Password Reset',
            deviceIp: ip,
            expiresAt,
        });

        return token;
    }

    /**
     * Generate an invitation token
     * @param body - all the information of the invitation
     * @param userId - the id of the user who sends the invitation
     * @param ip - the ip of the user
     * @returns the invitation token
     */
    async generateInvitationRequestToken(
        body: any,
        userId: string,
        ip: string,
        request: FastifyRequest
    ): Promise<Token | null> {
        const agent = request.headers['user-agent'];
        const invitationToken = await prisma.token.create({
            data: {
                token: sign(body, process.env.JWT_SECRET as string, {
                    expiresIn: '7d',
                }),
                type: 'invitation_token',
                scopes: JSON.stringify(['read', 'write']),
                deviceName: agent ? agent.split(' ')[0] : 'Unknown',
                deviceIp: ip,
                ownedById: userId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        });
        return invitationToken;
    }

    async verifyTokenInvitationToken(token: string): Promise<boolean> {
        try {
            verify(token, process.env.JWT_SECRET as string);
            return true;
        } catch (error) {
            return false;
        }
    }
}

export const tokenService = new TokenService();
