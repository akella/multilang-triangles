var gulp           = require('gulp');
var nunjucksRender = require('gulp-nunjucks-render');
var plumber        = require('gulp-plumber');
var gulpif         = require('gulp-if');
var changed        = require('gulp-changed');
var prettify       = require('gulp-prettify');
var frontMatter    = require('gulp-front-matter');
var config         = require('../config');
var path = require('path');
var fs=require("fs");
var _ = require("underscore");
var data = require('gulp-data');

var langs = [
    {
        'name': 'en',
        'folder': ''
    }
    // ,
    // {
    //     'name': 'ru',
    //     'folder': 'ru'
    // }
];


function renderHtml(onlyChanged) {
    nunjucksRender.nunjucks.configure({
        watch: false,
        trimBlocks: true,
        lstripBlocks: false
    });

    langs.forEach( function(lang) {
        return gulp
            .src([config.src.templates + '/**/[^_]*.html'])
            .pipe(plumber({
                errorHandler: config.errorHandler
            }))
            .pipe(gulpif(onlyChanged, changed(config.dest.html)))
            .pipe(frontMatter({ property: 'data' }))
            .pipe(data(function(file) {
                // console.log(file);
                var langdata = {};
                var global = JSON.parse(fs.readFileSync("src/content/"+lang.name+"/global.json"));
                filename = path.basename(file.path);
                jsonname = filename.slice(0,-5);
                
                var current = JSON.parse(fs.readFileSync("src/content/"+lang.name+"/"+jsonname+".json"));
                langdata = _.extend(global,current);
                console.log(langdata);
                return langdata;
            }))
            .pipe(nunjucksRender({
                PRODUCTION: config.production,
                path: [config.src.templates]
            }))
            .pipe(prettify({
                indent_size: 2,
                wrap_attributes: 'auto', // 'force'
                preserve_newlines: false,
                // unformatted: [],
                end_with_newline: true
            }))
            .pipe(gulp.dest(config.dest.html+"/"+lang.folder));
    });

    
}

gulp.task('nunjucks', function() {
    return renderHtml();
});

gulp.task('nunjucks:changed', function() {
    return renderHtml(true);
});

gulp.task('nunjucks:watch', function() {
    gulp.watch([
        config.src.templates + '/**/[^_]*.html'
    ], ['nunjucks:changed']);

    gulp.watch([
        config.src.templates + '/**/_*.html'
    ], ['nunjucks']);
});
