# GitHub MCP Server

A Model Context Protocol (MCP) server for interacting with GitHub. This tool allows AI assistants to perform various GitHub operations including repository management, file operations, issue tracking, and more.

## Features

- **Repository Operations**: Create repositories, fork repositories
- **File Operations**: Create, update, and read files, push multiple files in a single commit
- **Issue Management**: Create, update, list, and comment on issues
- **Pull Requests**: Create pull requests
- **Branch Management**: Create branches
- **Search Capabilities**: Search code, repositories, issues, and users
- **Commit History**: List commits

## Setup

### Prerequisites

- Node.js 18 or higher
- A GitHub Personal Access Token with appropriate permissions

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Build the project:
   ```
   npm run build
   ```

### Configuration

This MCP server requires a GitHub Personal Access Token to authenticate with the GitHub API. The token should be provided as an environment variable:

```
GITHUB_PERSONAL_ACCESS_TOKEN=your_token_here
```

When deploying with Smithery, the token is configured through the `githubPersonalAccessToken` configuration option.

## Usage

### Running Locally

To run the server locally:

```
GITHUB_PERSONAL_ACCESS_TOKEN=your_token_here node dist/index.js
```

### Deploying with Smithery

This repository includes the necessary configuration files for deploying with Smithery:

- `Dockerfile`: Defines how to build the Docker image for the MCP server
- `smithery.yaml`: Configures how Smithery should start the MCP server

Refer to the [Smithery documentation](https://smithery.ai/docs) for deployment instructions.

## Development

### Building

```
npm run build
```

### Linting

```
npm run lint
```

## License

MIT
