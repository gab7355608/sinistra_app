import { Prisma } from '@/config/client';
import prisma from '@/config/prisma';
import { FilterService } from '@/services';
import { PaginationMeta, TicketWithRelations } from '@/types';
import { logger } from '@/utils/logger';
import { FindTicketsSchema } from '@shared/dto/ticketDto';
import { TicketStatus } from '@shared/enums';

export const ticketInclude = {
    client: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
        },
    },
    consultant: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
        },
    },
};

class TicketRepository {
    private logger = logger.child({
        class: '[App][TicketRepository]',
    });

    async create(data: Prisma.TicketCreateInput): Promise<TicketWithRelations> {
        return prisma.ticket.create({
            data: {
                ...data,
            },
            include: ticketInclude,
        });
    }

    async update(id: string, data: Prisma.TicketUpdateInput): Promise<TicketWithRelations> {
        return prisma.ticket.update({
            where: { id },
            data,
            include: ticketInclude,
        });
    }

    async delete(id: string): Promise<TicketWithRelations> {
        return prisma.ticket.delete({
            where: { id },
            include: ticketInclude,
        });
    }

    async findById(id: string): Promise<TicketWithRelations | null> {
        return prisma.ticket.findUnique({
            where: { id },
            include: ticketInclude,
        });
    }

 
    async assignConsultant(ticketId: string, consultantId: string): Promise<TicketWithRelations> {
        return prisma.ticket.update({
            where: { id: ticketId },
            data: { 
                consultantId,
                status: TicketStatus.IN_PROGRESS,
            },
            include: ticketInclude,
        });
    }

    async findAll(
        filters: FindTicketsSchema = {},
        skip: number = 0,
        take: number = 10
    ): Promise<{
        data: TicketWithRelations[];
        pagination: PaginationMeta;
    }> {
        const { search, type, status, clientId, consultantId, ...otherFilters } = filters;

        const where: Prisma.TicketWhereInput = {};

        // Recherche textuelle
        if (search) {
            where.OR = [
                { title: { contains: search } },
                { description: { contains: search } },
                { client: { firstName: { contains: search } } },
                { client: { lastName: { contains: search } } },
                { client: { email: { contains: search } } },
            ];
        }

        // Filtres spécifiques
        if (type) {
            where.type = type;
        }

        if (status) {
            where.status = status;
        }

        if (clientId) {
            where.clientId = clientId;
        }

        if (consultantId) {
            where.consultantId = consultantId;
        }

        if (filters.sort) {
            const [field, order] = filters.sort.split(':');
            const trimmedField = field.trim();
            const trimmedOrder = (order || 'asc').trim();
            where.createdAt = { [trimmedField]: trimmedOrder };
        }

   

        // Filtres dynamiques avec FilterService
        const baseQuery = FilterService.buildQuery(otherFilters);
        Object.assign(where, baseQuery);

        // Tri
        let orderBy: Prisma.TicketOrderByWithRelationInput = { createdAt: 'desc' };
        if (filters.sort) {
            const [field, order] = filters.sort.split(':');
            const trimmedField = field.trim();
            const trimmedOrder = (order || 'asc').trim();
            orderBy = { [trimmedField]: trimmedOrder };
        }

        // Exécution des requêtes en parallèle
        const [data, total] = await Promise.all([
            prisma.ticket.findMany({
                where,
                skip,
                take,
                orderBy,
                include: ticketInclude,
            }),
            prisma.ticket.count({ where }),
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

}

export const ticketRepository = new TicketRepository();
