#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Import operations modules (we'll create these next)
import * as repository from './operations/repository.js';
import * as files from './operations/files.js';
import * as issues from './operations/issues.js';
import * as pulls from './operations/pulls.js';
import * as branches from './operations/branches.js';
import * as search from './operations/search.js';
import * as commits from './operations/commits.js';

// Import error handling utilities
import {
  GitHubError,
  GitHubValidationError,
  GitHubResourceNotFoundError,
  GitHubAuthenticationError,
  GitHubPermissionError,
  GitHubRateLimitError,
  GitHubConflictError,
  isGitHubError,
} from './common/errors.js';

// Create the MCP server
const server = new Server(
  {
    name: "github-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Helper function to format GitHub errors
function formatGitHubError(error: GitHubError): string {
  let message = `GitHub API Error: ${error.message}`;
  
  if (error instanceof GitHubValidationError) {
    message = `Validation Error: ${error.message}`;
    if (error.response) {
      message += `\nDetails: ${JSON.stringify(error.response)}`;
    }
  } else if (error instanceof GitHubResourceNotFoundError) {
    message = `Resource Not Found: ${error.message}`;
  } else if (error instanceof GitHubAuthenticationError) {
    message = `Authentication Error: ${error.message}. Please check your GitHub token.`;
  } else if (error instanceof GitHubPermissionError) {
    message = `Permission Error: ${error.message}. Your token may not have the required permissions.`;
  } else if (error instanceof GitHubRateLimitError) {
    message = `Rate Limit Error: ${error.message}. Please try again later.`;
  } else if (error instanceof GitHubConflictError) {
    message = `Conflict Error: ${error.message}. The operation conflicts with the current state.`;
  }
  
  return message;
}

// Register list_tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_repository",
        description: "Create a new GitHub repository in your account",
        schema: zodToJsonSchema(repository.CreateRepositorySchema),
      },
      {
        name: "fork_repository",
        description: "Fork a GitHub repository to your account or specified organization",
        schema: zodToJsonSchema(repository.ForkRepositorySchema),
      },
      {
        name: "create_or_update_file",
        description: "Create or update a single file in a GitHub repository",
        schema: zodToJsonSchema(files.CreateOrUpdateFileSchema),
      },
      {
        name: "get_file_contents",
        description: "Get the contents of a file or directory from a GitHub repository",
        schema: zodToJsonSchema(files.GetFileContentsSchema),
      },
      {
        name: "push_files",
        description: "Push multiple files to a GitHub repository in a single commit",
        schema: zodToJsonSchema(files.PushFilesSchema),
      },
      {
        name: "create_issue",
        description: "Create a new issue in a GitHub repository",
        schema: zodToJsonSchema(issues.CreateIssueSchema),
      },
      {
        name: "update_issue",
        description: "Update an existing issue in a GitHub repository",
        schema: zodToJsonSchema(issues.UpdateIssueSchema),
      },
      {
        name: "list_issues",
        description: "List issues in a GitHub repository with filtering options",
        schema: zodToJsonSchema(issues.ListIssuesSchema),
      },
      {
        name: "add_issue_comment",
        description: "Add a comment to an existing issue",
        schema: zodToJsonSchema(issues.IssueCommentSchema),
      },
      {
        name: "get_issue",
        description: "Get details of a specific issue in a GitHub repository.",
        schema: zodToJsonSchema(issues.GetIssueSchema),
      },
      {
        name: "create_pull_request",
        description: "Create a new pull request in a GitHub repository",
        schema: zodToJsonSchema(pulls.CreatePullRequestSchema),
      },
      {
        name: "create_branch",
        description: "Create a new branch in a GitHub repository",
        schema: zodToJsonSchema(branches.CreateBranchSchema),
      },
      {
        name: "search_code",
        description: "Search for code across GitHub repositories",
        schema: zodToJsonSchema(search.SearchCodeSchema),
      },
      {
        name: "search_repositories",
        description: "Search for GitHub repositories",
        schema: zodToJsonSchema(search.SearchRepositoriesSchema),
      },
      {
        name: "search_issues",
        description: "Search for issues and pull requests across GitHub repositories",
        schema: zodToJsonSchema(search.SearchIssuesSchema),
      },
      {
        name: "search_users",
        description: "Search for users on GitHub",
        schema: zodToJsonSchema(search.SearchUsersSchema),
      },
      {
        name: "list_commits",
        description: "Get list of commits of a branch in a GitHub repository",
        schema: zodToJsonSchema(commits.ListCommitsSchema),
      },
    ],
  };
});

