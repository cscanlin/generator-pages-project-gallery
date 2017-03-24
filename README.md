# generator-pages-project-gallery

A yeoman generator to easily create a simple project gallery on github pages, using your other github repositories as input.

Live Demo: https://cscanlin.github.io/

## Installation

*Note: For the generator to work correctly, you should be the owner of at least one public Github repository that has a homepage listed in the space next to its top description.*

### Quickstart

```bash
npm install -g yo
npm install -g generator-pages-project-gallery
yo pages-project-gallery
# run through the prompts
npm run scrape  # retrieve data / capture screenshots
npm start  # run your site locally at http://127.0.0.1:4000/
git commit -am "initial github pages personal page"  # create a repo first if not done in generator
git push origin master  # deploy and see it live at https://USERNAME.github.io
```


## Additional Details

After running through the generator, the following files / directory structure will be added:

```
└- USERNAME.github.io
  ├─ _data
  ├─ _includes
  │  └─ gallery.html
  ├─ assets
  │  ├─ css
  │  │  └─ style.scss
  │  └─ images
  │     └─ screenshots
  ├─ _config.yml
  ├─ .eslintrc.yml
  ├─ .gitignore
  ├─ Gemfile
  ├─ Gemfile.lock
  ├─ index.html
  ├─ LICENSE
  ├─ package.json
  ├─ README.md
  └─ repository_scraper.js
```

You then have a chance to further customize your page. You can control which repositories are included on your page, which page is targeted for screenshot, and individual/default screnshot size in `_config.yml`:

```
# Repository Scraper Options
screenshot_width: 1280
screenshot_height: 800
repositories:
  - repo_url: https://github.com/USERNAME/my-project
    screenshot_target: https://www.my-project.com/alternative/screenshot/target_page
    screenshot_height: 450

  - repo_url: https://github.com/USERNAME/my-other-project
```

### More Customization

If you want to customize further, jekyll is extremely flexible and very easy to extend. `index.html` and `_includes/gallery.html` are good places to start.

This generator can be run in *any* existing jekyll project as well (Though make sure to watch for conflicts!)

See the jekyll documentation for more details: https://jekyllrb.com/docs/home/


### TODO

- travis
- Multiple pages boilerplate
- Better options for choosing repos
- Gitlab support?
- README:
  - upgrading / diffs

### License

MIT © [cscanlin](https://cscanlin.github.io/)
