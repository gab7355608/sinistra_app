import { api } from '@/api/interceptor';
import { ApiResponse } from '@/types';

import { FindMessagesSchema, MessageListDto } from '@shared/dto';

class MessageService {
    private apiUrl = '/api/messages';

    public async getAllMessages(params: FindMessagesSchema): Promise<ApiResponse<MessageListDto[]>> {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.ticketId) queryParams.append('ticketId', params.ticketId);
        if (params.sender) queryParams.append('sender', params.sender);
        if (params.sort) queryParams.append('sort', params.sort);
        
        return api.fetchRequest(`${this.apiUrl}?${queryParams.toString()}`, 'GET', null, true);
    }

    public async getMessageById(messageId: string): Promise<ApiResponse<MessageListDto>> {
        return api.fetchRequest(`${this.apiUrl}/${messageId}`, 'GET', null, true);
    }

    public async deleteMessage(messageId: string): Promise<ApiResponse<void>> {
        return api.fetchRequest(`${this.apiUrl}/${messageId}`, 'DELETE', null, true);
    }
}

export const messageService = new MessageService();
