import { z } from 'zod';
import { userRestrictedSchema } from './userDto';
import { Serialize } from '@shared/types/Serialize';
import { MessageSender, TicketType } from '@shared/enums';
import { querySchema } from '@shared/dto/commonDto';

export const senderSchema = userRestrictedSchema.extend({
  sender: z.enum([MessageSender.CLIENT, MessageSender.CHATBOT, MessageSender.CONSULTANT]),
});

export const createMessageSchema = z.object({
  ticketId: z.string().uuid().optional(),
  senderId: z.string().uuid(),
  content: z.string().min(1, "Le contenu du message est obligatoire"),
});
export type CreateMessageSchema = z.infer<typeof createMessageSchema>;
export type CreateMessageDto = Serialize<CreateMessageSchema>;


export const messageListSchema = z.object({
  id: z.string().uuid(),
  sender: senderSchema,
  content: z.string(),
  createdAt: z.string(),
});
export type MessageListSchema = z.infer<typeof messageListSchema>;
export type MessageListDto = Serialize<MessageListSchema>;


export const findMessagesSchema = querySchema.extend({
  ticketId: z.string().uuid().optional(),
  sender: z.nativeEnum(MessageSender).optional(),
  sort: z.string().optional(),
  chatUuid: z.string().uuid().optional(),
});

export type FindMessagesSchema = z.infer<typeof findMessagesSchema>;
export type FindMessagesDto = Serialize<FindMessagesSchema>;


export const chatRequestSchema = z.object({
  chatUuid: z.string().uuid().optional(),
  message: z.string().min(1, "Le message ne peut pas être vide"),
});
export type ChatRequestSchema = z.infer<typeof chatRequestSchema>;
export type ChatRequestDto = Serialize<ChatRequestSchema>;

export const chatResponseSchema = z.object({
  chatUuid: z.string().uuid(),
  isComplete: z.boolean(),
  nextQuestion: z.string().optional(),
  response: z.string().min(1, "La réponse ne peut pas être vide"),
});
export type ChatResponseSchema = z.infer<typeof chatResponseSchema>;
export type ChatResponseDto = Serialize<ChatResponseSchema>;
