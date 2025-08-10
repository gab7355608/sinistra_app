/**
 * Types pour l'analyse de photos de véhicules avec Azure Custom Vision
 */

export interface DamagePredictions {
    /** Dommage mineur (score 0-1) */
    minor?: number;
    /** Dommage modéré (score 0-1) */
    moderate?: number;
    /** Dommage sévère (score 0-1) */
    severe?: number;
    /** Autres types de dommages futurs */
    [key: string]: number | undefined;
}

export interface ImageUploadResponse {
    /** Nom du fichier uploadé */
    fileName: string;
    /** Type MIME de l'image */
    contentType: string;
    /** Taille du fichier en bytes */
    size: number;
    /** Prédictions de dommages avec scores de confiance */
    predictions: DamagePredictions;
}

/**
 * Helper function pour obtenir le niveau de dommage le plus probable
 */
export function getHighestDamageLevel(predictions: DamagePredictions): {
    level: keyof DamagePredictions;
    confidence: number;
} | null {
    let maxConfidence = 0;
    let maxLevel: keyof DamagePredictions | null = null;

    for (const [level, confidence] of Object.entries(predictions)) {
        if (confidence !== undefined && confidence > maxConfidence) {
            maxConfidence = confidence;
            maxLevel = level as keyof DamagePredictions;
        }
    }

    return maxLevel ? { level: maxLevel, confidence: maxConfidence } : null;
}

/**
 * Helper function pour formater le niveau de dommage en français
 */
export function formatDamageLevel(level: keyof DamagePredictions): string {
    const labels: Record<string, string> = {
        minor: 'Dommage mineur',
        moderate: 'Dommage modéré', 
        severe: 'Dommage sévère'
    };
    
    const levelStr = String(level);
    return labels[levelStr] || levelStr.charAt(0).toUpperCase() + levelStr.slice(1);
}