import { azurService } from '@/services';
import { ApiResponse } from '@/types';
import { asyncHandler } from '@/utils/asyncHandler';
import { jsonResponse } from '@/utils/jsonResponse';
import { logger } from '@/utils/logger';
import { FastifyReply, FastifyRequest } from 'fastify';

// Interface pour la réponse d'upload d'image
interface ImageUploadResponse {
  fileName: string;
  contentType: string;
  size: number;
  predictions: { [key: string]: number };
}

// Interface pour la réponse de health check
interface HealthCheckResponse {
  message: string;
  testResult: { [key: string]: number };
  timestamp: string;
}

class CarPhotoController {
  private logger = logger.child({
    module: '[App][TestController]',
  });

  /**
   * Upload et analyse d'image avec Azure Custom Vision
   */
  public uploadImage = asyncHandler<unknown, unknown, unknown, ImageUploadResponse>({
    logger: this.logger,
    handler: async (request: any, reply: any): Promise<ApiResponse<ImageUploadResponse | void> | void> => {
      try {
        this.logger.info('Starting image upload process');
        
        // Vérification si un fichier est présent
        let data;
        try {
          data = await request.file({
            limits: {
              fileSize: 10 * 1024 * 1024, // 10MB max
            }
          });
        } catch (error) {
          this.logger.error('Error getting file from request:', error);
          
          // Méthode alternative : vérifier s'il y a des parts dans la requête
          const parts = request.parts();
          for await (const part of parts) {
            if (part.type === 'file' && part.fieldname === 'image') {
              data = part;
              break;
            }
          }
        }
        
        this.logger.info('File data received:', { 
          hasData: !!data, 
          filename: data?.filename,
          mimetype: data?.mimetype,
          fieldname: data?.fieldname
        });
        
        if (!data) {
          this.logger.error('No file data received in request');
          return reply.status(400).send({
            success: false,
            message: 'Aucun fichier image fourni. Vérifiez que le champ "image" contient bien un fichier.',
            data: {},
            status: 400,
            timestamp: new Date().toISOString()
          });
        }

        // Validation du type de fichier
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
        if (!data.mimetype || !allowedTypes.includes(data.mimetype)) {
          return reply.status(400).send({
            success: false,
            message: 'Type de fichier invalide. Seuls JPEG, PNG et GIF sont autorisés',
            data: {},
            status: 400,
            timestamp: new Date().toISOString()
          });
        }


        // Conversion du stream en buffer
        const buffer = await data.toBuffer();
        
        // Appel du service Azure pour l'analyse
        const predictions = await azurService.uploadAndPredict({
          data: buffer,
          contentType: data.mimetype,
          fileName: data.filename || 'uploaded_image'
        });

        const responseData: ImageUploadResponse = {
          fileName: data.filename || 'uploaded_image',
          contentType: data.mimetype,
          size: buffer.length,
          predictions
        };

        this.logger.info('Image analysis completed successfully', {
          fileName: responseData.fileName,
          predictionsCount: Object.keys(predictions).length
        });

        return jsonResponse(reply, 'Image analysée avec succès', responseData, 200);

      } catch (error) {
        console.log('error :', error);
        this.logger.error('Error in image upload and analysis:', error);
        return reply.status(500).send({
          success: false,
          message: 'Erreur lors de l\'analyse de l\'image',
          data: {},
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          status: 500,
          timestamp: new Date().toISOString()
        });
      }
    },
  });
}

export const carPhotoController = new CarPhotoController();
