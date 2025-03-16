import { z } from 'zod';
import { githubPost } from '../common/api.js';

// Schema for creating a repository
export const CreateRepositorySchema = z.object({
  name: z.string().describe('Repository name'),
  description: z.string().describe('Repository description'),
  private: z.boolean().describe('Whether the repository should be private'),
  autoInit: z.boolean().describe('Initialize with README.md'),
});

// Schema for forking a repository
export const ForkRepositorySchema = z.object({
  owner: z.string().describe('Repository owner (username or organization)'),
  repo: z.string().describe('Repository name'),
  organization: z.string().optional().describe('Optional: organization to fork to (defaults to your personal account)'),
});

// Create a new repository
export async function createRepository(
  name: string,
  description: string,
  isPrivate: boolean,
  autoInit: boolean
) {
  const response = await githubPost('/user/repos', {
    name,
    description,
    private: isPrivate,
    auto_init: autoInit,
  });
  
  return await response.json();
}

// Fork a repository
export async function forkRepository(
  owner: string,
  repo: string,
  organization?: string
) {
  const endpoint = `/repos/${owner}/${repo}/forks`;
  const data = organization ? { organization } : {};
  
  const response = await githubPost(endpoint, data);
  
  return await response.json();
}
