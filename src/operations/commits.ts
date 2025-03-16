import { z } from 'zod';
import { githubGet } from '../common/api.js';

// Schema for listing commits
export const ListCommitsSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  sha: z.string().optional(),
  page: z.number().optional(),
  perPage: z.number().optional(),
});

// List commits in a repository
export async function listCommits(
  owner: string,
  repo: string,
  page?: number,
  perPage?: number,
  sha?: string
) {
  const endpoint = `/repos/${owner}/${repo}/commits`;
  
  const params: any = {};
  
  if (sha) params.sha = sha;
  if (page) params.page = page;
  if (perPage) params.per_page = perPage;
  
  const response = await githubGet(endpoint, params);
  
  return await response.json();
}
