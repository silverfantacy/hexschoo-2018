
const gulp = require('gulp');
const $ = require('gulp-load-plugins')();
const browserSync = require('browser-sync');
const autoprefixer = require('autoprefixer');
const minimist = require('minimist'); // 用來讀取指令轉成變數
const gulpSequence = require('gulp-sequence').use(gulp);

// production || development
// # gulp --env production
const envOptions = {
  string: 'env',
  default: { env: 'development' }
};
const options = minimist(process.argv.slice(2), envOptions);
console.log(options);

gulp.task('clean', () => {
  return gulp.src(['./public', './.publish'], { read: false }) // 選項讀取：false阻止gulp讀取文件的內容，使此任務更快。
    .pipe($.clean());
});

gulp.task('pug', function () {
  gulp.src('./source/**/*.pug') // 传入管道的文件
    .pipe($.plumber())
    .pipe($.pug({
      pretty: true // 默认为false，表示是否美化HTML
    }))
    .pipe(gulp.dest('./public')); // dest:destination
});

gulp.task('vendorJs', function () {
  return gulp.src([
    './node_modules/jquery/dist/jquery.slim.min.js',
    './node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
    './source/javascripts/helpers/main.js'
  ])
  .pipe($.concat('vendor.js'))
  .pipe(gulp.dest('./public/javascripts'))
})

gulp.task('sass', function () {
  // PostCSS AutoPrefixer
  var processors = [
    autoprefixer({
      browsers: ['last 5 version'],
    })
  ];

  return gulp.src(['./source/stylesheets/**/*.sass', './source/stylesheets/**/*.scss'])
    .pipe($.plumber())
    .pipe($.sourcemaps.init())
    .pipe($.sass({ 
      outputStyle: 'nested',
      includePaths: ['./node_modules/bootstrap/scss']
    })
      .on('error', $.sass.logError))
    .pipe($.postcss(processors))
    .pipe($.if(options.env === 'production', $.minifyCss())) // 假設開發環境則壓縮 CSS
    .pipe($.sourcemaps.write('.'))
    .pipe(gulp.dest('./public/stylesheets'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('copy', function () {
  gulp.src(['./source/**/**', '!source/**/*.pug', '!source/stylesheets/**/**', '!source/javascripts/**/**'])
    .pipe(gulp.dest('./public/'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('browserSync', function () {
  browserSync.init({
    server: { baseDir: './public' },
    reloadDebounce: 2000
  })
});

gulp.task('watch', function () {
  gulp.watch(['./source/**/*.pug'], ['pug']);
  gulp.watch(['./source/stylesheets/**/*.sass', './source/stylesheets/**/*.scss'], ['sass']);
  gulp.watch(['./source/javascripts/**/*.js'], ['vendorJs']);
  gulp.watch(['./source/**/**', '!/source/stylesheets/**/**'], ['copy']);
});

gulp.task('deploy', function () {
  return gulp.src('./public/source/**/*')
    .pipe($.ghPages());
});

gulp.task('sequence', gulpSequence('clean', 'copy', 'pug', 'sass', 'vendorJs'));

gulp.task('default', ['copy', 'pug', 'sass', 'vendorJs', 'browserSync', 'watch']);
gulp.task('build', ['sequence'])
