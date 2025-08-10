export class FilterService {
    /**
     * Build a query to filter data
     * @param filters - The filters to apply
     * @returns The built query
     */
    static buildQuery(filters: any): any {
        const query: any = {};

        if (filters.search && filters.searchFields) {
            const searchValue = filters.search.toLowerCase();
            const searchFields = filters.searchFields;

            query.OR = searchFields.map((field: string) => ({
                [field]: { contains: searchValue },
            }));
        }

        for (const key in filters) {
            if (['sort', 'skip', 'limit', 'search', 'searchFields'].includes(key)) continue;
            query[key] = filters[key];
        }

        return query;
    }

    /**
     * Apply the sorting and pagination filters
     * @param query - The query to filter
     * @param filters - The filters to apply
     * @returns The filtered query
     */
    static applySortingAndPagination(
        query: any,
        filters: any
    ): { query: any; sort?: any; skip: number; limit?: number } {
        let sort = undefined;
        let skip = 0;
        let limit = undefined;

        if (filters.sort) {
            // Example: sort="name:asc,age:desc"
            const sortArr = filters.sort.split(',').map((item: string) => {
                const [field, order] = item.split(':');
                return { [field.trim()]: (order || 'asc').trim() };
            });
            sort = sortArr;
        }

        if (filters.skip) {
            skip = parseInt(filters.skip, 10) || 0;
        }

        if (filters.limit) {
            limit = parseInt(filters.limit, 10) || undefined;
        }

        return { query, sort, skip, limit };
    }
}
