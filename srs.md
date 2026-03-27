# Software Requirements Specification (SRS)
## GitHub Collaborator Manager

**Version:** 1.0  
**Date:** March 27, 2026  
**Status:** Draft - Awaiting Development Approval

---

## 1. Introduction

### 1.1 Purpose
This document describes the requirements for a web-based GitHub repository collaborator management tool. The application will allow users to view, manage, and modify collaborators across all their GitHub repositories from a single interface.

### 1.2 Scope
- **In Scope:**
  - List all repositories for authenticated user (Personal + Organization)
  - Display collaborators per repository
  - Show Organization column in repository list
  - Filter repositories by Organization (All/Personal/Org1/Org2/etc.)
  - Aggregate unique users across all repositories
  - Remove collaborators from single or multiple repositories
  - Add collaborators to multiple repositories
  - Two-tab interface for easy navigation

- **Out of Scope:**
  - Organization-level team management
  - Repository creation/deletion
  - Issue/PR management
  - Webhook management

### 1.3 Tech Stack
- **Frontend:** React 18 + Vite
- **UI Library:** Ant Design (antd) 5.x
- **Styling:** Tailwind CSS with "tw-" prefix
- **API:** GitHub REST API v3 (client-side direct calls)
- **Authentication:** GitHub Personal Access Token (PAT)

---

## 2. Functional Requirements

### 2.1 Authentication & Token Input

**FR-001:** Token Input Form
- User shall enter GitHub Personal Access Token
- Token input must be masked (password field)
- Form must have validation (required field)
- Display error message for invalid tokens
- Show loading state during validation

**FR-002:** Token Security
- Token stored only in React state (memory)
- No localStorage/sessionStorage usage
- Token cleared on page refresh

### 2.2 Data Fetching

**FR-003:** Repository Fetching
- Fetch all repositories for authenticated user
- Handle pagination (max 100 per page)
- Support both public and private repositories
- Include repository metadata: name, full_name, private, html_url, owner

**FR-004:** Collaborator Fetching
- For each repository, fetch all collaborators
- Handle pagination for collaborators
- Include: login, id, avatar_url, permissions, role_name
- Display progress during fetching

**FR-005:** Data Aggregation
- Transform repository-centric data to user-centric
- Create mapping: User → List of repositories
- Calculate repository count per user
- Sort users by repository count (descending)

**FR-005a:** Organization Extraction
- Extract unique organizations from repository list
- Differentiate between personal account repos and organization repos
- Create organization filter options dynamically
- Store organization metadata (login, id, avatar_url)

### 2.3 User Interface - Tab 1: Repositories

**FR-006:** Repository List Display
- Display repositories in Ant Design Table
- Columns:
  - Repository Name (with link to GitHub)
  - Organization (display owner name - personal username or org name)
  - Visibility (Public/Private badge)
  - Collaborator Count
  - Actions (View button)

**FR-007:** Repository Table Features
- **Organization Filter:** Dropdown to filter by:
  - "All Repositories"
  - "Personal Account"
  - Individual organization names (dynamic list)
- Pagination (10/20/50 per page options)
- Sorting by name, organization, and collaborator count
- Expandable rows showing collaborator list
- Search/filter functionality by repo name

**FR-008:** Collaborator Actions per Repo
- View collaborator details in expanded row
- Quick remove button per collaborator
- Confirmation before removal

### 2.4 User Interface - Tab 2: User Management

**FR-009:** User List Display
- Display unique users in Ant Design Table
- Columns:
  - Avatar + Username
  - Repository Count (sorted descending by default)
  - Actions (Preview, Delete buttons)

**FR-010:** User Table Features
- Pagination
- Sorting by username and repo count
- Search/filter by username

**FR-011:** User Preview Modal
- Triggered by clicking Preview button
- Display user details:
  - Avatar and username
  - Total repository count
  - "Remove from All Repos" button (danger)
- Table showing:
  - Repository name
  - Permission level
  - Individual remove button per repo

**FR-012:** Remove Operations
- Remove from single repo with confirmation
- Remove from all repos with confirmation
- Show success/error messages
- Refresh data after removal

**FR-013:** Add User Functionality
- "Add User" button in User Management tab
- Modal with form:
  - Username input (required, validation)
  - Permission level select (pull/triage/push/maintain/admin)
  - Repository multi-select (mode="multiple")
- Add user to selected repositories
- Show progress and results

### 2.5 Error Handling & Feedback

