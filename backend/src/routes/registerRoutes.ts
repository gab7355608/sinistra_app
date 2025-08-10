import { FastifyInstance } from "fastify";
import { authRoutes } from "./authRoutes";
import { carPhotoRoutes } from "./carRoutes";
import { messageRoutes } from "./messageRoutes";
import { ticketRoutes } from "./ticketRoutes";
import { userRoutes } from "./userRoutes";

export async function registerRoutes(app: FastifyInstance): Promise<void> {
    await app.register(authRoutes, { prefix: '/api/auth' });
    await app.register(userRoutes, { prefix: '/api/users' });
    await app.register(ticketRoutes, { prefix: '/api/tickets' });
    await app.register(messageRoutes, { prefix: '/api/messages' });
    await app.register(carPhotoRoutes, { prefix: '/api/car-photos' });
}

