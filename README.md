# GitHub Collab Manager

A modern React application for managing GitHub repository collaborators efficiently. This tool provides an intuitive interface to view, add, and remove collaborators across multiple repositories and organizations.

## Live Demo

[https://tst-github-manager.netlify.app/](https://tst-github-manager.netlify.app/)

## Introduction

GitHub Collab Manager simplifies the process of managing repository access by providing:

- **Multi-Organization Support**: Manage repositories across personal accounts and organizations
- **User Management**: View all collaborators, their repository access, and manage permissions
- **Repository Overview**: Browse repositories and their collaborator lists
- **Bulk Operations**: Add or remove users from multiple repositories at once
- **Dark/Light Theme**: Switch between themes for comfortable viewing
- **Secure Authentication**: Uses GitHub Personal Access Tokens (stored only in memory)

## Tech Stack

- **Frontend**: React 19 + Vite
- **UI Library**: Ant Design 6
- **Styling**: Tailwind CSS 4
- **Icons**: @ant-design/icons
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- GitHub Personal Access Token with `repo` and `read:org` scopes

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd github-collab-manager

# Install dependencies
npm install

# Start development server
npm run dev
```

### Building for Production

```bash
npm run build
```

## Usage

1. **Authentication**: Enter your GitHub Personal Access Token
2. **Organization Selection**: Choose which organizations to manage
3. **Dashboard**: 
   - **User Management Tab**: View all collaborators and their repository access
   - **Repositories Tab**: Browse repositories and manage collaborators per repo
4. **Actions**:
   - Add users to repositories with specific permissions
   - Remove users from individual or all repositories
   - Preview user access across all repositories

## Features

### User Management
- View all collaborators across selected organizations
- See repository count and access levels for each user
- Remove users from specific repositories or all at once
- Add new collaborators with configurable permissions (read, write, admin)

### Repository Management
- Browse all repositories with filtering by organization
- View collaborators for each repository
- Remove collaborators directly from the repository view

### Security
- Token is stored only in memory (never persisted)
- No server-side storage or processing
- Direct GitHub API integration

## Author

**Daxesh Italiya**
- Email: daxeshitaliya58@gmail.com

## License

This project is open source and available under the MIT License.

---

Built with React + Vite
