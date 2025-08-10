import { querySchema } from '@shared/dto/commonDto';
import { userRestrictedSchema } from '@shared/dto/userDto';
import { TicketStatus, TicketType } from '@shared/enums';
import { Serialize } from '@shared/types/Serialize';
import { z } from 'zod';

// DTOs
export const createTicketSchema = z.object({
  title: z.string().min(1, "Le titre est obligatoire"),
  description: z.string().min(1, "La description est obligatoire"),
  type: z.nativeEnum(TicketType),
  specificData: z.record(z.any()).optional().nullable(),
  clientId: z.string().uuid(),
  consultantId: z.string().uuid().optional().nullable(),
});
export type CreateTicketSchema = z.infer<typeof createTicketSchema>;
export type CreateTicketDto = Serialize<CreateTicketSchema>;

export const ticketSchema = createTicketSchema.extend({
    id: z.string().uuid(),
    status: z.nativeEnum(TicketStatus),
    createdAt: z.string(),
    client: userRestrictedSchema,
    consultant: userRestrictedSchema.optional().nullable(),
   });
  export type TicketSchema = z.infer<typeof ticketSchema>;
  export type TicketDto = Serialize<TicketSchema>;


export const findTicketsSchema = querySchema.extend({
  type: z.nativeEnum(TicketType).optional(),
  status: z.nativeEnum(TicketStatus).optional(),
  clientId: z.string().uuid().optional(),
  consultantId: z.string().uuid().optional(),
  sort: z.string().optional(),
});
export type FindTicketsSchema = z.infer<typeof findTicketsSchema>;
export type FindTicketsDto = Serialize<FindTicketsSchema>;

export const updateTicketSchema = createTicketSchema.partial();
export type UpdateTicketSchema = z.infer<typeof updateTicketSchema>;
export type UpdateTicketDto = Serialize<UpdateTicketSchema>;

// Schema pour valider les transitions de statut
export const validateStatusTransition = (currentStatus: TicketStatus, newStatus: TicketStatus): boolean => {
  const transitions: Record<TicketStatus, TicketStatus[]> = {
    [TicketStatus.OPEN]: [TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED],
    [TicketStatus.IN_PROGRESS]: [TicketStatus.RESOLVED],
    [TicketStatus.RESOLVED]: [], // Pas de transition depuis RESOLVED
  };
  
  return transitions[currentStatus]?.includes(newStatus) || currentStatus === newStatus;
};
