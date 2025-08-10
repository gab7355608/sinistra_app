import { messageController } from '@/controllers/messageController';
import { verifyAccess } from '@/middleware';
import { isAuthenticated } from '@/middleware/auth';
import { createSwaggerSchema } from '@/utils/swaggerUtils';
import { Role } from '@shared/enums';
import { FastifyInstance } from 'fastify';

export async function messageRoutes(fastify: FastifyInstance) {
    // GET ALL - Récupérer tous les messages (Admin/Consultant seulement)
    fastify.get('/', {
        schema: createSwaggerSchema(
            'Récupère tous les messages.',
            [
                { message: 'Messages récupérés avec succès', data: [], status: 200 },
                { message: 'Non autorisé', data: [], status: 401 },
                { message: 'Interdit', data: [], status: 403 },
                { message: 'Erreur lors de la récupération des messages', data: [], status: 500 },
            ],
            null,
            true,
            null,
            ['Messages']
        ),
        preHandler: [isAuthenticated],
        handler: messageController.getAllMessages,
    });

    // GET BY ID - Récupérer un message par ID
    fastify.get('/:id', {
        schema: createSwaggerSchema(
            'Récupère un message par ID.',
            [
                { message: 'Message récupéré avec succès', data: [], status: 200 },
                { message: 'Non autorisé', data: [], status: 401 },
                { message: 'Message non trouvé', data: [], status: 404 },
                { message: 'Erreur lors de la récupération du message', data: [], status: 500 },
            ],
            null,
            true,
            null,
            ['Messages']
        ),
        preHandler: [isAuthenticated],
        handler: messageController.getMessageById,
    });

    // DELETE - Supprimer un message
    fastify.delete('/:id', {
        schema: createSwaggerSchema(
            'Supprime un message.',
            [
                { message: 'Message supprimé avec succès', data: [], status: 204 },
                { message: 'Non autorisé', data: [], status: 401 },
                { message: 'Message non trouvé', data: [], status: 404 },
                { message: 'Erreur lors de la suppression du message', data: [], status: 500 },
            ],
            null,
            true,
            null,
            ['Messages']
        ),
        preHandler: [isAuthenticated, verifyAccess(Role.ADMIN)],
        handler: messageController.deleteMessage,
    });
}
