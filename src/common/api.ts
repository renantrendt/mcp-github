import fetch from 'node-fetch';
import { handleGitHubResponse } from './errors.js';

// Get the GitHub token from environment variables
const GITHUB_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

if (!GITHUB_TOKEN) {
  console.error('GITHUB_PERSONAL_ACCESS_TOKEN environment variable is required');
  process.exit(1);
}

// Base GitHub API URL
export const GITHUB_API_URL = 'https://api.github.com';

// Headers for GitHub API requests
export const getHeaders = () => ({
  'Authorization': `token ${GITHUB_TOKEN}`,
  'Accept': 'application/vnd.github.v3+json',
  'Content-Type': 'application/json',
  'User-Agent': 'GitHub-MCP-Server'
});

// Generic GET request to GitHub API
export async function githubGet(endpoint: string, params: Record<string, any> = {}) {
  // Build query string from params
  const queryParams = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${key}=${value.join(',')}`;
      }
      return `${key}=${encodeURIComponent(String(value))}`;
    })
    .join('&');

  const url = `${GITHUB_API_URL}${endpoint}${queryParams ? `?${queryParams}` : ''}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(),
  });
  
  return handleGitHubResponse(response);
}

// Generic POST request to GitHub API
export async function githubPost(endpoint: string, data: any) {
  const response = await fetch(`${GITHUB_API_URL}${endpoint}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  
  return handleGitHubResponse(response);
}

// Generic PATCH request to GitHub API
export async function githubPatch(endpoint: string, data: any) {
  const response = await fetch(`${GITHUB_API_URL}${endpoint}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  
  return handleGitHubResponse(response);
}

// Generic PUT request to GitHub API
export async function githubPut(endpoint: string, data: any) {
  const response = await fetch(`${GITHUB_API_URL}${endpoint}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  
  return handleGitHubResponse(response);
}

// Generic DELETE request to GitHub API
export async function githubDelete(endpoint: string) {
  const response = await fetch(`${GITHUB_API_URL}${endpoint}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  
  return handleGitHubResponse(response);
}
