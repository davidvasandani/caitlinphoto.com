var gulp        = require('gulp');
var browserSync = require('browser-sync');
var sass        = require('gulp-sass');
var prefix      = require('gulp-autoprefixer');
var cp          = require('child_process');
var git         = require('gulp-git');

var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build',
    gitCommit: '<span style="color: grey">Running:</span> $ git commit'
};

// Run git add
// src is the file(s) to add (or ./*)
gulp.task('add', function(){
  return gulp.src('./src/*')
    .pipe(git.add());
});

// Run git commit
// src are the files to commit (or ./*)
gulp.task('commit', function(){
  return gulp.src('./src/*')
    .pipe(git.commit('initial commit'));
});

// Run git push
// remote is the remote repo
// branch is the remote branch to push to
gulp.task('push', function(){
  git.push('origin', 'master', function (err) {
    if (err) throw err;
  });
});

// Run git pull
// remote is the remote repo
// branch is the remote branch to pull from
gulp.task('pull', function(){
  git.pull('origin', 'master', {args: '--rebase'}, function (err) {
    if (err) throw err;
  });
});
/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['sass', 'jekyll-build'], function() {
    browserSync.init(null, {
        server: {
            baseDir: '_site'
        },
        host: "localhost"
    });
});

/**
 * Compile files from _scss into both _site/css (for live injecting) and site (for future jekyll builds)
 */
gulp.task('sass', function () {
    gulp.src('_scss/main.scss')
        .pipe(sass({
            includePaths: ['scss'],
            onError: browserSync.notify
        }))
        .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
        .pipe(gulp.dest('_site/css'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('css'));
});

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch('_scss/*.scss', ['sass']);
    gulp.watch(['index.html', '_layouts/*.html', '_posts/*'], ['jekyll-rebuild']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['pull', 'browser-sync', 'watch']);
