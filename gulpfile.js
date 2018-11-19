"use strict";

var gulp = require("gulp");
// Loads the plugins without having to list all of them, but you need
// to call them as $.pluginname
var $ = require("gulp-load-plugins")();
// "del" is used to clean out directories and such
var del = require("del");
// BrowserSync isn"t a gulp package, and needs to be loaded manually
var browserSync = require("browser-sync");
// merge is used to merge the output from two different streams into the same stream
var merge = require("merge-stream");
// Need a command for reloading webpages using BrowserSync
var reload = browserSync.reload;
// And define a variable that BrowserSync uses in it"s function
var bs;
var util = require("gulp-util");
var source = require("vinyl-source-stream");

// Deletes the directory that is used to serve the site during development
gulp.task("clean:dev", del.bind(null, ["serve"]));

// Deletes the directory that the optimized site is output to
gulp.task("clean:prod", del.bind(null, ["site"]));

// Runs the build command for Jekyll to compile the site locally
// This will build the site with the production settings
gulp.task("jekyll:dev", $.shell.task("bundle exec jekyll build"));
gulp.task("jekyll-rebuild", ["jekyll:dev", "js"], function () {
  reload;
});

// Almost identical to the above task, but instead we load in the build configuration
// that overwrites some of the settings in the regular configuration.
gulp.task("jekyll:prod", $.shell.task("bundle exec jekyll build --config _config.yml,_config.build.yml"));

// Compiles the SASS files and moves them into the "assets/stylesheets" directory
gulp.task("styles", function () {
  // Looks at the style.scss file for what to include and creates a style.css file
  return gulp.src("src/assets/scss/style.scss")
    .pipe($.sass())
    // AutoPrefix your CSS so it works between browsers
    .pipe($.autoprefixer("last 1 version", { cascade: true }))
    // Directory your CSS file goes to
    .pipe(gulp.dest("src/assets/stylesheets/"))
    .pipe(gulp.dest("serve/assets/stylesheets/"))
    .pipe(gulp.dest("site/assets/stylesheets/"))
    // Outputs the size of the CSS file
    .pipe($.size({title: "styles"}))
    // Injects the CSS changes to your browser since Jekyll doesn"t rebuild the CSS
    .pipe(reload({stream: true}));
});

gulp.task("js", function() {
  gulp.src("src/assets/javascript/*.js")
    .pipe(gulp.dest("src/assets/javascript"))
    .pipe(gulp.dest("site/assets/javascript"));
});

// Optimizes the images that exists
gulp.task("images", function () {
  return gulp.src("src/assets/images/**")
    .pipe($.changed("site/assets/images"))
    .pipe($.imagemin({
      // Lossless conversion to progressive JPGs
      progressive: true,
      // Interlace GIFs for progressive rendering
      interlaced: true
    }))
    .pipe(gulp.dest("site/assets/images"))
    .pipe($.size({
      title: "images"
    }));
});

// Copy over fonts to the "site" directory
gulp.task("fonts", function () {
  return gulp.src("src/assets/fonts/**")
    .pipe(gulp.dest("site/assets/fonts"))
    .pipe($.size({
      title: "fonts"
    }));
});

// Copy xml and txt files to the "site" directory
gulp.task("copy", function () {
  return gulp.src(["serve/*.txt", "serve/*.xml"])
    .pipe(gulp.dest("site"))
    .pipe($.size({
      title: "xml & txt"
    }))
});

// Copy html files to the "site" directory
gulp.task("html", function() {
  return gulp.src(["serve/**/*.html"])
    .pipe(gulp.dest("site"))
    .pipe($.size({
      title: "Copy HTML"
    }))
});

gulp.task("cname", function () {
  return gulp.src(["serve/CNAME"])
    .pipe(gulp.dest("site"))
    .pipe($.size({
      title: "CNAME"
    }))
});

// Task to upload your site to GH Page.
gulp.task("deploy", function () {
  return gulp.src("./site/**/*")
    .pipe($.ghPages({
      cacheDir: "./.tmp"
      }));
});

// BrowserSync will serve our site on a local server for us.
gulp.task("serve:dev", ["styles", "jekyll:dev", "js"], function () {
  bs = browserSync({
    notify: true,
    open: true,
    server: {
      baseDir: "serve"
    }
  });
});

// These tasks will look for files that change while serving and will auto-regenerate or
// reload the website accordingly. Update or add other files you need to be watched.
gulp.task("watch", function () {
  gulp.watch(["src/**/*.md", "src/**/*.html", "src/**/*.xml", "src/**/*.txt", "src/**/*.js"], ["jekyll-rebuild", reload]);
  gulp.watch(["serve/assets/stylesheets/*.css"], reload({stream: true}));
  gulp.watch(["src/assets/scss/**/*.scss"], ["styles", reload]);
});

// Serve the site after optimizations to see that everything looks fine
gulp.task("serve:prod", function () {
  bs = browserSync({
    notify: false,
    server: {
      baseDir: "site"
    }
  });
});

// Default task, run when just writing "gulp" in the terminal
gulp.task("default", ["serve:dev", "watch"]);

// Builds the site but doesn't serve it to you
gulp.task("build", ["jekyll:prod", "styles", "js"], function () {});

// Builds your site with the "build" command and then runs all the optimizations on
// it and outputs it to "./site"
gulp.task("publish", ["build"], function () {
  gulp.start("copy", "html", "cname", "images", "fonts", "js");
});
