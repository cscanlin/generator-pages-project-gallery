'use-strict'

const fetch = require('isomorphic-fetch')

module.exports = {
  userRepositories: (username) => {
    const full_api_path = `https://api.github.com/users/${username}/repos?sort=created`
    return fetch(full_api_path).then(response => response.json())
  },

  filterRepositories: (repositories) => {
    return repositories.filter(repo => !repo.fork && repo.homepage)
  }

}
