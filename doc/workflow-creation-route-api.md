# Workflow de Création d'une Route API

## Vue d'ensemble

Ce document détaille le processus complet de création d'une route API dans notre architecture backend. Nous suivons une approche structurée en couches qui garantit la maintenabilité, la testabilité et la cohérence du code.

## Architecture en Couches

Notre architecture suit le pattern **Repository-Service-Controller** avec les transformers pour la sérialisation :

```
Route (Fastify) → Controller → Service → Repository → Database (Prisma)
                     ↓
                 Transformer → DTO (Frontend/Client)
```

## Étapes du Workflow

### 1. Création du fichier DTO

**Localisation :** `shared/dto/entityDto.ts`

Le DTO (Data Transfer Object) définit la structure des données échangées entre le frontend et le backend. Il utilise Zod pour la validation.

```typescript
import { z } from 'zod';
import { Serialize } from '../types/Serialize';
import { querySchema } from './comonDto';
import { EntityStatus } from '@shared/enums';

// Schema pour la création
export const createEntitySchema = z.object({
    name: z.string().min(1, "Le nom est requis"),
    description: z.string().optional(),
    status: z.nativeEnum(EntityStatus).default(EntityStatus.ACTIVE),
    categoryId: z.string().min(1, "La catégorie est requise")
});

export type CreateEntitySchema = z.infer<typeof createEntitySchema>;
export type CreateEntityDto = Serialize<CreateEntitySchema>;

// Schema pour la mise à jour (extend du create mais avec champs optionnels)
export const updateEntitySchema = createEntitySchema.partial();

export type UpdateEntitySchema = z.infer<typeof updateEntitySchema>;
export type UpdateEntityDto = Serialize<UpdateEntitySchema>;

// Schema basique (objet manipulé dans les routes GET)
export const entitySchema = createEntitySchema.extend({
    id: z.string().min(1),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    createdBy: z.string().min(1),
    updatedBy: z.string().min(1)
});

export type EntitySchema = z.infer<typeof entitySchema>;
export type EntityDto = Serialize<EntitySchema>;

// Schema avec relations (pour les détails complets)
export const entityWithRelationsSchema = entitySchema.extend({
    category: z.object({
        id: z.string(),
        name: z.string()
    }).optional(),
    items: z.array(z.object({
        id: z.string(),
        name: z.string()
    })).optional()
});

export type EntityWithRelationsSchema = z.infer<typeof entityWithRelationsSchema>;
export type EntityWithRelationsDto = Serialize<EntityWithRelationsSchema>;

// Schema pour les filtres de recherche (basé sur query extend)
export const findEntitySchema = querySchema.extend({
    name: z.string().optional(),
    status: z.nativeEnum(EntityStatus).optional(),
    categoryId: z.string().optional()
});

export type FindEntitySchema = z.infer<typeof findEntitySchema>;
export type FindEntityDto = Serialize<FindEntitySchema>;
```

**Pourquoi cette approche ?**
- **Réutilisation** : Le schema de base est étendu pour éviter la duplication
- **Validation** : Zod valide automatiquement les données côté client et serveur
- **Types** : TypeScript assure la cohérence des types dans toute l'application
- **Flexibilité** : Différents niveaux de détail selon le contexte (liste vs détail)

### 2. Création des Enums (si nécessaire)

**Localisation :** `shared/enums/entityEnums.ts`

```typescript
export enum EntityStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    PENDING = 'PENDING'
}

export enum EntityType {
    STANDARD = 'STANDARD',
    PREMIUM = 'PREMIUM',
    ENTERPRISE = 'ENTERPRISE'
}
```

**Pourquoi des enums ?**
- **Cohérence** : Valeurs standardisées dans toute l'application
- **Validation** : Restriction des valeurs possibles
- **Maintenance** : Modification centralisée des valeurs métier

### 3. Création des Types

**Localisation :** `backend/src/types/entityTypes.ts`

