# Static Demo Template
This is a stripped down version of [Jekyll Base](https://github.com/Gizra/jekyll-base)
made specifically for doing markup for projects or for client demos.

The default layout is empty and there are two empty files (`_existing.scss`) and (`existing.js`) for you to put existing assets from a site that you want to recreate. Be sure to include the following lines in your header/footer to include all assets:

```html
<link rel="stylesheet" href="{{ site.url }}/assets/stylesheets/style.css" />
<script src="{{ site.url }}/assets/javascript/existing.js"></script>
<script src="{{ site.url }}/assets/javascript/script.js"></script>
```

## Installation
Gulp and Node should be installed globally.

```bash
npm install
bundle install
```

Then run `gulp` to start the local server with BrowserSync.

## Deploying to `gh-pages`
In order to publish your work run `gulp publish && gulp deploy` while on the master
branch, after running [this](https://github.com/shinnn/gulp-gh-pages/issues/116#issuecomment-364959382)
work around.