// Register call_tool handler
server.setRequestHandler(CallToolRequestSchema, async (request: z.infer<typeof CallToolRequestSchema>) => {
  try {
    switch (request.params.name) {
      case "create_repository": {
        const args = repository.CreateRepositorySchema.parse(request.params.arguments);
        const result = await repository.createRepository(
          args.name,
          args.description,
          args.private,
          args.autoInit
        );
        return { toolResult: result };
      }

      case "fork_repository": {
        const args = repository.ForkRepositorySchema.parse(request.params.arguments);
        const result = await repository.forkRepository(
          args.owner,
          args.repo,
          args.organization
        );
        return { toolResult: result };
      }

      case "create_or_update_file": {
        const args = files.CreateOrUpdateFileSchema.parse(request.params.arguments);
        const result = await files.createOrUpdateFile(
          args.owner,
          args.repo,
          args.path,
          args.message,
          args.content,
          args.branch,
          args.sha
        );
        return { toolResult: result };
      }

      case "get_file_contents": {
        const args = files.GetFileContentsSchema.parse(request.params.arguments);
        const result = await files.getFileContents(
          args.owner,
          args.repo,
          args.path,
          args.branch
        );
        return { toolResult: result };
      }

      case "push_files": {
        const args = files.PushFilesSchema.parse(request.params.arguments);
        const result = await files.pushFiles(
          args.owner,
          args.repo,
          args.branch,
          args.message,
          args.files
        );
        return { toolResult: result };
      }

      case "create_issue": {
        const args = issues.CreateIssueSchema.parse(request.params.arguments);
        const result = await issues.createIssue(
          args.owner,
          args.repo,
          args.title,
          args.body,
          args.labels,
          args.assignees,
          args.milestone
        );
        return { toolResult: result };
      }

      case "update_issue": {
        const args = issues.UpdateIssueSchema.parse(request.params.arguments);
        const result = await issues.updateIssue(
          args.owner,
          args.repo,
          args.issue_number,
          args.title,
          args.body,
          args.state,
          args.labels,
          args.assignees,
          args.milestone
        );
        return { toolResult: result };
      }

      case "list_issues": {
        const args = issues.ListIssuesSchema.parse(request.params.arguments);
        const result = await issues.listIssues(
          args.owner,
          args.repo,
          args.state,
          args.sort,
          args.direction,
          args.since,
          args.labels,
          args.page,
          args.per_page
        );
        return { toolResult: result };
      }

      case "create_pull_request": {
        const args = pulls.CreatePullRequestSchema.parse(request.params.arguments);
        const result = await pulls.createPullRequest(
          args.owner,
          args.repo,
          args.title,
          args.body,
          args.head,
          args.base,
          args.draft,
          args.maintainer_can_modify
        );
        return { toolResult: result };
      }

      case "create_branch": {
        const args = branches.CreateBranchSchema.parse(request.params.arguments);
        const result = await branches.createBranch(
          args.owner,
          args.repo,
          args.branch,
          args.from_branch
        );
        return { toolResult: result };
      }

      case "search_code": {
        const args = search.SearchCodeSchema.parse(request.params.arguments);
        const result = await search.searchCode(
          args.q,
          args.order,
          args.page,
          args.per_page
        );
        return { toolResult: result };
      }

      case "search_repositories": {
        const args = search.SearchRepositoriesSchema.parse(request.params.arguments);
        const result = await search.searchRepositories(
          args.query,
          args.page,
          args.perPage
        );
        return { toolResult: result };
      }

      case "search_issues": {
        const args = search.SearchIssuesSchema.parse(request.params.arguments);
        const result = await search.searchIssues(
          args.q,
          args.sort,
          args.order,
          args.page,
          args.per_page
        );
        return { toolResult: result };
      }

      case "search_users": {
        const args = search.SearchUsersSchema.parse(request.params.arguments);
        const result = await search.searchUsers(
          args.q,
          args.sort,
          args.order,
          args.page,
          args.per_page
        );
        return { toolResult: result };
      }

      case "add_issue_comment": {
        const args = issues.IssueCommentSchema.parse(request.params.arguments);
        const { owner, repo, issue_number, body } = args;
        const result = await issues.addIssueComment(owner, repo, issue_number, body);
        return { toolResult: result };
      }

      case "list_commits": {
        const args = commits.ListCommitsSchema.parse(request.params.arguments);
        const results = await commits.listCommits(
          args.owner,
          args.repo,
          args.page,
          args.perPage,
          args.sha
        );
        return { toolResult: results };
      }

      case "get_issue": {
        const args = issues.GetIssueSchema.parse(request.params.arguments);
        const issue = await issues.getIssue(args.owner, args.repo, args.issue_number);
        return { toolResult: issue };
      }

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid input: ${JSON.stringify(error.errors)}`);
    }
    if (isGitHubError(error)) {
      throw new Error(formatGitHubError(error));
    }
    throw error;
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("GitHub MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});
