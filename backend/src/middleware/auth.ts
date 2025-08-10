import { internalServerError, unauthorizedResponse } from '@/utils/jsonResponse';

import { User } from '@shared/dto';
import dotenv from 'dotenv';
import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from 'fastify';
import jwt from 'jsonwebtoken';

dotenv.config();

/**
 * Middleware to check if the user is authenticated
 * @param req - Fastify request
 * @param res - Fastify response
 * @param done - Fastify done function
 * @returns void
 */
export const isAuthenticated = (
    req: FastifyRequest,
    res: FastifyReply,
    done: HookHandlerDoneFunction
): void => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        unauthorizedResponse(res, 'Unauthorized');
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as User;
        req.user = decoded;
        done();
    } catch (error) {
        internalServerError(res, 'Internal Server Error');
        return;
    }
};

/**
 * Middleware to check if the token exists
 * @param req - Fastify request
 * @param res - Fastify response
 * @param done - Fastify done function
 * @returns void
 */
export const hasToken = (
    req: FastifyRequest,
    res: FastifyReply,
    done: HookHandlerDoneFunction
): void => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
        unauthorizedResponse(res, 'Unauthorized');
        return;
    } else {
        done();
    }
};

declare module 'fastify' {
    interface FastifyRequest {
        user: User;
    }
}
