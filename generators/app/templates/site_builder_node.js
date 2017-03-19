'use strict'

const Nightmare = require('nightmare')
const yaml = require('js-yaml')
const fs = require('fs')
const url = require('url')
require('isomorphic-fetch')

const INIT_TIME = new Date().toISOString().split('.')[0]

const config = yaml.safeLoad(fs.readFileSync('./_config.yml', 'utf8'))

class Repository {

  constructor(repo_data, screenshot_target) {
    Object.keys(repo_data).forEach(key => {
      this[key] = repo_data[key]
    })
    if (!repo_data.homepage && !screenshot_target) {
      throw new Error(`Need screenshot_target or homepage for ${repo_data.name}`)
    }
    this.screenshot_target = screenshot_target ? screenshot_target : this.homepage
    this.homepage = this.homepage ? this.homepage : screenshot_target
    this.screenshot = this.screenshot_filename()
  }

  static retrieve_from_url(repo_url, screenshot_target) {
    const full_api_path = `https://api.github.com/repos${url.parse(repo_url).pathname}`
    return fetch(full_api_path).then(response => {
      return response.json()
    }).then(repo_data => {
      return new Repository(repo_data, screenshot_target)
    })
  }

  static _parse_data_from_url(repo_url, screenshot_target) {
    const repo_data = {
      name: repo_url.split('/').reverse()[0],
      html_url: repo_url,
    }
    repo_data.homepage = `https://cscanlin.github.io/${repo_data.name}`
    return new Repository(repo_data, screenshot_target)
  }

  screenshot_filename() {
    return `${this.name}_${INIT_TIME}.png`
  }

  sorted() {
    // http://stackoverflow.com/a/29622653/1883900
    return Object.keys(this).sort().reduce((r, k) => (r[k] = this[k], r), {})
  }
}

class Screenshotter {
  constructor(repositories) {
    this.repositories = repositories
  }

  clear_screenshot_directory() {
    fs.readdir(config.screenshot_directory, (err, file_names) => {
      file_names.forEach(file_name => {
        if (file_name !== '.keep') {
          fs.unlinkSync(`${config.screenshot_directory}/${file_name}`)
        }
      })
    })
  }

  capture_screenshots() {
    // https://github.com/rosshinkley/nightmare-examples/blob/master/docs/common-pitfalls/async-operations-loops.md
    const nightmare = Nightmare()
    nightmare.viewport(config.screenshot_width, config.screenshot_height)
    this.repositories.reduce((accumulator, repo) => {
      return accumulator.then(results => {
        return nightmare.goto(repo.screenshot_target)
          .screenshot(`${config.screenshot_directory}/${repo.screenshot_filename()}`)
          .then(result => {
            console.log(`Finished: ${repo.name}`)
            results.push(result)
            return results
          })
      })
    }, Promise.resolve([])).then(results => {
        nightmare.end().then(() => {
          console.log('All finished!')
        })
    })
  }

  dump_repo_data() {
    const sorted_repositories = this.repositories.map(repo => repo.sorted())
    fs.writeFileSync('_data/repo_data.yml', yaml.safeDump(sorted_repositories))
    console.log('Finished Dumping Data')
  }

  run() {
    this.clear_screenshot_directory()
    this.dump_repo_data()
    this.capture_screenshots()
  }

}

Promise.all(config.repositories.map(repo => {
  return Repository.retrieve_from_url(repo.repo_url, repo.screenshot_target)
})).then((repositories) => new Screenshotter(repositories).run())
