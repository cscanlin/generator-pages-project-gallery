'use strict'
const Generator = require('yeoman-generator')
const chalk = require('chalk')
const execSync = require('child_process').execSync

const utils = require('./utils')

module.exports = Generator.extend({
  prompting: function () {
    this.log(`Welcome to the ${chalk.green('pages-project-gallery')} generator!`)

    let defaultUsername = ''
    try {
      defaultUsername = execSync('git config --get core.user').toString().trim()
    } catch (e) {
      this.log(
        chalk.red.bold('You don\'t have a username set in your git config. You should probably do that:\n') +
        chalk.cyan.underline('https://help.github.com/articles/set-up-git/')
      )
    }

    // TODO add option to attempt to initialize repo: https://github.com/generate/generate-gh-repo

    let prompts = [
      {
        type    : 'input',
        name    : 'username',
        message : 'What is your github username: ',
        default : defaultUsername,
      }
    ]

    try {
      execSync('ruby -v')
      prompts.push({
        type      : 'confirm',
        name      : 'installJekyll',
        message   : 'Ruby install detected - Would you like to install jekyll so you can run your site locally?',
        default   : true,
      })
    } catch (e) {
      this.log(chalk.red('No Ruby install found - please install ruby if you want to run your site locally'))
    }

    return this.prompt(prompts).then(function (answers) {
      this.answers = answers
    }.bind(this))
  },

  configuring: function () {
    this.log('configuring...')
  },

  writing: function () {
    return utils.userRepositories(this.answers.username).then(repositories =>
      utils.filterRepositories(repositories)
    ).then(filteredRepositories => {
      this.log(filteredRepositories.map(repo => repo.html_url))
      this._templateMap = {
        username: this.answers.username,
        installJekyll: this.answers.installJekyll,
        theme: 'jekyll-theme-slate',  // TODO add theme chooser
        repositories: filteredRepositories,
      }
      this.destinationRoot(`${this.answers.username}.github.io`)
      this.fs.copyTpl(
        this.templatePath('**/*'),
        this.destinationRoot(),
        this._templateMap
      )
      this.fs.copy(
        this.templatePath('.*'),
        this.destinationRoot()
      )
    })

  },

  install: function () {
    if (this.answers.installJekyll) {
      this.spawnCommandSync('gem', ['install', 'bundler'])
      this.spawnCommandSync('bundle', ['install'])
    }
    this.installDependencies({
      npm: true,
      bower: false,
      yarn: false
    })
  }
})
