import { z } from 'zod';
import { githubGet, githubPost } from '../common/api.js';

// Schema for creating a branch
export const CreateBranchSchema = z.object({
  owner: z.string().describe('Repository owner (username or organization)'),
  repo: z.string().describe('Repository name'),
  branch: z.string().describe('Name for the new branch'),
  from_branch: z.string().optional().describe('Optional: source branch to create from (defaults to the repository\'s default branch)'),
});

// Create a new branch
export async function createBranch(
  owner: string,
  repo: string,
  branch: string,
  from_branch?: string
) {
  // If from_branch is not provided, get the default branch
  if (!from_branch) {
    const repoResponse = await githubGet(`/repos/${owner}/${repo}`);
    const repoData = await repoResponse.json() as { default_branch: string };
    from_branch = repoData.default_branch;
  }
  
  // Get the SHA of the latest commit on the source branch
  const refResponse = await githubGet(`/repos/${owner}/${repo}/git/refs/heads/${from_branch}`);
  const refData = await refResponse.json() as { object: { sha: string } };
  const sha = refData.object.sha;
  
  // Create the new branch
  const endpoint = `/repos/${owner}/${repo}/git/refs`;
  const data = {
    ref: `refs/heads/${branch}`,
    sha,
  };
  
  const response = await githubPost(endpoint, data);
  
  return await response.json();
}
