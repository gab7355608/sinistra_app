import { messageRepository, ticketRepository, userRepository } from '@/repositories';
import { PromptService } from '@/services/promptService';
import { ticketTransformer } from '@/transformers/ticketTransformer';
import { ApiResponse } from '@/types';
import { asyncHandler } from '@/utils/asyncHandler';
import { jsonResponse, notFoundResponse } from '@/utils/jsonResponse';
import { logger } from '@/utils/logger';
import { v4 as uuidv4 } from 'uuid';

import {
    ChatRequestDto,
    chatRequestSchema,
    ChatResponseDto,
    FindTicketsSchema,
    findTicketsSchema,
    IdParams,
    idSchema,
    TicketDto,
    UpdateTicketDto,
    updateTicketSchema
} from '@shared/dto';
import { MessageSender, Specialization, TicketStatus, TicketType } from '@shared/enums';

class TicketController {
    private logger = logger.child({
        module: '[App][TicketController]',
    });

    public getAll = asyncHandler<unknown, FindTicketsSchema, unknown, TicketDto[]>({
        querySchema: findTicketsSchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<TicketDto[] | void> | void> => {
            const { page = '1', limit = '10', search, type, status, clientId, consultantId, sort } = request.query;
            const skip = (Number(page) - 1) * Number(limit);

            const filters = { search, type, status, clientId, consultantId, sort };
            const result = await ticketRepository.findAll(filters, skip, Number(limit));
            const tickets = result.data.map((ticket) => ticketTransformer.toTicketDto(ticket));

            return jsonResponse(reply, 'Tickets récupérés avec succès', tickets, 200, result.pagination);
        },
    });

    public getById = asyncHandler<unknown, unknown, IdParams, TicketDto>({
        paramsSchema: idSchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<TicketDto | void> | void> => {
            const { id } = request.params;
            const ticket = await ticketRepository.findById(id);

            if (!ticket) {
                return notFoundResponse(reply, 'Ticket non trouvé');
            }

            const ticketDto = ticketTransformer.toTicketDto(ticket);
            return jsonResponse(reply, 'Ticket récupéré avec succès', ticketDto, 200);
        },
    });

    // public createTicket = asyncHandler<CreateTicketDto, unknown, unknown, TicketDto>({
    //     bodySchema: createTicketSchema,
    //     logger: this.logger,
    //     handler: async (request, reply): Promise<ApiResponse<TicketDto | void> | void> => {
    //         const ticket = await ticketRepository.create(request.body);
    //         const ticketDto = ticketTransformer.toTicketDto(ticket);

    //         return jsonResponse(reply, 'Ticket créé avec succès', ticketDto, 201);
    //     },
    // });

    public update = asyncHandler<UpdateTicketDto, unknown, IdParams, TicketDto>({
        bodySchema: updateTicketSchema,
        paramsSchema: idSchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<TicketDto | void> | void> => {
            const { id } = request.params;
            const ticketExists = await ticketRepository.findById(id);

            if (!ticketExists) {
                return notFoundResponse(reply, 'Ticket non trouvé');
            }

            // Transform specificData to handle null values for Prisma
            const updateData = {
                ...request.body,
                specificData: request.body.specificData === null ? undefined : request.body.specificData
            };
            
            const ticket = await ticketRepository.update(id, updateData);
            const ticketDto = ticketTransformer.toTicketDto(ticket);

            return jsonResponse(reply, 'Ticket mis à jour avec succès', ticketDto, 200);
        },
    });

    public delete = asyncHandler<unknown, unknown, IdParams>({
        paramsSchema: idSchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<void> | void> => {
            const { id } = request.params;
            const ticketExists = await ticketRepository.findById(id);

            if (!ticketExists) {
                return notFoundResponse(reply, 'Ticket non trouvé');
            }

            await ticketRepository.delete(id);
            return jsonResponse(reply, 'Ticket supprimé avec succès', undefined, 204);
        },
    });


    // Endpoints pour le chatbot
    public chat = asyncHandler<ChatRequestDto, unknown, unknown, ChatResponseDto>({
        bodySchema: chatRequestSchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<ChatResponseDto | void> | void> => {
            const { chatUuid, message } = request.body;
            const messages = await messageRepository.findAll({ chatUuid });

            const response = await PromptService.processMessage(message, messages.data);

            await messageRepository.create({
                chatUuid,
                content: response.response,
                senderType: MessageSender.CHATBOT,
                sender: {
                    connect: {
                        id: request.user.id
                    }
                },
          
            });

            try {

            if (response.ticketData.isComplete) {
                    
                console.log("RESPONSE : ", response);
                

                const users = await userRepository.findUsersByTicketCount(
                    response.ticketData.type as unknown as Specialization,
                );

                console.log("USERS : ", users);

                const consultant = users.data[0];

                console.log("CONSULTANT : ", consultant);

                const ticket = await ticketRepository.create({
                    type: response.ticketData.type as TicketType,
                    title: response.ticketData.title as string,
                    description: response.ticketData.description as string,
                    specificData: response.ticketData.specificData as Record<string, any>,
                    status: TicketStatus.OPEN,
                    client: {
                        connect: {
                            id: request.user.id
                        }
                    },
                    consultant: {
                        connect: {
                            id: consultant.id
                        }
                    }
                });

                console.log("TICKET : ", ticket);

                // Récupérer tous les messages du chat et les lier au ticket créé
                const chatMessages = await messageRepository.findAll({ chatUuid });
                for (const message of chatMessages.data) {
                    await messageRepository.update(message.id, {
                        ticket: {
                            connect: {
                                id: ticket.id
                            }
                        }
                    });
                }
                

                return jsonResponse(reply, 'Ticket créé avec succès', {
                    chatUuid: chatUuid!,
                    isComplete: true,
                    nextQuestion: '',
                    response: `Votre ticket a été créé avec succès (ID: ${ticket.id})`,
                }, 201);
            }
        } catch (error) {
            console.log("ERROR : ", error);
            console.error(error);
        }


            return jsonResponse(reply, 'Message traité avec succès', {
                chatUuid: chatUuid!,
                isComplete: response.ticketData.isComplete,
                nextQuestion: response.nextQuestion || '',
                response: response.response,
            }, 200);

        },
    });

    public startChat = asyncHandler<unknown, unknown, unknown, ChatResponseDto>({
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<ChatResponseDto | void> | void> => {
            const response = await PromptService.startChat();
            const chatUuid = uuidv4();

            await messageRepository.create({
                chatUuid,
                content: response.response,
                senderType: MessageSender.CHATBOT,
                sender: {
                    connect: {
                        id: request.user.id
                    }
                },
            });
            return jsonResponse(reply, 'Conversation démarrée avec succès', {
                chatUuid,
                isComplete: response.ticketData.isComplete,
                nextQuestion: response.nextQuestion || '',
                response: response.response,
            }, 200);
        },
    });
}

export const ticketController = new TicketController();
