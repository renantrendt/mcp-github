import { z } from 'zod';
import { githubGet, githubPost, githubPatch } from '../common/api.js';

// Schema for creating an issue
export const CreateIssueSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  title: z.string(),
  body: z.string(),
  labels: z.array(z.string()).optional(),
  assignees: z.array(z.string()).optional(),
  milestone: z.number().optional(),
});

// Schema for updating an issue
export const UpdateIssueSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  issue_number: z.number(),
  title: z.string().optional(),
  body: z.string().optional(),
  state: z.enum(['open', 'closed']).optional(),
  labels: z.array(z.string()).optional(),
  assignees: z.array(z.string()).optional(),
  milestone: z.number().optional(),
});

// Schema for listing issues
export const ListIssuesSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  state: z.enum(['open', 'closed', 'all']).optional(),
  sort: z.enum(['created', 'updated', 'comments']).optional(),
  direction: z.enum(['asc', 'desc']).optional(),
  since: z.string().optional(),
  labels: z.array(z.string()).optional(),
  page: z.number().optional(),
  per_page: z.number().optional(),
});

// Schema for adding a comment to an issue
export const IssueCommentSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  issue_number: z.number(),
  body: z.string(),
});

// Schema for getting a specific issue
export const GetIssueSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  issue_number: z.number(),
});

// Create a new issue
export async function createIssue(
  owner: string,
  repo: string,
  title: string,
  body: string,
  labels?: string[],
  assignees?: string[],
  milestone?: number
) {
  const endpoint = `/repos/${owner}/${repo}/issues`;
  
  const data: any = {
    title,
    body,
  };
  
  if (labels) data.labels = labels;
  if (assignees) data.assignees = assignees;
  if (milestone) data.milestone = milestone;
  
  const response = await githubPost(endpoint, data);
  
  return await response.json();
}

// Update an existing issue
export async function updateIssue(
  owner: string,
  repo: string,
  issue_number: number,
  title?: string,
  body?: string,
  state?: 'open' | 'closed',
  labels?: string[],
  assignees?: string[],
  milestone?: number
) {
  const endpoint = `/repos/${owner}/${repo}/issues/${issue_number}`;
  
  const data: any = {};
  
  if (title !== undefined) data.title = title;
  if (body !== undefined) data.body = body;
  if (state !== undefined) data.state = state;
  if (labels !== undefined) data.labels = labels;
  if (assignees !== undefined) data.assignees = assignees;
  if (milestone !== undefined) data.milestone = milestone;
  
  const response = await githubPatch(endpoint, data);
  
  return await response.json();
}

// List issues in a repository
export async function listIssues(
  owner: string,
  repo: string,
  state?: 'open' | 'closed' | 'all',
  sort?: 'created' | 'updated' | 'comments',
  direction?: 'asc' | 'desc',
  since?: string,
  labels?: string[],
  page?: number,
  per_page?: number
) {
  const endpoint = `/repos/${owner}/${repo}/issues`;
  
  const params: any = {};
  
  if (state) params.state = state;
  if (sort) params.sort = sort;
  if (direction) params.direction = direction;
  if (since) params.since = since;
  if (labels) params.labels = labels;
  if (page) params.page = page;
  if (per_page) params.per_page = per_page;
  
  const response = await githubGet(endpoint, params);
  
  return await response.json();
}

// Add a comment to an issue
export async function addIssueComment(
  owner: string,
  repo: string,
  issue_number: number,
  body: string
) {
  const endpoint = `/repos/${owner}/${repo}/issues/${issue_number}/comments`;
  
  const response = await githubPost(endpoint, { body });
  
  return await response.json();
}

// Get a specific issue
export async function getIssue(
  owner: string,
  repo: string,
  issue_number: number
) {
  const endpoint = `/repos/${owner}/${repo}/issues/${issue_number}`;
  
  const response = await githubGet(endpoint);
  
  return await response.json();
}
