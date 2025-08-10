import { Role } from '@shared/enums';
import { Serialize } from '@shared/types/Serialize';
import { z } from 'zod';
import { querySchema } from './commonDto';
import { Specialization } from '@shared/enums';

export const basicUserSchema = z.object({
    id: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string().email(),
    phone: z.string().min(10, 'Le numéro de téléphone doit contenir au moins 10 chiffres'),
    address: z.string().min(1, 'L\'adresse est requise'),
    birthDate: z.string().min(1, 'La date de naissance est requise'),
    roles: z.array(z.nativeEnum(Role)),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type BasicUserSchema = z.infer<typeof basicUserSchema>;
export type BasicUserDto = Serialize<BasicUserSchema>;

export const queryUserSchema = querySchema.extend({
    search: z.string().optional(),
    role: z.nativeEnum(Role).optional(),
});

export type QueryUserSchema = z.infer<typeof queryUserSchema>;
export type QueryUserDto = Serialize<QueryUserSchema>;

export const requestPasswordResetSchema = z.object({
    email: z.string().email("Format d'email invalide"),
});

export type requestPasswordResetSchema = z.infer<typeof requestPasswordResetSchema>;
export type requestPasswordResetDto = Serialize<requestPasswordResetSchema>;

export const updateUserSchema = z.object({
    email: z.string().email("Format d'email invalide"),
    firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
    lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    phone: z.string().min(10, 'Le numéro de téléphone doit contenir au moins 10 chiffres'),
    birthDate: z.string().min(1, 'La date de naissance est requise'),
    address: z.string().min(1, 'L\'adresse est requise'),
    password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
    specialization: z.nativeEnum(Specialization).optional(),
});

export type updateUserSchema = z.infer<typeof updateUserSchema>;
export type updateUserDto = Serialize<updateUserSchema>;


export const userRestrictedSchema = basicUserSchema.pick({
    id: true,
    firstName: true,
    lastName: true,
    email: true,
});

export type UserRestricted = z.infer<typeof userRestrictedSchema>;
export type UserRestrictedDto = Serialize<UserRestricted>;

