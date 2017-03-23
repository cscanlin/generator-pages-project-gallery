'use strict'
const chalk = require('chalk')
const execSync = require('child_process').execSync
const Generator = require('yeoman-generator')
const GitHub = require('github-base')
const path = require('path')

const utils = require('./utils')
const themeChoices = require('./themeChoices.json')

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

    let prompts = [
      {
        type    : 'input',
        name    : 'username',
        message : 'What is your github username: ',
        default : defaultUsername,
      },
      {
        type    : 'list',
        name    : 'theme',
        message : `Select your theme:\n${chalk.italic('The following are supported by github, but most jekyll themes will work - https://pages.github.com/themes/:')}`,
        choices : themeChoices,
        default : 'jekyll-theme-cayman',
      },
      {
        type    : 'checkbox',
        name    : 'repositories',
        message : 'Select which repositories to include. (Repositories only listed if not forked, and have a homepage set): ',
        choices : (answers) => utils.repositoriesChoices(answers.username),
      },
      {
        when    : (answers) => utils.noPagesRepoExists(answers.username),
        type    : 'confirm',
        name    : 'createRepository',
        message : (answers) => `No repo found for ${answers.username}.github.io. Would you like to try to make one?`,
        default : true,
      },
      {
        when    : (answers) => answers.createRepository,
        type    : 'password',
        name    : 'password',
        message : 'What is your github password?: ',
      }
    ]

    try {
      execSync('ruby -v')
      prompts.push({
        type    : 'confirm',
        name    : 'installJekyll',
        message : 'Ruby install detected - Would you like to install jekyll so you can run your site locally?',
        default : true,
      })
    } catch (e) {
      this.log(chalk.red('No Ruby install found - please install ruby if you want to run your site locally'))
    }

    return this.prompt(prompts).then(function (answers) {
      this.answers = answers
      this.rootName = `${answers.username}.github.io`
    }.bind(this))
  },

  configuring: function () {
    if (this.answers.createRepository && this.answers.password) {
      const github = new GitHub({
        username: this.answers.username,
        password: this.answers.password,
      })
      const opts = {
        name: this.rootName,
        homepage: `https://${this.rootName}`,
        description: 'A simple project portfolio page',
      }
      github.post('/user/repos', opts, (err, res) => {
        if (res.id !== 'undefined') {
          this.log(chalk.bold.underline(opts.name) + chalk.bold.green(' was created successfully'))
        } else {
          this.log(chalk.bold.red(res.message))
        }
      })
    }
  },

  writing: function () {
    if (path.basename(process.cwd()) !== this.rootName) {
      this.destinationRoot(this.rootName)
    }
    this.fs.copyTpl(
      this.templatePath('**/*'),
      this.destinationRoot(),
      this.answers
    )
    this.fs.copy(
      this.templatePath('.*'),
      this.destinationRoot()
    )
    this.fs.copy(
      this.templatePath('**/*/.*'),
      this.destinationRoot()
    )
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
  },

  end: function () {
    execSync(`git init`)
    const gitURL = `https://github.com/${this.answers.username}/${this.rootName}.git`
    try {
      execSync(`git remote add origin ${gitURL} 2>/dev/null`)
    } catch (e) {
      execSync(`git remote set-url origin ${gitURL} 2>/dev/null`)
    }
  }

})
