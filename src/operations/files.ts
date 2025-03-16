import { z } from 'zod';
import { githubGet, githubPut, githubPost, githubPatch } from '../common/api.js';

// Schema for creating or updating a file
export const CreateOrUpdateFileSchema = z.object({
  owner: z.string().describe('Repository owner (username or organization)'),
  repo: z.string().describe('Repository name'),
  path: z.string().describe('Path where to create/update the file'),
  message: z.string().describe('Commit message'),
  content: z.string().describe('Content of the file'),
  branch: z.string().describe('Branch to create/update the file in'),
  sha: z.string().optional().describe('SHA of the file being replaced (required when updating existing files)'),
});

// Schema for getting file contents
export const GetFileContentsSchema = z.object({
  owner: z.string().describe('Repository owner (username or organization)'),
  repo: z.string().describe('Repository name'),
  path: z.string().describe('Path to the file or directory'),
  branch: z.string().describe('Branch to get contents from'),
});

// Schema for pushing multiple files
export const PushFilesSchema = z.object({
  owner: z.string().describe('Repository owner (username or organization)'),
  repo: z.string().describe('Repository name'),
  branch: z.string().describe('Branch to push to (e.g., \'main\' or \'master\')'),
  message: z.string().describe('Commit message'),
  files: z.array(
    z.object({
      path: z.string(),
      content: z.string(),
    })
  ).describe('Array of files to push'),
});

// Get file or directory contents
export async function getFileContents(
  owner: string,
  repo: string,
  path: string,
  branch: string
) {
  const endpoint = `/repos/${owner}/${repo}/contents/${path}`;
  const params = { ref: branch };
  
  const response = await githubGet(endpoint, params);
  
  return await response.json();
}

// Create or update a file
export async function createOrUpdateFile(
  owner: string,
  repo: string,
  path: string,
  message: string,
  content: string,
  branch: string,
  sha?: string
) {
  const endpoint = `/repos/${owner}/${repo}/contents/${path}`;
  
  // Base64 encode the content
  const base64Content = Buffer.from(content).toString('base64');
  
  const data: any = {
    message,
    content: base64Content,
    branch,
  };
  
  // If sha is provided, it's an update operation
  if (sha) {
    data.sha = sha;
  }
  
  const response = await githubPut(endpoint, data);
  
  return await response.json();
}

// Push multiple files in a single commit
export async function pushFiles(
  owner: string,
  repo: string,
  branch: string,
  message: string,
  files: Array<{ path: string; content: string }>
) {
  // First, get the latest commit SHA for the branch
  const refResponse = await githubGet(`/repos/${owner}/${repo}/git/refs/heads/${branch}`);
  const refData = await refResponse.json() as { object: { sha: string } };
  const latestCommitSha = refData.object.sha;
  
  // Get the base tree
  const treeResponse = await githubGet(`/repos/${owner}/${repo}/git/commits/${latestCommitSha}`);
  const treeData = await treeResponse.json() as { tree: { sha: string } };
  const baseTreeSha = treeData.tree.sha;
  
  // Create a new tree with the files
  const newTree = [];
  for (const file of files) {
    newTree.push({
      path: file.path,
      mode: '100644', // Regular file mode
      type: 'blob',
      content: file.content,
    });
  }
  
  const createTreeResponse = await githubPost(`/repos/${owner}/${repo}/git/trees`, {
    base_tree: baseTreeSha,
    tree: newTree,
  });
  const newTreeData = await createTreeResponse.json() as { sha: string };
  
  // Create a new commit
  const createCommitResponse = await githubPost(`/repos/${owner}/${repo}/git/commits`, {
    message,
    tree: newTreeData.sha,
    parents: [latestCommitSha],
  });
  const newCommitData = await createCommitResponse.json() as { sha: string };
  
  // Update the reference
  const updateRefResponse = await githubPatch(`/repos/${owner}/${repo}/git/refs/heads/${branch}`, {
    sha: newCommitData.sha,
  });
  
  return await updateRefResponse.json();
}
