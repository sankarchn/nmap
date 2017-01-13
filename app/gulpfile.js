var gulp = require('gulp'),
    merge = require('merge-stream'),
    fs = require('fs'),
    path = require('path'),
    del = require('del'),
    plumber = require('gulp-plumber'),
    sourcemaps = require('gulp-sourcemaps'),
    debug = require('gulp-debug'),
    bytediff = require('gulp-bytediff'),
    flatten = require('gulp-flatten'),
    rev = require('gulp-rev'),
    revReplace = require('gulp-rev-replace'),
    revdelorig = require('gulp-rev-delete-original'),
    runsequence = require('run-sequence'),
    lazypipe   = require('lazypipe'),
    gulpif = require('gulp-if'),
    filter = require('gulp-filter'),
    lint = require('jshint'),
    jshint = require('gulp-jshint'),
    jsreport = require('gulp-jshint-html-reporter'),
    csslint = require('gulp-csslint'),
    htmlv = require('gulp-html-validator'),
    rename = require('gulp-rename'),
    uglifyjs = require('gulp-uglify'),
    htmlmin = require('gulp-htmlmin'),
    cleancss = require('gulp-clean-css'),
    useref = require('gulp-useref'),
    print = require('gulp-print');

var locations = {
    appfiles : ['./**/*', '!./node_modules/**', '!./gulpfile.js', '!./package.json'],
    jsfiles: ['./**/*.js', '!node_modules/**', '!gulpfile.js'],
    cssfiles: ['./**/*.css', '!node_modules/**'],
    htmlfiles: ['./index.html'],
    maps: ['**/*.map', '!node_modules/**'],
    unprocessed: ['./node_modules/bootstrap//fonts/**/*']
};

var config = {
    src: './src/',
    dest: './dist/',
    logs: './logs/',
    mapsDir: './maps',
    mapServerURL: 'http://192.168.1.40:8081/maps/'
};

function doInit () {
    return gulp.src(locations.unprocessed, {  base: './node_modules/bootstrap/' })
        .pipe(debug ( { title : "Copying.." }))
        .pipe(gulp.dest(config.dest));
}

function doClean () {
    return del.sync([
                        path.join(config.dest, '**/*.*'),
                        path.join(config.dest, '**'),
                        path.join(config.logs, '**/*.*'),
                        path.join(config.logs, '**')
                    ], { force: true });
}

function handleErrors (err) {
    console.log(err);
    this.emit('end');
}

function doMinify () {
    var excludeDest = '!' + config.dest + '/**',
        mapFilter = filter('**/*.map', { restore : true }),
        appFilter = filter(['**/*.*', '!**/*.map'], { restore : true });

    return gulp.src(locations.htmlfiles, { cwd: config.src, base: config.src })
        .pipe(plumber(handleErrors))
        .pipe(useref({}, lazypipe().pipe(sourcemaps.init, { loadMaps: true })))
        .pipe(bytediff.start())
        .pipe(gulpif('*.js', uglifyjs( { mangle: true })))
        .pipe(gulpif('*.css', cleancss()))
        .pipe(gulpif('*.html',htmlmin(
            {
                collapseWhitespace: true,
                removeComments: true,
                minifyJS: true,
                minifyCSS: true
            } )))
        .pipe(bytediff.stop())
        .pipe(sourcemaps.write('.', { sourceMappingURL: function(file) {
            return config.mapServerURL  + file.basename + '.map';
        }}))
        .pipe(mapFilter)
        //.pipe(debug({ title : 'Saving map file...'}))
        .pipe(flatten())
        .pipe(gulp.dest('./dist/maps'))
        .pipe(mapFilter.restore)
        .pipe(appFilter)
        // .pipe(debug({ title : 'Saving minified file...'}))
        .pipe(gulp.dest(config.dest));
}

function doRevs () {
    cacheBust ();
}

function cacheBust (){
    return gulp.src([].concat(locations.jsfiles, locations.cssfiles), { cwd : config.dest, base: config.dest })
        .pipe(debug ({ title : 'Adding content hash to js & css files..'}))
        .pipe(rev())
        .pipe(print())
        .pipe(revdelorig())
        .pipe(gulp.dest(config.dest))
        .pipe(rev.manifest('rev-manifest-nmap.json', { merge : true } ))
        .pipe(gulp.dest(config.dest), { cwd: config.dest })
        .on('end', updtFileRefs);
}

function updtFileRefs (){
    var manifest = gulp.src(path.join(config.dest, '/rev-manifest-nmap.json'));
    return gulp.src(locations.htmlfiles, { cwd : config.dest,  base: config.dest })
        .pipe(debug( { title: 'Updating html files for including file names with hash code ..' }))
        .pipe(revReplace( { manifest: manifest }))
        .pipe(gulp.dest(config.dest));
}

function doLint () {
    var streamhtml, streamcss, streamjs, output = "";

    streamhtml = gulp.src(locations.htmlfiles, { cwd : config.src, base : config.src })
        .pipe(plumber(handleErrors))
        .pipe(debug( { title: "Linting HTML File.."}))
        .pipe(htmlv({format: 'html'}))
        .pipe(rename(function (which) {
            which.extname = '.lint.html';
        }))
        .pipe(gulp.dest(config.logs));

    streamjs = gulp.src(locations.jsfiles, { base : config.src })
        .pipe(plumber(handleErrors))
        .pipe(debug( { title: "Linting JavaScript File.."}))
        .pipe(jshint())
        .pipe(jshint.reporter(jsreport, { filename: path.join(config.logs, 'js-lint-consolidated.html'), createMissingFolders : true }));

    streamcss = gulp.src(locations.cssfiles, { base : config.src })
        .pipe(plumber(handleErrors))
        .pipe(debug( { title: "Linting CSS File.."}))
        .pipe(csslint())
        .pipe(csslint.formatter('text', {logger: function(str) { output += str; }}))
        .on('end', function(err) {
            //if (err) return cb(err);

            fs.writeFile(path.join(config.logs, 'css-lint-consolidated.txt'), output);
        });

    return merge(streamcss, streamjs).add(streamhtml);
}

gulp.task('init', doInit);
gulp.task('clean', doClean);
gulp.task('lint', doLint);
gulp.task('minify', doMinify);
gulp.task('addRevs', doRevs);

gulp.task('build', function () {
    runsequence('clean','init','minify', 'addRevs');
});

gulp.task('all', function () {
    runsequence('clean', 'init', 'lint', 'minify', 'addRevs');
});

gulp.task('default', ['build']);
