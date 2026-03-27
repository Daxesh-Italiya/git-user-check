const BASE_URL = 'https://api.github.com';

class GitHubAPI {
  constructor(token) {
    this.token = token;
    this.headers = {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28'
    };
  }

  async makeRequest(endpoint, options = {}) {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.headers,
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  }

  async fetchAllPages(endpoint, params = {}, signal) {
    const allData = [];
    let page = 1;
    const perPage = 100;

    while (true) {
      // Check if request was aborted
      if (signal?.aborted) {
        throw new Error('Request cancelled');
      }

      const queryParams = new URLSearchParams({
        ...params,
        per_page: perPage,
        page: page
      });

      const response = await this.makeRequest(`${endpoint}?${queryParams}`, { signal });
      const data = await response.json();

      if (!Array.isArray(data) || data.length === 0) {
        break;
      }

      allData.push(...data);

      if (data.length < perPage) {
        break;
      }

      page++;

      if (page > 10) {
        console.warn('Pagination limit reached (1000 items)');
        break;
      }
    }

    return allData;
  }

  async getUserOrganizations(signal) {
    return this.fetchAllPages('/user/orgs', {}, signal);
  }

  async getReposForOwners(owners, signal, onProgress) {
    const allRepos = [];
    const totalOwners = owners.length;

    for (let i = 0; i < owners.length; i++) {
      if (signal?.aborted) {
        throw new Error('Request cancelled');
      }

      const owner = owners[i];
      onProgress?.(i + 1, totalOwners, `Fetching repositories for ${owner}...`);

      try {
        const repos = await this.fetchAllPages('/user/repos', {
          affiliation: owner.type === 'personal' ? 'owner' : 'organization_member',
          sort: 'full_name',
          direction: 'asc'
        }, signal);

        // Filter repos for specific owner if it's an org
        const filteredRepos = owner.type === 'personal' 
          ? repos.filter(repo => repo.owner.login === owner.login)
          : repos.filter(repo => repo.owner.login === owner.login);

        allRepos.push(...filteredRepos);
      } catch (error) {
        if (error.message === 'Request cancelled') {
          throw error;
        }
        console.warn(`Failed to fetch repos for ${owner.login}:`, error.message);
      }
    }

    return allRepos;
  }

  async getCurrentUser() {
    const response = await this.makeRequest('/user');
    return response.json();
  }

  async getAllRepos(signal) {
    return this.fetchAllPages('/user/repos', {
      affiliation: 'owner,collaborator,organization_member',
      sort: 'full_name',
      direction: 'asc'
    }, signal);
  }

  async getCollaborators(owner, repo, signal) {
    try {
      return await this.fetchAllPages(`/repos/${owner}/${repo}/collaborators`, {}, signal);
    } catch (error) {
      if (error.message === 'Request cancelled') {
        throw error;
      }
      if (error.message.includes('404')) {
        console.warn(`No access to collaborators for ${owner}/${repo}`);
        return [];
      }
      throw error;
    }
  }

  async removeCollaborator(owner, repo, username) {
    const response = await this.makeRequest(
      `/repos/${owner}/${repo}/collaborators/${username}`,
      { method: 'DELETE' }
    );
    return response.status === 204;
  }

  async addCollaborator(owner, repo, username, permission = 'push') {
    const response = await this.makeRequest(
      `/repos/${owner}/${repo}/collaborators/${username}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permission })
      }
    );
    return response.status === 201 || response.status === 204;
  }

  async getRateLimit() {
    const response = await this.makeRequest('/rate_limit');
    return response.json();
  }
}

export default GitHubAPI;
