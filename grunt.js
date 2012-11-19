/*global module:false, require:false */
module.exports = function gruntJS(grunt) {
  'use strict';
  console.log('running grunt.js');
  grunt.loadNpmTasks('grunt-closure-compiler');
  
  //Handle manifest
  var jqExtend = require('./jqExtend.js');
  var manifest = grunt.file.readJSON('manifest.json');
  var newManifest = jqExtend(true, {}, manifest);
  newManifest.background.scripts = ['background.cc.js'];
  
  for (var img in newManifest.icons) {
    newManifest.icons[img] = newManifest.icons[img].replace('compiled/', '');
  }
  
  grunt.file.write('compiled/manifest.json', JSON.stringify(newManifest));
  
  
  // Project configuration.
  var banner = '/*! ' + manifest.name + ' v' + manifest.version +
               ' * Copyright (c) <%= grunt.template.today("yyyy") %> Devin Rhode */';
  grunt.initConfig({
    pkg: '<json:manifest.json>',
    meta: {
      banner: banner
    },
    'closure-compiler': {
      frontend: {
        js: manifest.background.scripts,
        jsOutputFile: 'compiled/background.cc.js',
        maxBuffer: 500,
        options: {
          'compilation_level': 'ADVANCED_OPTIMIZATIONS',
          'language_in': 'ECMASCRIPT5_STRICT'
        }
      }
    },
    watch: {
      files: '<config:lint.files>',
      tasks: 'lint'
    },
    lint: {
      files: ['grunt.js', 'background.js']
    },
    jshint: {
      options: {
      /*
        INIT:NODE/COMMONJS/GRUNTFILE
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true
        browser: true
        
        //SITE
        curly:true,
        noarg:true,
        noempty:true,
        eqeqeq:true,
        bitwise:true,
        strict:true,
        undef:true,
        unused:true,
        browser:true,
        devel:true,
        indent:4,
        maxerr:50
      */
      
        // Uncommented are default grunt options
        bitwise: true, //Added from site
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        noempty: true, //Added from site
        nonew: true, //Added
        quotmark: 'single', //Added
        regexp: true,
        undef: true,
        unused: true, //Added from site
        strict: true, //Added from site
        sub: true,
        /* boss: true, dont' allow assignments to be evaluated as truthy/falsey */
        eqnull: true, //Allow == null
        browser: true,
        indent: 2, //Added from site
        devel: true, //Added
        
        //Adding a few of nice restrictions:
        camelcase: true,
        trailing: true,
        maxparams: 6,
        maxdepth: 9,
        maxerr: 12
      },
      globals: {
        chrome: false,
        twttr: false
      }
    }
  });

  // Default task.
  grunt.registerTask('default', 'lint closure-compiler');

};
