'use-strict'
const fetch = require('isomorphic-fetch')

const userRepositories = (username) => {
  const full_api_path = `https://api.github.com/users/${username}/repos?sort=created`
  return fetch(full_api_path).then(response => response.json())
}

const filterRepositories = (repositories) => {
  return repositories.filter(repo => !repo.fork && repo.homepage)
}

module.exports = {

  repositoriesChoices: (answers) => {
    return userRepositories(answers.username)
           .then(repositories => filterRepositories(repositories))
           .then(filtered => filtered.map(repo => ({ name: repo.name, value: repo, checked: true })))
  }

}