```typescript
import { entityInclude } from '@/repositories';
import { Prisma } from '@prisma/client';

export type EntityWithRelations = Prisma.EntityGetPayload<{
    include: typeof entityInclude;
}>;

export type EntityCreateInput = Prisma.EntityCreateInput;
export type EntityUpdateInput = Prisma.EntityUpdateInput;
export type EntityWhereInput = Prisma.EntityWhereInput;
```

**Pourquoi des types séparés ?**
- **Isolation** : Sépare la logique Prisma du reste de l'application
- **Maintenance** : Modifications de DB localisées
- **Réutilisation** : Types utilisés dans plusieurs couches

### 4. Création du Repository

**Localisation :** `backend/src/repositories/entityRepository.ts`

```typescript
import { Prisma, PrismaClient } from '@prisma/client';
import { logger } from '@/utils/logger';
import { CreateEntityDto, FindEntityDto, UpdateEntityDto } from '@shared/dto/entityDto';
import { PaginatedResponse } from '@/types/apiTypes';
import { EntityWithRelations } from '@/types/entityTypes';
import { FilterService } from '@/services';

const prisma = new PrismaClient();

export const entityInclude = Prisma.validator<Prisma.EntityInclude>()({
    category: {
        select: {
            id: true,
            name: true,
            description: true
        }
    },
    items: {
        select: {
            id: true,
            name: true,
            status: true
        }
    },
    createdByUser: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
        }
    },
    modifiedByUser: {
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
        }
    }
});

class EntityRepository {
    private logger = logger.child({
        class: '[App][EntityRepository]',
    });

    /**
     * Créer une nouvelle entité
     * @param data - Données de création
     * @returns Promise<EntityWithRelations>
     */
    async create(data: Prisma.EntityCreateInput): Promise<EntityWithRelations> {
        this.logger.info('Creating new entity', { data });
        return prisma.entity.create({ 
            data,
            include: entityInclude
        });
    }

    /**
     * Récupérer toutes les entités avec filtres et pagination
     * @param filters - Filtres de recherche
     * @returns Promise<PaginatedResponse<EntityWithRelations>>
     */
    async findAll(filters: FindEntityDto): Promise<PaginatedResponse<EntityWithRelations>> {
        const { page = 1, limit = 10, search, name, status, categoryId } = filters;
        const skip = (Number(page) - 1) * Number(limit);

        const where: Prisma.EntityWhereInput = {
            deletedAt: null, // Soft delete
        };

        // Recherche textuelle
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Filtres spécifiques
        if (name) {
            where.name = { contains: name, mode: 'insensitive' };
        }

        if (status) {
            where.status = status;
        }

        if (categoryId) {
            where.categoryId = categoryId;
        }

        // Tri par défaut
        const orderBy: Prisma.EntityOrderByWithRelationInput = { createdAt: 'desc' };

        // Exécution en parallèle pour optimiser les performances
        const [data, total] = await Promise.all([
            prisma.entity.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy,
                include: entityInclude,
            }),
            prisma.entity.count({ where }),
        ]);

        // Calcul des métadonnées de pagination
        const currentPage = Number(page);
        const totalPages = Math.ceil(total / Number(limit));

        return {
            data,
            pagination: {
                currentPage,
                totalPages,
                totalItems: total,
                nextPage: currentPage < totalPages ? currentPage + 1 : 0,
                previousPage: currentPage > 1 ? currentPage - 1 : 0,
                perPage: Number(limit),
            },
        };
    }

    /**
     * Récupérer une entité par ID
     * @param id - ID de l'entité
     * @returns Promise<EntityWithRelations | null>
     */
    async findById(id: string): Promise<EntityWithRelations | null> {
        return prisma.entity.findUnique({
            where: { id },
            include: entityInclude,
        });
    }

    /**
     * Mettre à jour une entité
     * @param id - ID de l'entité
     * @param data - Données de mise à jour
     * @returns Promise<EntityWithRelations>
     */
    async update(id: string, data: Prisma.EntityUpdateInput): Promise<EntityWithRelations> {
        return prisma.entity.update({
            where: { id },
            data,
            include: entityInclude,
        });
    }

    /**
     * Supprimer une entité (soft delete)
     * @param id - ID de l'entité
     * @param deletedBy - ID de l'utilisateur qui supprime
     * @returns Promise<EntityWithRelations>
     */
    async delete(id: string, deletedBy: string): Promise<EntityWithRelations> {
        return prisma.entity.update({
            where: { id },
            data: { 
                deletedAt: new Date(),
                deletedBy
            },
            include: entityInclude,
        });
    }
}

export const entityRepository = new EntityRepository();
```