**FR-014:** API Error Handling
- Handle 401/403 (authentication errors)
- Handle 404 (not found)
- Handle 422 (validation errors)
- Handle rate limiting (429)
- Display user-friendly error messages

**FR-015:** Loading States
- Show Spin/loading indicator during data fetch
- Show progress for multi-repo operations
- Disable buttons during operations

**FR-016:** Success Feedback
- Show success message on operations
- Use Ant Design message component
- Auto-dismiss after 3 seconds

---

## 3. Non-Functional Requirements

### 3.1 Performance
- **NFR-001:** Initial load should complete within 30 seconds for 50 repos
- **NFR-002:** Table rendering should handle 1000+ users smoothly
- **NFR-003:** API calls should use pagination to avoid timeouts

### 3.2 Security
- **NFR-004:** Token must never be persisted to storage
- **NFR-005:** All API calls must use HTTPS
- **NFR-006:** No token logging in console or error messages

### 3.3 Usability
- **NFR-007:** Responsive design (min width: 1024px)
- **NFR-008:** Intuitive two-tab navigation
- **NFR-009:** Confirmation dialogs for destructive actions
- **NFR-010:** Loading indicators for all async operations

### 3.4 Browser Support
- **NFR-011:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **NFR-012:** CORS must be supported by browser

---

## 4. System Architecture

### 4.1 Architecture Type
**Pure Client-Side Application** (No backend proxy required)

Rationale: GitHub API supports CORS for browser-based requests with PAT.

### 4.2 Component Hierarchy

```
App (Main Container)
├── TokenInput (Authentication)
└── MainInterface (Authenticated)
    ├── Tabs (Ant Design)
    │   ├── RepoTab
    │   │   └── RepositoryTable
    │   │       └── ExpandedCollaboratorList
    │   └── UserManagementTab
    │       ├── UserTable
    │       ├── AddUserButton
    │       ├── UserRepoModal
    │       │   └── RepoListTable
    │       └── AddUserModal
    │           └── AddUserForm
    └── Message/Notification Container
```

### 4.3 State Management

**Local React State Only** (No Redux/Zustand needed)

State Structure:
```javascript
{
  token: string | null,
  repos: Array<Repo>,
  collaboratorsMap: Map<repoId, Array<Collaborator>>,
  userMap: Map<username, UserWithRepos>,
  loading: boolean,
  activeTab: 'repos' | 'users',
  selectedUser: User | null,
  modalVisible: {
    userRepos: boolean,
    addUser: boolean
  }
}
```

---

## 5. API Integration

### 5.1 GitHub REST API Endpoints

| Operation | Method | Endpoint | Description |
|-----------|--------|----------|-------------|
| List Repositories | GET | `/user/repos?per_page=100&page={n}` | Fetch all repos with pagination |
| List Collaborators | GET | `/repos/{owner}/{repo}/collaborators?per_page=100&page={n}` | Fetch collaborators per repo |
| Remove Collaborator | DELETE | `/repos/{owner}/{repo}/collaborators/{username}` | Remove user from repo |
| Add Collaborator | PUT | `/repos/{owner}/{repo}/collaborators/{username}` | Add user to repo with permission |

### 5.2 Request Headers
```
Accept: application/vnd.github+json
Authorization: Bearer {TOKEN}
X-GitHub-Api-Version: 2022-11-28
```

### 5.3 Rate Limiting
- Authenticated requests: 5,000 per hour
- Header: `X-RateLimit-Remaining`
- Display remaining quota in UI

### 5.4 Token Permissions Required

**Classic PAT Scopes:**
- `repo` - Full control of private repositories
- `read:org` - Read organization data (for org repos)

**Fine-grained PAT Permissions:**
- Administration: Read and write (for collaborator management)
- Contents: Read (to list repos)
- Metadata: Read

---

## 6. Data Models

### 6.1 Repository
```typescript
interface Repository {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  html_url: string;
  owner: {
    login: string;
  };
}
```

### 6.2 Collaborator
```typescript
interface Collaborator {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  permissions: {
    pull: boolean;
    push: boolean;
    admin: boolean;
  };
  role_name: string;
}
```

### 6.3 UserWithRepos (Aggregated)
```typescript
interface UserWithRepos {
  user: Collaborator;
  repos: Array<{
    repo: Repository;
    permission: string;
  }>;
}
```

