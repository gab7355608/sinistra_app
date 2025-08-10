import { Serialize } from '@shared/types/Serialize';
import { z } from 'zod';

export const Login = z.object({
    email: z.string().email(),
    password: z.string(),
    rememberMe: z.boolean().optional(),
});

export type Login = z.infer<typeof Login>;
export type LoginDto = Serialize<Login>;

export const Register = z.object({
    email: z.string().min(1, "L'email est requis").email("Format d'email invalide"),
    password: z
        .string()
        .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
        .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
        .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre'),
    confirmPassword: z.string().min(1, 'La confirmation du mot de passe est requise'),
    firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
    lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
    acceptTerms: z.boolean().optional(),
    acceptPrivacy: z.boolean().optional(),
});

export type Register = z.infer<typeof Register>;
export type RegisterDto = Serialize<Register>;

export const ResetPasswordSchema = z.object({
    currentPassword: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    newPassword: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    token: z.string().min(1),
  })

  
export type ResetPasswordSchema = z.infer<typeof ResetPasswordSchema>;
export type ResetPasswordDto = Serialize<ResetPasswordSchema>;


export const TokenSchema = z.object({
    token: z.string().min(1),
});
  
export type TokenSchema = z.infer<typeof TokenSchema>;
export type TokenDto = Serialize<TokenSchema>;
  
export const AuthResponse = z.object({
    accessToken: z.string(),
    refreshToken: z.string(),
});

export type AuthResponse = z.infer<typeof AuthResponse>;
export type AuthResponseDto = Serialize<AuthResponse>;

export const QuerySessionsSchema = z.object({
    userId: z.string().min(1),
});

export type QuerySessionsSchema = z.infer<typeof QuerySessionsSchema>;
export type QuerySessionsDto = Serialize<QuerySessionsSchema>;

export const RequestPasswordResetSchema = z.object({
    email: z.string().email(),
});

export type RequestPasswordResetSchema = z.infer<typeof RequestPasswordResetSchema>;
export type RequestPasswordResetDto = Serialize<RequestPasswordResetSchema>;

export const UpdatePasswordSchema = z.object({
    currentPassword: z.string().min(6).max(255, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
    newPassword: z.string().min(6).max(255, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
    confirmPassword: z.string().min(6).max(255, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  });
  
  export type UpdatePasswordSchema = z.infer<typeof UpdatePasswordSchema>;
  export type UpdatePasswordDto = Serialize<UpdatePasswordSchema>;
          