**Pourquoi cette structure ?**
- **Séparation des responsabilités** : Le repository ne gère que l'accès aux données
- **Performance** : Requêtes optimisées avec includes et pagination
- **Maintenance** : Logique de base de données centralisée
- **Flexibilité** : Méthodes réutilisables pour différents cas d'usage

### 5. Création du Transformer

**Localisation :** `backend/src/transformers/entityTransformer.ts`

```typescript
import { EntityWithRelations } from '@/types/entityTypes';
import { EntityDto, EntityWithRelationsDto } from '@shared/dto/entityDto';
import { categoryTransformer } from './categoryTransformer';

export class EntityTransformer {
    /**
     * Convertir une entité en DTO standard
     * @param entity - Entité avec relations
     * @returns EntityDto
     */
    static toDTO(entity: EntityWithRelations): EntityDto {
        return {
            id: entity.id,
            name: entity.name,
            description: entity.description,
            status: entity.status,
            categoryId: entity.categoryId,
            createdAt: entity.createdAt.toISOString(),
            updatedAt: entity.updatedAt.toISOString(),
            createdBy: entity.createdBy,
            updatedBy: entity.updatedBy
        };
    }

    /**
     * Convertir une entité en DTO avec relations
     * @param entity - Entité avec relations
     * @returns EntityWithRelationsDto
     */
    static toDetailedDTO(entity: EntityWithRelations): EntityWithRelationsDto {
        return {
            ...this.toDTO(entity),
            category: entity.category ? {
                id: entity.category.id,
                name: entity.category.name,
                description: entity.category.description
            } : undefined,
            items: entity.items?.map(item => ({
                id: item.id,
                name: item.name,
                status: item.status
            })) || [],
            createdByUser: entity.createdByUser ? {
                id: entity.createdByUser.id,
                firstName: entity.createdByUser.firstName,
                lastName: entity.createdByUser.lastName,
                email: entity.createdByUser.email
            } : undefined,
            modifiedByUser: entity.modifiedByUser ? {
                id: entity.modifiedByUser.id,
                firstName: entity.modifiedByUser.firstName,
                lastName: entity.modifiedByUser.lastName,
                email: entity.modifiedByUser.email
            } : undefined
        };
    }

    /**
     * Convertir un tableau d'entités en DTOs
     * @param entities - Tableau d'entités
     * @returns EntityDto[]
     */
    static toDTOs(entities: EntityWithRelations[]): EntityDto[] {
        return entities.map(entity => this.toDTO(entity));
    }

    /**
     * Convertir un tableau d'entités en DTOs détaillés
     * @param entities - Tableau d'entités
     * @returns EntityWithRelationsDto[]
     */
    static toDetailedDTOs(entities: EntityWithRelations[]): EntityWithRelationsDto[] {
        return entities.map(entity => this.toDetailedDTO(entity));
    }
}
```

**Pourquoi des transformers ?**
- **Sécurité** : Contrôle des données exposées à l'API
- **Cohérence** : Format standardisé des réponses
- **Flexibilité** : Différents niveaux de détail selon le contexte
- **Maintenance** : Logique de transformation centralisée

### 6. Création du Controller

**Localisation :** `backend/src/controllers/entityController.ts`

