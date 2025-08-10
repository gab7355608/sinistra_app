import { MessageListDto } from '@shared/dto/messageDto';
import { Message } from '@/config/client';
import { userTransformer } from './userTransformer';

class MessageTransformer {
    public toMessageDto(message: Message): MessageListDto {
        return {
            id: message.id,
            content: message.content,
            createdAt: message.createdAt.toISOString(),
        };
    }

    public toMessageListDto(message: Message): MessageListDto {
        return {
            id: message.id,
            // sender: userTransformer.toUserDto(message.sender),
            content: message.content,
            createdAt: message.createdAt.toISOString(),
        };
    }

}

export const messageTransformer = new MessageTransformer();
