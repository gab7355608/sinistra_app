import { logger } from '@/utils/logger';
import { ComputerVisionClient } from '@azure/cognitiveservices-computervision';
import { PredictionAPIClient as CustomVisionPredictionClient } from '@azure/cognitiveservices-customvision-prediction';
import { ApiKeyCredentials } from '@azure/ms-rest-js';

// Configuration Azure
interface AzureConfig {
  customVisionEndpoint: string;
  predictionKey: string;
  projectId: string;
  publishIterationName: string;
  cognitiveKey: string;
  cognitiveEndpoint: string;
}

// Interface pour les résultats d'analyse d'image
export interface ImageAnalysisResult {
  image: string;
  description: string;
  has_products: boolean;
  has_human: boolean;
  has_logo: boolean;
  tags: string;
  targeted_client: string;
  format: string;
}

// Interface pour les options de prédiction
export interface PredictionOptions {
  threshold?: number; // Seuil de confiance minimum (0-1)
  maxResults?: number; // Nombre maximum de résultats
}

// Interface pour l'image à analyser
export interface ImageInput {
  data: Buffer;
  contentType: string;
  fileName?: string;
}

/**
 * Service pour classifier des images avec Azure Custom Vision 
 * Utilise un modèle de classification (pas de détection d'objets)
 * pour analyser les dommages de véhicules
 */
class AzurService {
  private logger = logger.child({
    module: '[App][AzurService]',
  });

  private config: AzureConfig;
  private customVisionClient: CustomVisionPredictionClient;
  private computerVisionClient: ComputerVisionClient;

  constructor() {
    this.config = this.initializeConfig();
    this.initializeClients();
    
    this.logger.info('Azure services initialized', {
      projectId: this.config.projectId,
      publishIterationName: this.config.publishIterationName,
    });
  }

  /**
   * Initialise la configuration à partir des variables d'environnement
   */
  private initializeConfig(): AzureConfig {
    // Configuration basée uniquement sur les variables d'environnement
    const config = {
      customVisionEndpoint: process.env.AZURE_CUSTOM_VISION_ENDPOINT || 
        '',
      predictionKey: process.env.AZURE_PREDICTION_KEY || 
        '',
      projectId: process.env.AZURE_PROJECT_ID || 
        '',
      publishIterationName: process.env.AZURE_PUBLISH_ITERATION_NAME || 
        '',
      cognitiveKey: process.env.AZURE_COGNITIVE_KEY || 
        '',
      cognitiveEndpoint: process.env.AZURE_COGNITIVE_ENDPOINT || 
        ''
    };

    // Validation des configurations critiques
    if (!config.customVisionEndpoint || !config.predictionKey || !config.projectId || !config.cognitiveKey) {
      this.logger.error('Missing critical Azure configuration. Required environment variables: AZURE_CUSTOM_VISION_ENDPOINT, AZURE_PREDICTION_KEY, AZURE_PROJECT_ID, AZURE_COGNITIVE_KEY');
      throw new Error('Azure configuration is incomplete. Please check your environment variables.');
    }

    return config;
  }

  /**
   * Initialise les clients Azure
   */
  private initializeClients(): void {
    try {
      // Client Custom Vision pour les prédictions
      const customVisionCredentials = new ApiKeyCredentials({
        inHeader: {
          'Prediction-key': this.config.predictionKey
        }
      });
      
      this.customVisionClient = new CustomVisionPredictionClient(
        customVisionCredentials, 
        this.config.customVisionEndpoint
      );

      // Client Computer Vision pour les descriptions
      const computerVisionCredentials = new ApiKeyCredentials({
        inHeader: {
          'Ocp-Apim-Subscription-Key': this.config.cognitiveKey
        }
      });
      
      this.computerVisionClient = new ComputerVisionClient(
        computerVisionCredentials,
        this.config.cognitiveEndpoint
      );

      this.logger.info('Azure clients initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Azure clients:', error);
      throw new Error('Azure client initialization failed');
    }
  }

  /**
   * Upload et analyse d'une image avec Azure Custom Vision et Computer Vision
   */
  async uploadAndPredict(
    imageInput: ImageInput,
    options: PredictionOptions = {}
  ): Promise<{ [key: string]: number }> {
    try {
      this.logger.info('Starting image classification analysis', {
        fileName: imageInput.fileName,
        imageSize: imageInput.data.length,
      });

      // Classification avec Custom Vision (pas détection d'objets)
      const classificationResults = await this.customVisionClient.classifyImage(
        this.config.projectId,
        this.config.publishIterationName,
        imageInput.data
      );

   

      // Traitement des prédictions de classification
      const predictions: { [key: string]: number } = {};

      if (classificationResults.predictions) {
        for (const prediction of classificationResults.predictions) {
          if (prediction.tagName && prediction.probability !== undefined) {
            predictions[prediction.tagName] = prediction.probability;
          }
        }
      }

      return predictions;
    } catch (error) {
      this.logger.error('Error in image analysis:', error);
      throw error;
    }
  }
}

export const azurService = new AzurService();