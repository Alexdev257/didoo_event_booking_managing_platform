export type ValidationErrorItem = {
  field: string;
  detail: string;
}

export type ResponseData<T> = {
  isSuccess: boolean;
  message: string;
  statusCode?: number; // BE không trả - optional
  data: T;
  listErrors: ValidationErrorItem[];
};

export type ResponseError = {
  isSuccess: false;
  message: string;
  statusCode?: number;
  data: null;
  listErrors: ValidationErrorItem[];
};

/** Match BE PaginationResponse: totalItems, pageNumber, pageSize, totalPages, items, hasNextPage, hasPreviousPage */
export type PaginatedData<T> = {
  totalItems: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  items: T[];
};

export type BasePaginationResponse<T> = ResponseData<PaginatedData<T>>;

/** Match BE PaginationRequest + query params: camelCase */
export interface BasePaginationQuery {
  pageNumber?: number;
  pageSize?: number;
  isDescending?: boolean;
  isDeleted?: boolean;
  fields?: string;
  [key: string]: string | number | boolean | undefined;
}

export interface AuthContextType {
  setTokenFromContext: (accessToken: string, refreshToken: string) => void;
}