```typescript
import { FastifyReply, FastifyRequest } from 'fastify';
import { asyncHandler } from '@/utils/asyncHandler';
import { entityRepository } from '@/repositories/entityRepository';
import { jsonResponse, notFoundResponse, badRequestResponse } from '@/utils/jsonResponse';
import { 
    CreateEntityDto, 
    CreateEntitySchema, 
    createEntitySchema,
    UpdateEntityDto,
    UpdateEntitySchema,
    updateEntitySchema,
    FindEntityDto,
    FindEntitySchema,
    findEntitySchema,
    EntityDto,
    EntityWithRelationsDto,
    IdParams,
    idSchema
} from '@shared/dto';
import { ApiResponse } from '@/types';
import { logger } from '@/utils/logger';
import { EntityTransformer } from '@/transformers/entityTransformer';

class EntityController {
    private logger = logger.child({
        module: '[App][EntityController]',
    });

    /**
     * Récupérer toutes les entités avec filtres
     * @route GET /api/entities
     */
    public getAll = asyncHandler<unknown, FindEntitySchema, unknown, EntityDto[]>({
        querySchema: findEntitySchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<EntityDto[]> | void> => {
            const result = await entityRepository.findAll(request.query as FindEntityDto);
            const entities = EntityTransformer.toDTOs(result.data);

            return jsonResponse(
                reply, 
                "Entités récupérées avec succès", 
                entities, 
                200, 
                result.pagination
            );
        }
    });

    /**
     * Récupérer une entité par ID
     * @route GET /api/entities/:id
     */
    public getById = asyncHandler<unknown, unknown, IdParams, EntityWithRelationsDto>({
        paramsSchema: idSchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<EntityWithRelationsDto> | void> => {
            const { id } = request.params;
            const entity = await entityRepository.findById(id);

            if (!entity) {
                return notFoundResponse(reply, 'Entité non trouvée');
            }

            const entityDto = EntityTransformer.toDetailedDTO(entity);
            return jsonResponse(reply, 'Entité récupérée avec succès', entityDto, 200);
        }
    });

    /**
     * Créer une nouvelle entité
     * @route POST /api/entities
     */
    public create = asyncHandler<CreateEntitySchema, unknown, unknown, EntityDto>({
        bodySchema: createEntitySchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<EntityDto> | void> => {
            const userId = request.user?.id;
            
            if (!userId) {
                return badRequestResponse(reply, 'Utilisateur non authentifié');
            }

            // Vérifier si une entité avec ce nom existe déjà
            const existingEntity = await entityRepository.findByName(request.body.name);
            if (existingEntity) {
                return badRequestResponse(reply, 'Une entité avec ce nom existe déjà');
            }

            const entityData = {
                ...request.body,
                createdBy: userId,
                updatedBy: userId
            };

            const entity = await entityRepository.create(entityData);
            const entityDto = EntityTransformer.toDTO(entity);

            return jsonResponse(reply, 'Entité créée avec succès', entityDto, 201);
        }
    });

    /**
     * Mettre à jour une entité
     * @route PATCH /api/entities/:id
     */
    public update = asyncHandler<UpdateEntitySchema, unknown, IdParams, EntityDto>({
        bodySchema: updateEntitySchema,
        paramsSchema: idSchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<EntityDto> | void> => {
            const { id } = request.params;
            const userId = request.user?.id;

            if (!userId) {
                return badRequestResponse(reply, 'Utilisateur non authentifié');
            }

            const existingEntity = await entityRepository.findById(id);
            if (!existingEntity) {
                return notFoundResponse(reply, 'Entité non trouvée');
            }

            const entityData = {
                ...request.body,
                updatedBy: userId,
                updatedAt: new Date()
            };

            const entity = await entityRepository.update(id, entityData);
            const entityDto = EntityTransformer.toDTO(entity);

            return jsonResponse(reply, 'Entité mise à jour avec succès', entityDto, 200);
        }
    });

    /**
     * Supprimer une entité
     * @route DELETE /api/entities/:id
     */
    public delete = asyncHandler<unknown, unknown, IdParams, void>({
        paramsSchema: idSchema,
        logger: this.logger,
        handler: async (request, reply): Promise<ApiResponse<void> | void> => {
            const { id } = request.params;
            const userId = request.user?.id;

            if (!userId) {
                return badRequestResponse(reply, 'Utilisateur non authentifié');
            }

            const existingEntity = await entityRepository.findById(id);
            if (!existingEntity) {
                return notFoundResponse(reply, 'Entité non trouvée');
            }

            await entityRepository.delete(id, userId);
            return jsonResponse(reply, 'Entité supprimée avec succès', undefined, 204);
        }
    });
}

export const entityController = new EntityController();
```

