import { ticketController } from '@/controllers/ticketController';
import { verifyAccess } from '@/middleware';
import { isAuthenticated } from '@/middleware/auth';
import { createSwaggerSchema } from '@/utils/swaggerUtils';
import { Role } from '@shared/enums';
import { FastifyInstance } from 'fastify';

export async function ticketRoutes(fastify: FastifyInstance) {
    // GET ALL - Récupérer tous les tickets
    fastify.get('/', {
        schema: createSwaggerSchema(
            'Récupère tous les tickets.',
            [
                { message: 'Tickets récupérés avec succès', data: [], status: 200 },
                { message: 'Non autorisé', data: [], status: 401 },
                { message: 'Erreur lors de la récupération des tickets', data: [], status: 500 },
            ],
            null,
            true,
            null,
            ['Tickets']
        ),
        preHandler: [isAuthenticated],
        handler: ticketController.getAll,
    });

    // GET BY ID - Récupérer un ticket par ID
    fastify.get('/:id', {
        schema: createSwaggerSchema(
            'Récupère un ticket par ID.',
            [
                { message: 'Ticket récupéré avec succès', data: [], status: 200 },
                { message: 'Non autorisé', data: [], status: 401 },
                { message: 'Ticket non trouvé', data: [], status: 404 },
                { message: 'Erreur lors de la récupération du ticket', data: [], status: 500 },
            ],
            null,
            true,
            null,
            ['Tickets']
        ),
        preHandler: [isAuthenticated],
        handler: ticketController.getById,
    });

    // DELETE - Supprimer un ticket
    fastify.delete('/:id', {
        schema: createSwaggerSchema(
            'Supprime un ticket.',
            [
                { message: 'Ticket supprimé avec succès', data: [], status: 204 },
                { message: 'Non autorisé', data: [], status: 401 },
                { message: 'Ticket non trouvé', data: [], status: 404 },
                { message: 'Erreur lors de la suppression du ticket', data: [], status: 500 },
            ],
            null,
            true,
            null,
            ['Tickets']
        ),
        preHandler: [isAuthenticated, verifyAccess(Role.ADMIN)],
        handler: ticketController.delete,
    });

    // CHATBOT ROUTES
    // POST /chat - Endpoint pour le chat
    fastify.post('/chat', {
        schema: createSwaggerSchema(
            'Envoie un message au chatbot.',
            [
                { message: 'Message traité avec succès', data: [], status: 200 },
                { message: 'Ticket créé avec succès', data: [], status: 201 },
                { message: 'Données invalides', data: [], status: 400 },
                { message: 'Non autorisé', data: [], status: 401 },
                { message: 'Erreur lors du traitement du message', data: [], status: 500 },
            ],
            null,
            true,
            null,
            ['Chatbot']
        ),
        preHandler: [isAuthenticated],
        handler: ticketController.chat,
    });

    // POST /start-chat - Démarrer une nouvelle conversation
    fastify.post('/start-chat', {
        schema: createSwaggerSchema(
            'Démarre une nouvelle conversation avec le chatbot.',
            [
                { message: 'Conversation démarrée avec succès', data: [], status: 200 },
                { message: 'Non autorisé', data: [], status: 401 },
                { message: 'Erreur lors du démarrage de la conversation', data: [], status: 500 },
            ],
            null,
            true,
            null,
            ['Chatbot']
        ),
        preHandler: [isAuthenticated],
        handler: ticketController.startChat,
    });
}
