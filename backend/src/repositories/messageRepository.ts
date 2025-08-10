import { Message, Prisma } from '@/config/client';
import prisma from '@/config/prisma';
import { FilterService } from '@/services';
import { PaginationMeta } from '@/types';
import { logger } from '@/utils/logger';
import { FindMessagesSchema } from '@shared/dto/messageDto';
import { MessageSender } from '@shared/enums';

class MessageRepository {
    private logger = logger.child({
        class: '[App][MessageRepository]',
    });

    async create(data: Prisma.MessageCreateInput): Promise<Message> {
        return prisma.message.create({
            data,
        });
    }

    async update(id: string, data: Prisma.MessageUpdateInput): Promise<Message> {
        return prisma.message.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<Message> {
        return prisma.message.delete({
            where: { id },
        });
    }

    async findById(id: string): Promise<Message | null> {
        return prisma.message.findUnique({
            where: { id },
            include: {
                ticket: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        status: true,
                    },
                },
            },
        });
    }


    async findAll(
        filters: FindMessagesSchema = {},
        skip: number = 0,
        take: number = 10
    ): Promise<{
        data: Message[];
        pagination: PaginationMeta;
    }> {
        const { ticketId, sender, chatUuid, ...otherFilters } = filters;

        const where: Prisma.MessageWhereInput = {};

        // Filtres spécifiques
        if (ticketId) {
            where.ticketId = ticketId;
        }

        if (sender) {
            where.senderType = sender as MessageSender;
        }

        if (chatUuid) {
            where.chatUuid = chatUuid;
        }

        // Relations à inclure
        const include: Prisma.MessageInclude = {
            ticket: {
                select: {
                    id: true,
                    title: true,
                    type: true,
                    status: true,
                },
            },
        };

        // Filtres dynamiques avec FilterService
        const baseQuery = FilterService.buildQuery(otherFilters);
        Object.assign(where, baseQuery);

        // Tri
        let orderBy: Prisma.MessageOrderByWithRelationInput = { createdAt: 'desc' };
        if (filters.sort) {
            const [field, order] = filters.sort.split(':');
            const trimmedField = field.trim();
            const trimmedOrder = (order || 'asc').trim();
            orderBy = { [trimmedField]: trimmedOrder };
        }

        // Exécution des requêtes en parallèle
        const [data, total] = await Promise.all([
            prisma.message.findMany({
                where,
                skip,
                take,
                orderBy,
                include,
            }),
            prisma.message.count({ where }),
        ]);

        // Métadonnées de pagination
        const currentPage = Math.floor(skip / take) + 1;
        const totalPages = Math.ceil(total / take);

        return {
            data,
            pagination: {
                currentPage,
                totalPages,
                totalItems: total,
                nextPage: currentPage < totalPages ? currentPage + 1 : 0,
                previousPage: currentPage > 1 ? currentPage - 1 : 0,
                perPage: take,
            },
        };
    }

    async getMessageCountByTicketId(ticketId: string): Promise<number> {
        return prisma.message.count({
            where: { ticketId },
        });
    }

    async getLastMessagesByTicketIds(ticketIds: string[]): Promise<Message[]> {
        return prisma.message.findMany({
            where: {
                ticketId: { in: ticketIds },
            },
            orderBy: { createdAt: 'desc' },
            distinct: ['ticketId'],
        });
    }

    async deleteMessagesByTicketId(ticketId: string): Promise<Prisma.BatchPayload> {
        return prisma.message.deleteMany({
            where: { ticketId },
        });
    }
}

export const messageRepository = new MessageRepository();
