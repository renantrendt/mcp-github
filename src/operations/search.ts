import { z } from 'zod';
import { githubGet } from '../common/api.js';

// Schema for searching code
export const SearchCodeSchema = z.object({
  q: z.string(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.number().optional(),
  per_page: z.number().optional(),
});

// Schema for searching repositories
export const SearchRepositoriesSchema = z.object({
  query: z.string().describe('Search query (see GitHub search syntax)'),
  page: z.number().optional().describe('Page number for pagination (default: 1)'),
  perPage: z.number().optional().describe('Number of results per page (default: 30, max: 100)'),
});

// Schema for searching issues
export const SearchIssuesSchema = z.object({
  q: z.string(),
  sort: z.enum(['comments', 'reactions', 'reactions-+1', 'reactions--1', 'reactions-smile', 'reactions-thinking_face', 'reactions-heart', 'reactions-tada', 'interactions', 'created', 'updated']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.number().optional(),
  per_page: z.number().optional(),
});

// Schema for searching users
export const SearchUsersSchema = z.object({
  q: z.string(),
  sort: z.enum(['followers', 'repositories', 'joined']).optional(),
  order: z.enum(['asc', 'desc']).optional(),
  page: z.number().optional(),
  per_page: z.number().optional(),
});

// Search for code
export async function searchCode(
  q: string,
  order?: 'asc' | 'desc',
  page?: number,
  per_page?: number
) {
  const endpoint = '/search/code';
  
  const params: any = { q };
  
  if (order) params.order = order;
  if (page) params.page = page;
  if (per_page) params.per_page = per_page;
  
  const response = await githubGet(endpoint, params);
  
  return await response.json();
}

// Search for repositories
export async function searchRepositories(
  query: string,
  page?: number,
  perPage?: number
) {
  const endpoint = '/search/repositories';
  
  const params: any = { q: query };
  
  if (page) params.page = page;
  if (perPage) params.per_page = perPage;
  
  const response = await githubGet(endpoint, params);
  
  return await response.json();
}

// Search for issues and pull requests
export async function searchIssues(
  q: string,
  sort?: 'comments' | 'reactions' | 'reactions-+1' | 'reactions--1' | 'reactions-smile' | 'reactions-thinking_face' | 'reactions-heart' | 'reactions-tada' | 'interactions' | 'created' | 'updated',
  order?: 'asc' | 'desc',
  page?: number,
  per_page?: number
) {
  const endpoint = '/search/issues';
  
  const params: any = { q };
  
  if (sort) params.sort = sort;
  if (order) params.order = order;
  if (page) params.page = page;
  if (per_page) params.per_page = per_page;
  
  const response = await githubGet(endpoint, params);
  
  return await response.json();
}

// Search for users
export async function searchUsers(
  q: string,
  sort?: 'followers' | 'repositories' | 'joined',
  order?: 'asc' | 'desc',
  page?: number,
  per_page?: number
) {
  const endpoint = '/search/users';
  
  const params: any = { q };
  
  if (sort) params.sort = sort;
  if (order) params.order = order;
  if (page) params.page = page;
  if (per_page) params.per_page = per_page;
  
  const response = await githubGet(endpoint, params);
  
  return await response.json();
}
