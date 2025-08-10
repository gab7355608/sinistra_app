import { Prisma } from '@/config/client';
import { FilterService } from '@/services/filterService';

const DEFAULT_ORDER_BY = { createdAt: 'desc' };
const MAX_RECORDS_LIMIT = 100;

/**
 * Generic base repository for interacting with the database.
 * Provides methods to create, read, update, and delete records.
 */
export abstract class BaseRepository<A> {
    /**
     * @param modelClient - The Prisma client model for interacting with the database.
     * @param hasSoftDelete - Indicates if the model uses soft deletion (deletedAt).
     */
    constructor(protected modelClient: any) {}
    protected hasSoftDelete = false;

    /**
     * Retrieves a paginated list of records based on filters.
     *
     * @param filters - Filtering options. Uses FilterService to build the query.
     * @param skip - Starting number for pagination (default is 0).
     * @param take - Number of records per page (default is MAX_RECORDS_LIMIT).
     * @returns An array of records.
     */
    async findAll(
        filters: any = {},
        skip: number = 0,
        take: number = MAX_RECORDS_LIMIT
    ): Promise<{
        data: A[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalItems: number;
            nextPage: number;
            previousPage: number;
            perPage: number;
        };
    }> {
        // Build the base query using FilterService
        const baseQuery = FilterService.buildQuery(filters);
        const where: Prisma.Args<typeof this.modelClient, 'findMany'>['where'] = {
            ...baseQuery,
        };

        // Add the deletedAt filter if the field exists
        if (this.hasSoftDelete) {
            where.deletedAt = null;
        }

        // Use FilterService to extract sorting and pagination parameters
        const { sort } = FilterService.applySortingAndPagination(where, filters);
        const orderBy = filters.sort ? sort : DEFAULT_ORDER_BY;

        // Default include is empty
        const include: Prisma.Args<typeof this.modelClient, 'findMany'>['include'] = {};

        const [data, total] = await Promise.all([
            this.modelClient.findMany({
                where,
                skip,
                take,
                orderBy,
                include,
            }),
            this.modelClient.count({ where }),
        ]);

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

    /**
     * Retrieves a single record matching the provided filters.
     *
     * @param filters - Filtering options.
     * @returns A single record or null if no record is found.
     */
    async findOne(filters: any): Promise<A | null> {
        const where: Prisma.Args<typeof this.modelClient, 'findFirst'>['where'] = {
            ...filters,
        };
        if (this.hasSoftDelete) {
            where.deletedAt = null;
        }
        return this.modelClient.findFirst({ where });
    }

    /**
     * Retrieves a record by its unique identifier.
     *
     * @param id - The unique identifier.
     * @param include - Optional inclusion options for relationships.
     * @returns The record or null if no record is found.
     */
    async findById(
        id: string,
        include?: Prisma.Args<typeof this.modelClient, 'findUnique'>['include']
    ): Promise<A | null> {
        const where: Prisma.Args<typeof this.modelClient, 'findUnique'>['where'] = { id };

        if (this.hasSoftDelete) {
            where.deletedAt = null;
        }
        return this.modelClient.findFirst({ where, include });
    }

    /**
     * Creates a new record.
     *
     * @param data - The data required to create the record.
     * @param include - Optional inclusion options for relationships.
     * @returns The created record.
     */
    async create(
        data: Prisma.Args<typeof this.modelClient, 'create'>['data'],
        include?: Prisma.Args<typeof this.modelClient, 'create'>['include']
    ): Promise<A> {
        return this.modelClient.create({
            data,
            include,
        });
    }

    /**
     * Updates an existing record.
     *
     * @param id - The unique identifier of the record.
     * @param data - The data to update.
     * @param include - Optional inclusion options for relationships.
     * @returns The updated record.
     */
    async update(
        id: string,
        data: Prisma.Args<typeof this.modelClient, 'update'>['data'],
        include?: Prisma.Args<typeof this.modelClient, 'update'>['include']
    ): Promise<A> {
        return this.modelClient.update({
            where: { id },
            data,
            include,
        });
    }

    /**
     * Deletes a record by setting its deletedAt field.
     *
     * @param id - The unique identifier of the record.
     * @returns The updated record.
     */
    async delete(id: string): Promise<A> {
        if (this.hasSoftDelete) {
            return this.modelClient.update({
                where: { id },
                data: { deletedAt: new Date() },
            });
        }
        return this.modelClient.delete({ where: { id } });
    }

    /**
     * Deletes multiple records matching the provided filters.
     *
     * @param filters - Filtering options.
     * @returns The number of deleted records.
     */
    async deleteMany(
        filters: Prisma.Args<typeof this.modelClient, 'updateMany'>['where']
    ): Promise<Prisma.BatchPayload> {
        if (this.hasSoftDelete) {
            return this.modelClient.updateMany({
                where: filters,
                data: { deletedAt: new Date() },
            });
        }
        return this.modelClient.deleteMany({ where: filters });
    }

    /**
     * Counts records matching the provided filters.
     *
     * @param filters - Filtering options.
     * @returns The number of records.
     */
    async count(filters: Prisma.Args<typeof this.modelClient, 'count'>['where']): Promise<number> {
        const where: Prisma.Args<typeof this.modelClient, 'count'>['where'] = { ...filters };
        if (this.hasSoftDelete) {
            where.deletedAt = null;
        }
        return this.modelClient.count({ where });
    }
}
