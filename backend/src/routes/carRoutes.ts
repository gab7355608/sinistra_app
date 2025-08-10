import { carPhotoController } from '@/controllers/carPhotoController';
import { createSwaggerSchema } from '@/utils/swaggerUtils';

import { FastifyInstance } from 'fastify';

export async function carPhotoRoutes(fastify: FastifyInstance) {
    // Upload et analyse d'image de véhicule
    fastify.post('/', {
        schema: createSwaggerSchema(
            'Upload et analyse d\'une image de véhicule avec Azure Custom Vision.',
            [
                { message: 'Image analysée avec succès', data: [], status: 200 },
                { message: 'Données invalides', data: [], status: 400 },
                { message: 'Type de fichier non supporté', data: [], status: 400 },
                {
                    message: 'Erreur lors de l\'analyse de l\'image',
                    data: [],
                    status: 500,
                }
            ],
            null, // Le schéma de body sera géré par multipart
            false,
            null,
            ['Car Photo Analysis']
        ),
        handler: carPhotoController.uploadImage,
    });
}
