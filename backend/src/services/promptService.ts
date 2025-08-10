import { logger } from '@/utils/logger';
import { TicketType } from '@shared/enums';
import { claudeService } from './claudeApiService';

// Interfaces pour les réponses structurées
interface ClaudeTicketData {
  type: TicketType | null;
  title: string | null;
  description: string | null;
  specificData: Record<string, any>;
  isComplete: boolean;
}

interface ClaudeResponse {
  response: string;
  ticketData: ClaudeTicketData;
  nextQuestion: string | null;
}

interface ParsedResponse {
  success: boolean;
  data?: ClaudeResponse;
  error?: string;
  rawResponse?: string;
}

export class PromptService {
  private static logger = logger.child({
    class: '[App][PromptService]',
  });

  private static basePrompt: string = `Tu es un assistant intelligent spécialisé dans la gestion de sinistres. 

RÈGLES IMPORTANTES :
1. Tu dois TOUJOURS répondre en format JSON avec cette structure exacte :
{
  "response": "ta réponse à l'utilisateur",
  "ticketData": {
    "type": "CAR_ACCIDENT" | "FIRE" | "THEFT_BURGLARY" | "WATER_DAMAGE" | null,
    "title": "titre généré automatiquement" | null,
    "description": "description complète du sinistre" | null,
    "specificData": {
      // Structure spécifique selon le type de sinistre
      // Voir les détails dans chaque prompt spécialisé
    },
    "isComplete": true | false
  },
  "nextQuestion": "prochaine question à poser" | null
}

2. Types de sinistres et leurs données spécifiques :
- ACCIDENT_VOITURE : date, lieu, faits, nombrePersonnes, immatriculation, tiers, blesses, degats
- INCENDIE : date, lieu, faits, nombrePersonnes, typeBien, pompiers, dommagesImportants, origineIncendie, degats
- VOL_CAMBRIOLAGE : date, lieu, faits, nombrePersonnes, plainte, numeroplainte, biensVoles, modeOperatoire, totalEstime
- DEGAT_EAUX : date, lieu, faits, nombrePersonnes, origineFuite, dommagesImportants, piecesTouchees, degats, interventionUrgence, degatsVoisins

3. Règles de génération automatique :
- Le titre : "Sinistre [TYPE] - [LIEU] - [DATE]"
- La description complète basée sur toutes les réponses collectées
- Tu marques isComplete: true seulement quand TOUTES les informations obligatoires sont collectées
- Utilise null pour les champs non renseignés, [] pour les tableaux vides

4. Tu restes professionnel, empathique et guidant tout au long de la conversation.`;

