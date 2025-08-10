import prisma from '@/config/prisma';
import { logger } from '@/utils/logger';

import { FastifyReply, FastifyRequest } from 'fastify';

export interface FastifyReplyTest extends FastifyReply {
    custom: {
        env: string;
    };
}

export const resetDatabase = async () => {
    try {
        // Nettoyer toutes les tables pertinentes
        await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
        await prisma.$executeRaw`TRUNCATE TABLE "Token" CASCADE`;
        // Ajoutez d'autres tables selon votre schéma

        logger.info('Base de données réinitialisée avec succès');
    } catch (error) {
        logger.error('Erreur lors de la réinitialisation de la base de données:', error);
        throw error;
    }
};

export const disconnectPrisma = async () => {
    try {
        await prisma.$disconnect();
        logger.info('Déconnexion de Prisma réussie');
    } catch (error) {
        logger.error('Erreur lors de la déconnexion de Prisma:', error);
        throw error;
    }
};

export const fakeRequest = {
    method: 'GET',
    url: '/users',
} as FastifyRequest;

export const fakeReply = {
    send: jest.fn(),
    status: jest.fn(),
    custom: {
        env: 'test',
    },
} as unknown as FastifyReplyTest;
