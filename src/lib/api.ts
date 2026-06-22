import { NextResponse } from 'next/server';

export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMITED'
  | 'INTERNAL_ERROR';

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: {
    code: ApiErrorCode;
    message: string;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
};

/**
 * Success response for single item or operation
 */
export function successResponse<T>(
  data: T,
  statusCode: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status: statusCode }
  );
}

/**
 * Success response for list with pagination
 */
export function successListResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  statusCode: number = 200
): NextResponse<ApiResponse<T[]>> {
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return NextResponse.json(
    {
      success: true,
      data,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages,
      },
    },
    { status: statusCode }
  );
}

/**
 * Error response
 */
export function errorResponse(
  code: ApiErrorCode,
  message: string,
  statusCode: number = 400
): NextResponse<ApiResponse> {
  const statusMap: Record<ApiErrorCode, number> = {
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    VALIDATION_ERROR: 422,
    RATE_LIMITED: 429,
    INTERNAL_ERROR: 500,
  };

  return NextResponse.json(
    {
      success: false,
      error: { code, message },
    },
    { status: statusCode || statusMap[code] }
  );
}

/**
 * Parse pagination from query params
 */
export function parsePagination(
  searchParams: URLSearchParams,
  defaultLimit: number = 10,
  maxLimit: number = 50
) {
  let page = parseInt(searchParams.get('page') || '1', 10);
  let limit = parseInt(searchParams.get('limit') || String(defaultLimit), 10);

  page = Math.max(1, page);
  limit = Math.min(maxLimit, Math.max(1, limit));

  return { page, limit, skip: (page - 1) * limit };
}
