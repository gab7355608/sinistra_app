import { Serialize } from '@shared/types/Serialize';
import { z } from 'zod';

export const idSchema = z.object({
    id: z.string().min(1, "L'id est requis"),
});

export type IdParamsSchema = z.infer<typeof idSchema>;
export type IdParams = Serialize<IdParamsSchema>;

export const QueryParamsSchema = z.object({
    page: z.number().optional(),
    limit: z.number().optional(),
    search: z.string().optional(),
});

export type QueryParamsSchema = z.infer<typeof QueryParamsSchema>;
export type QueryParamsDto = Serialize<QueryParamsSchema>;

export const FileSchema = z.object({
    id: z.string().min(1, "L'id est requis").optional(),
    name: z.string().min(1, 'Le nom est requis').optional(),
    type: z.string().min(1, 'Le type est requis').optional(),
    size: z.number().min(1, 'La taille est requise').optional(),
    mimetype: z.string().min(1, 'Le type mime est requis').optional(),
    fieldname: z.string().min(1, 'Le nom du champ est requis').optional(),
    originalname: z.string().min(1, 'Le nom original est requis').optional(),
    buffer: z.any().optional(),
    file: z.any().optional(),
    url: z.string().min(1, "L'url est requise").optional(),
    legend: z.string().optional(),
    source: z.string().optional(),
});

export type FileSchema = z.infer<typeof FileSchema>;
export type FileDto = Serialize<FileSchema>;
