'use-strict'
const fetch = require('isomorphic-fetch')

const userRepositories = (username) => {
  const full_api_path = `https://api.github.com/users/${username}/repos?sort=created`
  return fetch(full_api_path).then(response => response.json())
}

const filterRepositories = (repositories) => {
  return repositories.filter(repo => !repo.fork && repo.homepage)
}

const formatRepoChoice = (repo) => ({
  name: repo.name,
  value: repo,
  checked: true
})

module.exports = {

  noPagesRepoExists: (username) => {
    return fetch(`https://github.com/${username}/${username}.github.io`)
           .then(response => response.status !== 200)
  },

  repositoriesChoices: (username) => {
    return userRepositories(username)
           .then(repositories => filterRepositories(repositories))
           .then(filtered => filtered.map(repo => formatRepoChoice(repo)))
  }

}
