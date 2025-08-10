import { TicketDto } from '@shared/dto/ticketDto';
import { messageTransformer } from './messageTransformer';
import { TicketWithRelations } from '@/types';
import { userTransformer } from './userTransformer';
import { TicketStatus, TicketType } from '@shared/enums';
import { User } from '@/config/client';

class TicketTransformer {
    public toTicketDto(ticket: TicketWithRelations): TicketDto {
        return {
            id: ticket.id,
            title: ticket.title,
            description: ticket.description,
            type: ticket.type as TicketType,
            status: ticket.status as TicketStatus,
            specificData: ticket.specificData as Record<string, any>,
            createdAt: ticket.createdAt.toISOString(),
            clientId: ticket.clientId,
            consultantId: ticket.consultantId,
            client: userTransformer.toRestrictedUserDto(ticket.client as User),
            consultant: ticket.consultant ? userTransformer.toRestrictedUserDto(ticket.consultant as User) : null,
        };
    }

    public toTicketDtos(tickets: TicketWithRelations[]): TicketDto[] {
        return tickets.map((ticket) => this.toTicketDto(ticket));
    }

}

export const ticketTransformer = new TicketTransformer();
