'use strict'

const Nightmare = require('nightmare')
const yaml = require('js-yaml')
const fs = require('fs')
const url = require('url')
require('isomorphic-fetch')

const INIT_TIME = new Date().toISOString().split('.')[0]

const CONFIG = yaml.safeLoad(fs.readFileSync('./_config.yml', 'utf8'))

class Repository {

  constructor(repo_data, repo_config) {
    Object.keys(repo_data).forEach(key => {
      this[key] = repo_data[key]
    })
    if (!repo_data.homepage && !repo_config.screenshot_target) {
      throw new Error(`Need screenshot_target or homepage for ${repo_data.name}`)
    }
    this.screenshot_target = repo_config.screenshot_target ? repo_config.screenshot_target : this.homepage
    this.homepage = this.homepage ? this.homepage : repo_config.screenshot_target
    this.screenshot_width = repo_config.screenshot_width ? repo_config.screenshot_width : CONFIG.screenshot_width
    this.screenshot_height = repo_config.screenshot_height ? repo_config.screenshot_height : CONFIG.screenshot_height
    this.screenshot = this.screenshot_filename()
  }

  static retrieve(repo_config) {
    const token_param = process.env.GITHUB_API_KEY ? `access_token=${process.env.GITHUB_API_KEY}` : ''
    const full_api_path = `https://api.github.com/repos${url.parse(repo_config.repo_url).pathname}?${token_param}`
    return fetch(full_api_path).then(response => {
      return response.json()
    }).then(repo_data => {
      return new Repository(repo_data, repo_config)
    })
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
    fs.readdir(CONFIG.screenshot_directory, (err, file_names) => {
      file_names.forEach(file_name => {
        if (file_name !== '.keep') {
          fs.unlinkSync(`${CONFIG.screenshot_directory}/${file_name}`)
        }
      })
    })
  }

  capture_screenshots() {
    // https://github.com/rosshinkley/nightmare-examples/blob/master/docs/common-pitfalls/async-operations-loops.md
    const nightmare = Nightmare()
    nightmare.viewport(CONFIG.screenshot_width, CONFIG.screenshot_height)
    this.repositories.reduce((accumulator, repo) => {
      return accumulator.then(results => {
        return nightmare.goto(repo.screenshot_target)
          .viewport(repo.screenshot_width, repo.screenshot_height)
          .screenshot(`${CONFIG.screenshot_directory}/${repo.screenshot_filename()}`)
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

Promise.all(CONFIG.repositories.map(repo_config => {
  return Repository.retrieve(repo_config)
})).then((repositories) => new Screenshotter(repositories).run())
