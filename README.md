# generator-pages-project-gallery

A yeoman generator to easily create a simple project gallery on github pages, using your other github repositories as input.

Live Demo: https://cscanlin.github.io/

## Installation

*Note: For the generator to work correctly you should have at least one public Github repository that you are the owner of, and that also has a homepage listed in the space next to the top description of your repo.*

### Quickstart

```bash
npm install -g yo
npm install -g generator-pages-project-gallery
yo pages-project-gallery
# run through the prompts
npm run build
npm start  # to view locally
git commit -am "initial github pages personal page"
git push origin master
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
  └─ site_builder_node.js
```

You then have a chance to further customize your page. You can control which repositories are included on your page, which page is targeted for screenshot, and individual/default screnshot size in `_config.yml`:

```
# Site Builder Options
screenshot_width: 1280
screenshot_height: 800
repositories:
  - repo_url: https://github.com/USERNAME/my-project
    screenshot_target: http://www.my-project.com/alternative/screenshot/target_page
    screenshot_height: 450

  - repo_url: https://github.com/USERNAME/my-other-project
```

### More Customization

If you want to customize further, jekyll is extremely flexible and very easy to extend. A good place to start is in `index.html` and `_includes/gallery.html`.

This generator can be run in *any* existing jekyll project as well (Though make sure to watch for conflicts!)

See the jekyll documentation for more details: https://jekyllrb.com/docs/home/


### TODO

- Multiple Pages Boilerplate
- Gitlab support

### License

MIT © [cscanlin](https://cscanlin.github.io/)
