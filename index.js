@@ -0,0 +1,60 @@
'use strict';

var through = require('through2');
var gutil = require('gulp-util');
var ejs = require('ejs');

module.exports = function (options, settings) {
    settings = settings || {};
    options = options || {};
    settings.ext = typeof settings.ext === "undefined" ? ".html" : settings.ext;

    function formartStr(str){
        var str=str.replace(/&gt;/g,'>');
        var str=str.replace(/&lt;/g,'<');
        var str=str.replace(/&#34;/g,'"');
        return str;
    }
    function getoption(contents){
        var option = contents.replace(/(?:<!--|\/\/-)\s*tpl:(\w+)\s*(\w+)\s*(?:-->)/g, function($1,$2,$3){
                if(options[$2] == undefined) {
                    options[$2] = $3;
                }
                return '';
        });
        var option = option.replace(/<block:(\w+)>([\s\S]*)<\/block:(\w+)>/g,function($1,$2,$3,$4){
            console.log('$2');
            console.log($2);

            if (options[$2] == undefined ) {
                options[$2] = $3;
            }
            return '';
        })
        return option;
    }
    return through.obj(function (file, enc, cb) {
        if (file.isNull()) {
            this.push(file);
            return cb();
        }
        if (file.isStream()) {
            this.emit(
                'error',
                new gutil.PluginError('gulp-tpl', 'Streaming not supported')
            );
        }
        options.filename = file.path;
        try {
            file.path = gutil.replaceExtension(file.path, settings.ext);           
            var optionsn = getoption(file.contents.toString());
            file.contents = new Buffer(
                formartStr(ejs.render(optionsn, file.data || options))
            );
        } catch (err) {
            this.emit('error', new gutil.PluginError('gulp-ejs', err.toString()));
        }
        this.push(file);
        cb();
    });
};
\ No newline at end of file
