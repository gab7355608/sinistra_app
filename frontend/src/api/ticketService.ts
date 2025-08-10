import { api } from '@/api/interceptor';
import { ApiResponse } from '@/types';

import { ChatRequestDto, ChatResponseDto, FindTicketsSchema, TicketDto } from '@shared/dto';

class TicketService {
    private apiUrl = '/api/tickets';

    public async getAllTickets(params: FindTicketsSchema): Promise<ApiResponse<TicketDto[]>> {
        const queryParams = new URLSearchParams();
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());
        if (params.search) queryParams.append('search', params.search);
        if (params.type) queryParams.append('type', params.type);
        if (params.status) queryParams.append('status', params.status);
        if (params.clientId) queryParams.append('clientId', params.clientId);
        if (params.consultantId) queryParams.append('consultantId', params.consultantId);
        if (params.sort) queryParams.append('sort', params.sort);
        
        return api.fetchRequest(`${this.apiUrl}?${queryParams.toString()}`, 'GET', null, true);
    }

    public async getTicketById(ticketId: string): Promise<ApiResponse<TicketDto>> {
        return api.fetchRequest(`${this.apiUrl}/${ticketId}`, 'GET', null, true);
    }

    public async deleteTicket(ticketId: string): Promise<ApiResponse<void>> {
        return api.fetchRequest(`${this.apiUrl}/${ticketId}`, 'DELETE', null, true);
    }

    // Chatbot endpoints
    public async startChat(): Promise<ApiResponse<ChatResponseDto>> {
        return api.fetchRequest(`${this.apiUrl}/start-chat`, 'POST', {}, true);
    }

    public async sendMessage(chatData: ChatRequestDto): Promise<ApiResponse<ChatResponseDto>> {
        return api.fetchRequest(`${this.apiUrl}/chat`, 'POST', chatData, true);
    }
}

export const ticketService = new TicketService();
