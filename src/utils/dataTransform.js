export const extractOrganizations = (repos, currentUserLogin) => {
  const orgMap = new Map();

  repos.forEach(repo => {
    const ownerLogin = repo.owner.login;
    const isPersonal = ownerLogin === currentUserLogin;

    if (!isPersonal && !orgMap.has(ownerLogin)) {
      orgMap.set(ownerLogin, {
        login: ownerLogin,
        id: repo.owner.id,
        avatar_url: repo.owner.avatar_url,
        html_url: repo.owner.html_url,
        type: repo.owner.type
      });
    }
  });

  return Array.from(orgMap.values()).sort((a, b) =>
    a.login.localeCompare(b.login)
  );
};

export const filterReposByOrganization = (repos, orgFilter, currentUserLogin) => {
  if (orgFilter === 'all') {
    return repos;
  }

  if (orgFilter === 'personal') {
    return repos.filter(repo => repo.owner.login === currentUserLogin);
  }

  return repos.filter(repo => repo.owner.login === orgFilter);
};

export const aggregateUsers = (repos, collaboratorsMap) => {
  const userMap = new Map();

  repos.forEach(repo => {
    const collaborators = collaboratorsMap.get(repo.id) || [];

    collaborators.forEach(collaborator => {
      const username = collaborator.login;

      if (!userMap.has(username)) {
        userMap.set(username, {
          user: collaborator,
          repos: []
        });
      }

      const userData = userMap.get(username);
      const existingRepo = userData.repos.find(r => r.repo.id === repo.id);

      if (!existingRepo) {
        userData.repos.push({
          repo,
          permission: collaborator.role_name || 'read'
        });
      }
    });
  });

  return userMap;
};

export const sortUsersByRepoCount = (userMap) => {
  return Array.from(userMap.values())
    .sort((a, b) => b.repos.length - a.repos.length);
};

export const getUniqueOrganizations = (repos, currentUserLogin) => {
  const orgs = new Set();

  repos.forEach(repo => {
    if (repo.owner.login !== currentUserLogin) {
      orgs.add(repo.owner.login);
    }
  });

  return ['all', 'personal', ...Array.from(orgs).sort()];
};
