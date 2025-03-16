import { z } from 'zod';
import { githubPost } from '../common/api.js';

// Schema for creating a pull request
export const CreatePullRequestSchema = z.object({
  owner: z.string().describe('Repository owner (username or organization)'),
  repo: z.string().describe('Repository name'),
  title: z.string().describe('Pull request title'),
  body: z.string().describe('Pull request body/description'),
  head: z.string().describe('The name of the branch where your changes are implemented'),
  base: z.string().describe('The name of the branch you want the changes pulled into'),
  draft: z.boolean().optional().describe('Whether to create the pull request as a draft'),
  maintainer_can_modify: z.boolean().optional().describe('Whether maintainers can modify the pull request'),
});

// Create a new pull request
export async function createPullRequest(
  owner: string,
  repo: string,
  title: string,
  body: string,
  head: string,
  base: string,
  draft?: boolean,
  maintainer_can_modify?: boolean
) {
  const endpoint = `/repos/${owner}/${repo}/pulls`;
  
  const data: any = {
    title,
    body,
    head,
    base,
  };
  
  if (draft !== undefined) data.draft = draft;
  if (maintainer_can_modify !== undefined) data.maintainer_can_modify = maintainer_can_modify;
  
  const response = await githubPost(endpoint, data);
  
  return await response.json();
}
