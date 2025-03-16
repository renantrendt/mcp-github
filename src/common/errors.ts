// GitHub API error classes

export class GitHubError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitHubError';
  }
}

export class GitHubValidationError extends GitHubError {
  response?: any;
  
  constructor(message: string, response?: any) {
    super(message);
    this.name = 'GitHubValidationError';
    this.response = response;
  }
}

export class GitHubResourceNotFoundError extends GitHubError {
  constructor(message: string) {
    super(message);
    this.name = 'GitHubResourceNotFoundError';
  }
}

export class GitHubAuthenticationError extends GitHubError {
  constructor(message: string) {
    super(message);
    this.name = 'GitHubAuthenticationError';
  }
}

export class GitHubPermissionError extends GitHubError {
  constructor(message: string) {
    super(message);
    this.name = 'GitHubPermissionError';
  }
}

export class GitHubRateLimitError extends GitHubError {
  constructor(message: string) {
    super(message);
    this.name = 'GitHubRateLimitError';
  }
}

export class GitHubConflictError extends GitHubError {
  constructor(message: string) {
    super(message);
    this.name = 'GitHubConflictError';
  }
}

// Type guard to check if an error is a GitHubError
export function isGitHubError(error: any): error is GitHubError {
  return (
    error instanceof GitHubError ||
    error instanceof GitHubValidationError ||
    error instanceof GitHubResourceNotFoundError ||
    error instanceof GitHubAuthenticationError ||
    error instanceof GitHubPermissionError ||
    error instanceof GitHubRateLimitError ||
    error instanceof GitHubConflictError
  );
}

import { Response } from 'node-fetch';

// Helper function to handle GitHub API responses
export async function handleGitHubResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null) as { message?: string } | null;
    const errorMessage = errorData?.message || `HTTP error ${response.status}`;
    
    if (response.status === 400) {
      throw new GitHubValidationError(errorMessage, errorData);
    } else if (response.status === 401) {
      throw new GitHubAuthenticationError(errorMessage);
    } else if (response.status === 403) {
      if (response.headers.get('x-ratelimit-remaining') === '0') {
        throw new GitHubRateLimitError('Rate limit exceeded');
      }
      throw new GitHubPermissionError(errorMessage);
    } else if (response.status === 404) {
      throw new GitHubResourceNotFoundError(errorMessage);
    } else if (response.status === 409) {
      throw new GitHubConflictError(errorMessage);
    } else {
      throw new GitHubError(errorMessage);
    }
  }
  
  return response;
}