  // Fonction pour parser les réponses JSON de Claude
  private static parseClaudeResponse(rawResponse: string): ParsedResponse {
    try {
      // Nettoyer la réponse pour extraire le JSON
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          success: false,
          error: 'Aucun JSON trouvé dans la réponse',
          rawResponse
        };
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Valider la structure de base
      if (!parsed.response || typeof parsed.response !== 'string') {
        return {
          success: false,
          error: 'Champ "response" manquant ou invalide',
          rawResponse
        };
      }

      // Valider ticketData
      const ticketData = parsed.ticketData || {
        type: null,
        title: null,
        description: null,
        specificData: {},
        isComplete: false
      };

      // Valider le type si présent
      if (ticketData.type && !Object.values(TicketType).includes(ticketData.type)) {
        ticketData.type = null;
      }

      const claudeResponse: ClaudeResponse = {
        response: parsed.response,
        ticketData: {
          type: ticketData.type,
          title: ticketData.title,
          description: ticketData.description,
          specificData: ticketData.specificData || {},
          isComplete: ticketData.isComplete || false
        },
        nextQuestion: parsed.nextQuestion || null
      };

      return {
        success: true,
        data: claudeResponse
      };

    } catch (error) {
      PromptService.logger.error('Erreur lors du parsing de la réponse Claude:', error);
      return {
        success: false,
        error: `Erreur de parsing JSON: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
        rawResponse
      };
    }
  }

  // Fonction pour générer une réponse de secours
  private static createFallbackResponse(rawResponse: string, context?: string): ClaudeResponse {
    return {
      response: rawResponse || "Je rencontre un problème technique. Pouvez-vous reformuler votre demande ?",
      ticketData: {
        type: null,
        title: null,
        description: null,
        specificData: {},
        isComplete: false
      },
      nextQuestion: context === 'start' ? "Quel type de sinistre souhaitez-vous déclarer ?" : null
    };
  }

  // Cette fonction génère un prompt de base pour commencer une session de chat
  public static async startChat(): Promise<ClaudeResponse> {
    const prompt = `${PromptService.basePrompt} 
    
Commence la conversation en saluant le client et en lui demandant quel type de sinistre il souhaite déclarer.

RÉPONSE (FORMAT JSON OBLIGATOIRE) :`;
    
    try {
      const rawResponse = await claudeService.sendRequest(prompt);
      const parsed = PromptService.parseClaudeResponse(rawResponse);
      
      if (parsed.success && parsed.data) {
        return parsed.data;
      } else {
        PromptService.logger.warn('Parsing échoué pour startChat:', parsed.error);
        return PromptService.createFallbackResponse(rawResponse, 'start');
      }
    } catch (error) {
      PromptService.logger.error('Erreur dans startChat:', error);
      return PromptService.createFallbackResponse('', 'start');
    }
  }

  // Cette fonction génère des prompts pour collecter des informations en fonction du type de sinistre
  public static async generateSinistreQuestions(type: string): Promise<ClaudeResponse> {
    let questions: string;
    let specificDataFormat: string;
    
    switch(type) {
      case 'ACCIDENT_VOITURE':
        questions = `
          1. Quelle est la date de l'accident ? (format JJ/MM/AAAA)
          2. Où s'est-il produit ?
          3. Pouvez-vous décrire précisément les faits ?
          4. Combien de personnes ont été impliquées ?
          5. Quelle est l'immatriculation du véhicule concerné ?
          6. Y a-t-il un ou plusieurs tiers impliqués ? (oui/non)
          7. Y a-t-il eu des blessés ? (oui/non)
          8. Pouvez-vous décrire les dégâts du véhicule ?
        `;
        specificDataFormat = `
        "specificData": {
          "date": "JJ/MM/AAAA",
          "lieu": "lieu de l'accident",
          "faits": "description précise des faits",
          "nombrePersonnes": number,
          "immatriculation": "XX-XXX-XX",
          "tiers": boolean,
          "blesses": boolean,
          "degats": {
            "vehicule": "description des dégâts",
            "estimation": "montant estimé ou null"
          }
        }`;
        break;
      
      case 'INCENDIE':
        questions = `
          1. Quelle est la date de l'incendie ? (format JJ/MM/AAAA)
          2. Où a-t-il eu lieu ?
          3. Que s'est-il passé ?
          4. Combien de personnes ont été concernées ?
          5. Quel type de bien a été touché ? (maison, appartement, local pro…)
          6. Les pompiers sont-ils intervenus ? (oui/non)
          7. Les dommages sont-ils importants ? (oui/non)
          8. Quelle est l'origine supposée de l'incendie ?
          9. Quelles pièces ont été touchées ?
        `;
        specificDataFormat = `
        "specificData": {
          "date": "JJ/MM/AAAA",
          "lieu": "lieu de l'incendie",
          "faits": "description de ce qui s'est passé",
          "nombrePersonnes": number,
          "typeBien": "maison/appartement/local professionnel",
          "pompiers": boolean,
          "dommagesImportants": boolean,
          "origineIncendie": "électrique/gaz/autre",
          "degats": {
            "surface": "surface touchée en m² ou null",
            "pieces": ["salon", "cuisine"] ou [],
            "estimation": "montant estimé ou null"
          }
        }`;
        break;

      case 'VOL_CAMBRIOLAGE':
        questions = `
          1. Quelle est la date du vol ? (format JJ/MM/AAAA)
          2. Où a-t-il eu lieu ?
          3. Que s'est-il passé ?
          4. Combien de personnes étaient concernées ?
          5. Avez-vous déposé plainte ? (oui/non)
          6. Si oui, quel est le numéro de plainte ?
          7. Quels sont les biens volés ? (listez les objets avec leur valeur)
          8. Comment les voleurs sont-ils entrés ? (effraction, escalade, etc.)
        `;
        specificDataFormat = `
        "specificData": {
          "date": "JJ/MM/AAAA",
          "lieu": "lieu du vol",
          "faits": "description de ce qui s'est passé",
          "nombrePersonnes": number,
          "plainte": boolean,
          "numeroplainte": "numéro de plainte ou null",
          "biensVoles": [
            {
              "objet": "nom de l'objet",
              "marque": "marque ou null",
              "modele": "modèle ou null",
              "valeur": number
            }
          ],
          "modeOperatoire": "effraction/escalade/autre",
          "totalEstime": number
        }`;
        break;

      case 'DEGAT_EAUX':
        questions = `
          1. Quelle est la date du dégât ? (format JJ/MM/AAAA)
          2. Où a-t-il eu lieu ?
          3. Que s'est-il passé ?
          4. Combien de personnes sont concernées ?
          5. Quelle est l'origine supposée de la fuite ?
          6. Les dommages sont-ils importants ? (oui/non)
          7. Quelles pièces ont été touchées ?
          8. Y a-t-il eu une intervention d'urgence ?
          9. Y a-t-il des dégâts chez les voisins ?
        `;
        specificDataFormat = `
        "specificData": {
          "date": "JJ/MM/AAAA",
          "lieu": "lieu du dégât",
          "faits": "description de ce qui s'est passé",
          "nombrePersonnes": number,
          "origineFuite": "canalisation/toiture/appareil électroménager",
          "dommagesImportants": boolean,
          "piecesTouchees": ["salon", "cuisine"] ou [],
          "degats": {
            "type": ["mur", "sol", "mobilier"],
            "surface": "surface touchée en m² ou null",
            "estimation": "montant estimé ou null"
          },
          "interventionUrgence": boolean,
          "degatsVoisins": boolean
        }`;
        break;

      default:
        questions = 'Veuillez choisir un type de sinistre valide.';
        specificDataFormat = `
        "specificData": {
          "date": null,
          "lieu": null
        }`;
        break;
    }
    
    const prompt = `${PromptService.basePrompt}

Le client a choisi le type de sinistre "${type}". 
Voici les questions à poser dans l'ordre : ${questions}

IMPORTANT : Pour ce type de sinistre, utilise EXACTEMENT cette structure pour specificData :
${specificDataFormat}

Remplis les champs au fur et à mesure que tu collectes les informations.
- Utilise null pour les champs non encore renseignés
- Utilise des tableaux vides [] pour les listes non encore remplies
- Marque isComplete: true seulement quand TOUS les champs obligatoires sont remplis

Pose la première question en format JSON.

RÉPONSE (FORMAT JSON OBLIGATOIRE) :`;
    
    try {
      const rawResponse = await claudeService.sendRequest(prompt);
      const parsed = PromptService.parseClaudeResponse(rawResponse);
      
      if (parsed.success && parsed.data) {
        return parsed.data;
      } else {
        PromptService.logger.warn('Parsing échoué pour generateSinistreQuestions:', parsed.error);
        return PromptService.createFallbackResponse(rawResponse, 'questions');
      }
    } catch (error) {
      PromptService.logger.error('Erreur dans generateSinistreQuestions:', error);
      return PromptService.createFallbackResponse('', 'questions');
    }
  }

  // Fonction pour générer un récapitulatif et valider les informations
  public static async generateSummary(ticketData: any): Promise<ClaudeResponse> {
    const prompt = `${PromptService.basePrompt}

Voici les informations collectées pour le ticket :
- Type de sinistre : ${ticketData.type}
- Date : ${ticketData.date}
- Lieu : ${ticketData.lieu}
- Description : ${ticketData.description}
- Nombre de personnes impliquées : ${ticketData.nombrePersonnes}
(et les informations spécifiques selon le type de sinistre)

Génère un récapitulatif complet et demande confirmation pour créer le ticket.
Marque isComplete: true si toutes les informations sont présentes.

RÉPONSE (FORMAT JSON OBLIGATOIRE) :`;
    
    try {
      const rawResponse = await claudeService.sendRequest(prompt);
      const parsed = PromptService.parseClaudeResponse(rawResponse);
      
      if (parsed.success && parsed.data) {
        return parsed.data;
      } else {
        PromptService.logger.warn('Parsing échoué pour generateSummary:', parsed.error);
        return PromptService.createFallbackResponse(rawResponse, 'summary');
      }
    } catch (error) {
      PromptService.logger.error('Erreur dans generateSummary:', error);
      return PromptService.createFallbackResponse('', 'summary');
    }
  }

  // Nouvelle fonction pour traiter un message avec contexte
  public static async processMessage(message: string, context?: any): Promise<ClaudeResponse> {
    const contextString = context ? `\nContexte actuel : ${JSON.stringify(context, null, 2)}` : '';
    
    const prompt = `${PromptService.basePrompt}
    
${contextString}

Message du client : "${message}"

Traite ce message et réponds de manière appropriée selon l'état de la conversation.

RÉPONSE (FORMAT JSON OBLIGATOIRE) :`;
    
    try {
      const rawResponse = await claudeService.sendRequest(prompt);
      const parsed = PromptService.parseClaudeResponse(rawResponse);
      
      if (parsed.success && parsed.data) {
        return parsed.data;
      } else {
        PromptService.logger.warn('Parsing échoué pour processMessage:', parsed.error);
        return PromptService.createFallbackResponse(rawResponse);
      }
    } catch (error) {
      PromptService.logger.error('Erreur dans processMessage:', error);
      return PromptService.createFallbackResponse('');
    }
  }
}

