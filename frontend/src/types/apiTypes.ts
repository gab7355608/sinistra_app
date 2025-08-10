
/**
 * Interface pour une réponse API standardisée
 */
export interface ApiResponse<T = any> {
    message: string;
    data: T;
    pagination?: PaginationMeta;
    status: number;
    timestamp: string;
  }
  
  export interface PaginationMeta {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    nextPage: number;
    previousPage: number;
    perPage: number;
  }
  
  export interface PaginatedResponse<T> {
    data: T[];
    pagination: PaginationMeta;
  }
  