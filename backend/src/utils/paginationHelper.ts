export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationResult {
  skip: number;
  limit: number;
  page: number;
}

export const getPagination = (query: any): PaginationResult => {
  const rawPage = parseInt(query.page as string) || 1;
  const rawLimit = parseInt(query.limit as string) || 20;

  const page = rawPage < 1 ? 1 : rawPage;
  const limit = rawLimit < 1 ? 20 : Math.min(rawLimit, 100); // hard cap 100

  const skip = (page - 1) * limit;

  return { skip, limit, page };
};