**Pourquoi cette structure ?**
- **Validation automatique** : AsyncHandler valide les données avec Zod
- **Gestion d'erreurs** : Réponses standardisées et logs appropriés
- **Sécurité** : Vérification de l'authentification et des permissions
- **Maintenabilité** : Logique métier claire et séparée

### 7. Création de la Route

**Localisation :** `backend/src/routes/entityRoutes.ts`

```typescript
import { FastifyInstance } from 'fastify';
import { entityController } from '@/controllers/entityController';
import { isAuthenticated } from '@/middleware/auth';
import { checkFeatureAccess } from '@/middleware/checkFeatureAccess';
import { createSwaggerSchema } from '@/utils/swaggerUtils';
import { 
    createEntitySchema, 
    updateEntitySchema, 
    findEntitySchema,
    EntityDto,
    EntityWithRelationsDto
} from '@shared/dto/entityDto';
import { FeatureKey } from '@shared/config/pricingConfig';

export async function entityRoutes(fastify: FastifyInstance) {
    // Appliquer l'authentification à toutes les routes
    fastify.addHook('onRequest', isAuthenticated);

    // GET ALL - Récupérer toutes les entités
    fastify.get('/', {
        schema: createSwaggerSchema(
            'Récupère toutes les entités avec possibilité de filtrer par nom, statut et catégorie.',
            [
                { message: 'Entités récupérées avec succès', data: [] as EntityDto[], status: 200 },
                { message: 'Non autorisé', data: null, status: 401 },
                { message: 'Erreur lors de la récupération des entités', data: null, status: 500 }
            ],
            null,
            true,
            findEntitySchema,
            ['Entities']
        ),
        handler: entityController.getAll
    });

    // GET BY ID - Récupérer une entité par ID
    fastify.get('/:id', {
        schema: createSwaggerSchema(
            'Récupère une entité par son ID avec tous les détails et relations.',
            [
                { message: 'Entité récupérée avec succès', data: {} as EntityWithRelationsDto, status: 200 },
                { message: 'Non autorisé', data: null, status: 401 },
                { message: 'Entité non trouvée', data: null, status: 404 },
                { message: 'Erreur lors de la récupération de l\'entité', data: null, status: 500 }
            ],
            null,
            true,
            null,
            ['Entities']
        ),
        handler: entityController.getById
    });

    // CREATE - Créer une nouvelle entité
    fastify.post('/', {
        schema: createSwaggerSchema(
            'Crée une nouvelle entité. Nécessite le feature ENTITY_MANAGEMENT.',
            [
                { message: 'Entité créée avec succès', data: {} as EntityDto, status: 201 },
                { message: 'Données invalides', data: null, status: 400 },
                { message: 'Non autorisé', data: null, status: 401 },
                { message: 'Accès refusé - Feature requise', data: null, status: 403 },
                { message: 'Erreur lors de la création de l\'entité', data: null, status: 500 }
            ],
            createEntitySchema,
            true,
            null,
            ['Entities']
        ),
        preHandler: checkFeatureAccess(FeatureKey.ENTITY_MANAGEMENT),
        handler: entityController.create
    });

    // UPDATE - Mettre à jour une entité
    fastify.patch('/:id', {
        schema: createSwaggerSchema(
            'Met à jour une entité existante. Nécessite le feature ENTITY_MANAGEMENT.',
            [
                { message: 'Entité mise à jour avec succès', data: {} as EntityDto, status: 200 },
                { message: 'Données invalides', data: null, status: 400 },
                { message: 'Non autorisé', data: null, status: 401 },
                { message: 'Accès refusé - Feature requise', data: null, status: 403 },
                { message: 'Entité non trouvée', data: null, status: 404 },
                { message: 'Erreur lors de la mise à jour de l\'entité', data: null, status: 500 }
            ],
            updateEntitySchema,
            true,
            null,
            ['Entities']
        ),
        preHandler: checkFeatureAccess(FeatureKey.ENTITY_MANAGEMENT),
        handler: entityController.update
    });

    // DELETE - Supprimer une entité
    fastify.delete('/:id', {
        schema: createSwaggerSchema(
            'Supprime une entité (soft delete). Nécessite le feature ENTITY_MANAGEMENT.',
            [
                { message: 'Entité supprimée avec succès', data: null, status: 204 },
                { message: 'Non autorisé', data: null, status: 401 },
                { message: 'Accès refusé - Feature requise', data: null, status: 403 },
                { message: 'Entité non trouvée', data: null, status: 404 },
                { message: 'Erreur lors de la suppression de l\'entité', data: null, status: 500 }
            ],
            null,
            true,
            null,
            ['Entities']
        ),
        preHandler: checkFeatureAccess(FeatureKey.ENTITY_MANAGEMENT),
        handler: entityController.delete
    });
}
```