### 6.4 Organization Filter
```typescript
interface Organization {
  login: string;
  id: number;
  avatar_url: string;
}

type OrgFilter = 'all' | 'personal' | string; // 'all', 'personal', or org login name
```

---

## 7. UI/UX Specifications

### 7.1 Layout
- Container: max-width 1400px, centered
- Padding: 24px (tw-p-6)
- Background: gray-100 (tw-bg-gray-100)
- Card background: white (tw-bg-white)

### 7.2 Color Scheme
- Primary: Ant Design blue
- Success: green
- Warning: orange
- Error: red
- Text: gray-800, gray-600

### 7.3 Components to Use (Ant Design)

| Feature | Components |
|---------|-----------|
| Token Input | Form, Input.Password, Button, Alert |
| Navigation | Tabs, TabPane |
| Data Display | Table, Avatar, Tag, Badge |
| Filters | Select (organization dropdown) |
| Modals | Modal, Popconfirm |
| Forms | Form, Input, Select, Button |
| Feedback | message, Spin, Skeleton |
| Icons | EyeOutlined, DeleteOutlined, UserAddOutlined, FilterOutlined |

### 7.4 Tailwind Utility Classes

```css
/* Layout */
.tw-min-h-screen
.tw-max-w-6xl
.tw-mx-auto
.tw-p-6
.tw-mb-6

/* Spacing */
.tw-space-y-4
.tw-space-x-2
.tw-gap-4

/* Colors */
.tw-bg-gray-100
.tw-bg-white
.tw-rounded-lg
.tw-shadow

/* Typography */
.tw-text-2xl
.tw-font-bold
.tw-text-gray-800
```

---

## 8. File Structure

```
github-collab-manager/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── TokenInput.jsx
│   │   ├── RepoTab.jsx
│   │   ├── UserManagementTab.jsx
│   │   ├── UserRepoModal.jsx
│   │   └── AddUserModal.jsx
│   ├── services/
│   │   └── githubApi.js
│   ├── hooks/
│   │   └── useGitHubData.js
│   ├── utils/
│   │   └── dataTransform.js
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── srs.md (this file)
```

---

## 9. Development Checklist

### Phase 1: Project Setup
- [ ] Initialize Vite React project
- [ ] Install dependencies (antd, tailwindcss)
- [ ] Configure Tailwind with "tw-" prefix
- [ ] Setup project structure

### Phase 2: Core Services
- [ ] Create GitHubAPI class with all endpoints
- [ ] Implement pagination handling
- [ ] Implement error handling
- [ ] Create data transformation utilities

### Phase 3: UI Components
- [ ] TokenInput component
- [ ] RepoTab with Table
- [ ] UserManagementTab with Table
- [ ] UserRepoModal
- [ ] AddUserModal

### Phase 4: Integration
- [ ] Connect components to API service
- [ ] Implement state management
- [ ] Add loading states
- [ ] Add error handling

### Phase 5: Polish
- [ ] Add responsive styles
- [ ] Test with real GitHub token
- [ ] Handle edge cases
- [ ] Performance optimization

---

## 10. Testing Scenarios

### 10.1 Authentication
- Valid token acceptance
- Invalid token rejection with error
- Empty token validation

### 10.2 Data Fetching
- User with 0 repos
- User with 100+ repos (pagination)
- Repo with 0 collaborators
- Repo with 50+ collaborators

### 10.3 User Management
- Remove from single repo
- Remove from all repos
- Add user to single repo
- Add user to multiple repos
- Add existing user (update permission)

### 10.4 Error Cases
- Rate limit exceeded
- Network failure
- Insufficient permissions
- User not found
- Repository not found

---

## 11. Deployment

### 11.1 Build Configuration
```bash
npm run build
```

### 11.2 Output
- Static files in `dist/` directory
- Can be deployed to any static hosting (Netlify, Vercel, GitHub Pages)

### 11.3 Environment
- No environment variables needed
- GitHub token entered by user at runtime

---

## 12. Future Enhancements (v2.0)

- [ ] Organization repository support
- [ ] Team management integration
- [ ] Bulk operations queue
- [ ] Export collaborator list to CSV
- [ ] Repository permission templates
- [ ] Activity audit log
- [ ] Dark mode support

---

## 13. Approval

**Developer:** _________________ Date: _________________  
**Reviewer:** _________________ Date: _________________  
**Status:** ☐ Approved ☐ Needs Revision

**Revision Notes:**
_______________________________________________
_______________________________________________

---

**END OF DOCUMENT**
