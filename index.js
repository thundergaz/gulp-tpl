'use strict';

var through = require('through2');
var gutil = require('gulp-util');
var fs = require('fs');

module.exports = function (options, settings) {
    settings = settings || {};
    settings.ext = typeof settings.ext === "undefined" ? ".html" : settings.ext;
    return through.obj(function (file, enc, cb) {
        options = {};
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
        console.log(file.path);
        options.filename = file.path;
        try {
            file.path = gutil.replaceExtension(file.path, settings.ext);         
            var optionsn = getoption(file.contents.toString());
            file.contents = new Buffer(
                formartStr(changeStr(optionsn,options))
            );
        } catch (err) {
            this.emit('error', new gutil.PluginError('gulp-tpl', err.toString()));
        }
        this.push(file);
        cb();
    });
    function changeStr(content,option){
         var content = content.replace(/<extend\sname="(\w+\/*\w+\.*\w+)"\s\/>/g,function($a,$b){
                $b = $b.replace(/\//,"\\");
               var tagname = option.filename.replace(/\w+.html$/,$b+'.html');
                tagname = fs.readFileSync(tagname).toString();
                return tagname;
        })
        return getplace(content,option);
    }

    function formartStr(str){
        var str=str.replace(/&gt;/g,'>').replace(/&lt;/g,'<').replace(/&#34;/g,'"');
        return str;
    }

    function getplace(content,option){
        var str = /<block\sname="(\w+)">/g;
        if(str.test(content)){
         var content = content.replace(/<block\sname="(\w+)">\r?\n?\t?([\w\W]*?)\r?\n?\t?<\/block>/g,function($1,$2,$3){
            if(str.test($3)){
                return $1;
            }
            if(option[$2] === undefined){
                return $3;
            }else{
                return option[$2];
            }
         })

         if(str.test(content)){
            var content = content.replace(/<block\sname="(\w+)">\r?\n?\t?([\w\W]*)\r?\n?\t?<\/block>/g,function($1,$2,$3){
                if(options[$2] === undefined){
                    return $3;
                } else {
                    return options[$2];
                }
            })
            var content = getplace(content,option);
            return content;
          } 
        } 
        return content;
    }

    function getoption(contents){
        var str = /<block\sname="(\w+)">/g;
            if(str.test(contents)){
                var contents = contents.replace(/<block\sname="(\w+)">\r?\n?([\w\W]*?)\r?\n?\t?<\/block>/g,function($1,$2,$3){
                var str = /<block\sname="(\w+)">/g;
                if(str.test($3)){
                        return $1;
                    }else {
                        options[$2]=$3;
                        return '';
                    }
                })
               if(str.test(contents)){
                var contents = contents.replace(/<block\sname="(\w+)">\r?\n?\t?([\w\W]*)\r?\n?\t?<\/block>/g,function($1,$2,$3){
                    options[$2]=$3.replace(/<block\sname="(\w+)">([\w\W]*?)<\/block>/g,'');
                    getoption($3);
                    return '';
                })
                return contents;
               } 
            }
            return contents;
    }
};