**Pourquoi cette structure ?**
- **Documentation automatique** : Swagger génère la documentation API
- **Sécurité** : Middleware d'authentification et d'autorisation
- **Cohérence** : Réponses standardisées avec codes d'erreur explicites
- **Flexibilité** : Middleware modulaire selon les besoins

### 8. Référencement de la Route

**Localisation :** `backend/src/routes/registerRoutes.ts`

```typescript
// Ajout de l'import
import { entityRoutes } from "./entityRoutes";

export async function registerRoutes(app: FastifyInstance): Promise<void> {
    // ... autres configurations ...

    // Ajout de l'enregistrement de la route
    app.register(entityRoutes, { prefix: "/api/entities" });
    
    // ... autres routes ...
}
```

### 9. Référencement dans les Index

**Ajout dans `shared/dto/index.ts` :**
```typescript
export * from './entityDto';
```

**Ajout dans `shared/enums/index.ts` :**
```typescript
export * from './entityEnums';
```

**Ajout dans `backend/src/repositories/index.ts` :**
```typescript
export * from './entityRepository';
```

**Ajout dans `backend/src/types/index.ts` :**
```typescript
export * from './entityTypes';
```

## Avantages de cette Architecture

### 1. **Séparation des Responsabilités**
- **DTO** : Définition et validation des données
- **Repository** : Accès aux données
- **Transformer** : Sérialisation
- **Controller** : Logique métier
- **Route** : Configuration HTTP

### 2. **Maintenabilité**
- Code modulaire et réutilisable
- Modifications localisées
- Tests unitaires facilités

### 3. **Sécurité**
- Validation automatique des données
- Middleware d'authentification
- Contrôle d'accès granulaire

### 4. **Performance**
- Requêtes optimisées
- Pagination automatique
- Mise en cache possible

### 5. **Documentation**
- Swagger automatique
- Types TypeScript
- Commentaires JSDoc

## Checklist de Création

- [ ] Créer le fichier DTO avec tous les schémas nécessaires
- [ ] Créer les enums si nécessaire
- [ ] Créer les types TypeScript
- [ ] Créer le repository avec toutes les méthodes CRUD
- [ ] Créer le transformer avec les méthodes de conversion
- [ ] Créer le controller avec validation et gestion d'erreurs
- [ ] Créer la route avec documentation Swagger
- [ ] Référencer dans registerRoutes.ts
- [ ] Ajouter les exports dans tous les fichiers index.ts
- [ ] Tester toutes les routes avec des cas d'usage réels

Cette architecture garantit une API robuste, maintenable et évolutive, respectant les meilleures pratiques de développement backend. 