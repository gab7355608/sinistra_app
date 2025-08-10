import { messageRepository } from '@/repositories/messageRepository';
import { messageTransformer } from '@/transformers/messageTransformer';
import { ApiResponse } from '@/types';
import { asyncHandler } from '@/utils/asyncHandler';
import { jsonResponse, notFoundResponse } from '@/utils/jsonResponse';
import { logger } from '@/utils/logger';

import {
    IdParams,
    idSchema,
    MessageListDto,
    CreateMessageDto,
    FindMessagesSchema,
    findMessagesSchema,
    createMessageSchema,
    
} from '@shared/dto';

class MessageController {
    private logger = logger.child({
        module: '[App][MessageController]',
    });

    public getAllMessages = asyncHandler<unknown, FindMessagesSchema, unknown, MessageListDto[]>({
        querySchema: findMessagesSchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<MessageListDto[] | void> | void> => {
            const { page = '1', limit = '10', ticketId, sender, sort } = request.query;
            const skip = (Number(page) - 1) * Number(limit);

            const filters = { ticketId, sender, sort };
            const result = await messageRepository.findAll(filters, skip, Number(limit));
            const messages = result.data.map((message) => messageTransformer.toMessageListDto(message));

            return jsonResponse(reply, 'Messages récupérés avec succès', messages, 200, result.pagination);
        },
    });

    public getMessageById = asyncHandler<unknown, unknown, IdParams, MessageListDto>({
        paramsSchema: idSchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<MessageListDto | void> | void> => {
            const { id } = request.params;
            const message = await messageRepository.findById(id);

            if (!message) {
                return notFoundResponse(reply, 'Message non trouvé');
            }

            const messageDto = messageTransformer.toMessageDto(message);
            return jsonResponse(reply, 'Message récupéré avec succès', messageDto, 200);
        },
    });


    // public createMessage = asyncHandler<CreateMessageDto, unknown, unknown, MessageListDto>({
    //     bodySchema: createMessageSchema,
    //     logger: this.logger,
    //     handler: async (request, reply): Promise<ApiResponse<MessageListDto | void> | void> => {
    //         const message = await messageRepository.create(request.body);
    //         const messageDto = messageTransformer.toMessageDto(message);

    //         return jsonResponse(reply, 'Message créé avec succès', messageDto, 201);
    //     },
    // });



    public deleteMessage = asyncHandler<unknown, unknown, IdParams>({
        paramsSchema: idSchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<void> | void> => {
            const { id } = request.params;
            const messageExists = await messageRepository.findById(id);

            if (!messageExists) {
                return notFoundResponse(reply, 'Message non trouvé');
            }

            await messageRepository.delete(id);
            return jsonResponse(reply, 'Message supprimé avec succès', undefined, 204);
        },
    });


}

export const messageController = new MessageController();
