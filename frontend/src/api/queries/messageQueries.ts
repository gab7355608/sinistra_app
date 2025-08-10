import { messageService } from '@/api/messageService';

import { FindMessagesSchema, MessageListDto } from '@shared/dto';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useGetAllMessages = (searchParams: FindMessagesSchema) => {
    return useQuery<MessageListDto[]>({
        queryKey: ['messages', searchParams],
        queryFn: async () => {
            const response = await messageService.getAllMessages(searchParams);
            return response.data;
        },
    });
};

export const useGetMessageById = (messageId: string) => {
    return useQuery<MessageListDto>({
        queryKey: ['messages', messageId],
        queryFn: async () => {
            const response = await messageService.getMessageById(messageId);
            return response.data;
        },
        enabled: !!messageId,
    });
};

export const useDeleteMessage = () => {
    const queryClient = useQueryClient();
    
    return useMutation<void, Error, string>({
        mutationFn: async (messageId: string) => {
            const response = await messageService.deleteMessage(messageId);
            return response.data;
        },
        onSuccess: () => {
            // Invalider le cache des messages après suppression
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
    });
};
