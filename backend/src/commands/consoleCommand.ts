import { logger } from '@/utils/logger';

export const main = () => {
    let date = new Date();
    let formattedDate = date.toLocaleString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
    logger.info(`🟩 ${formattedDate} | App Alive`);
};
