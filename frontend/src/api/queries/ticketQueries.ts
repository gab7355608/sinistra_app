import { ticketService } from '@/api/ticketService';

import { ChatRequestDto, ChatResponseDto, FindTicketsSchema, TicketDto } from '@shared/dto';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetAllTickets = (searchParams: FindTicketsSchema) => {
    return useQuery<TicketDto[]>({
        queryKey: ['tickets', searchParams],
        queryFn: async () => {
            const response = await ticketService.getAllTickets(searchParams);
            return response.data;
        },
    });
};

export const useGetTicketById = (ticketId: string) => {
    return useQuery<TicketDto>({
        queryKey: ['tickets', ticketId],
        queryFn: async () => {
            const response = await ticketService.getTicketById(ticketId);
            return response.data;
        },
        enabled: !!ticketId,
    });
};

export const useDeleteTicket = () => {
    const queryClient = useQueryClient();
    
    return useMutation<void, Error, string>({
        mutationFn: async (ticketId: string) => {
            const response = await ticketService.deleteTicket(ticketId);
            return response.data;
        },
        onSuccess: () => {
            // Invalider le cache des tickets après suppression
            queryClient.invalidateQueries({ queryKey: ['tickets'] });
        },
    });
};

// Chatbot queries
export const useStartChat = () => {
    return useMutation<ChatResponseDto, Error, void>({
        mutationFn: async () => {
            const response = await ticketService.startChat();
            return response.data;
        },
    });
};

export const useSendMessage = () => {
    const queryClient = useQueryClient();
    
    return useMutation<ChatResponseDto, Error, ChatRequestDto>({
        mutationFn: async (chatData: ChatRequestDto) => {
            const response = await ticketService.sendMessage(chatData);
            return response.data;
        },
        onSuccess: (data) => {
            // Invalider le cache des tickets si un ticket a été créé
            if (data.isComplete) {
                queryClient.invalidateQueries({ queryKey: ['tickets'] });
            }
        },
    });
};
