var exec = require('child_process').exec;
exec('java -jar /usr/local/Cellar/closure-compiler/20120917/libexec/build/compiler.jar --js twitter-text.js --js_output_file twttr.js --debug --compilation_level ADVANCED_OPTIMIZATIONS --language_in ECMASCRIPT5_STRICT --debug', { maxBuffer: 500*1024 }, function execution(err, stdout, stderr) {
  if (err) throw new Error(err);
  
  if (stdout) {
    console.log(stdout);
  }
  
  // If OK, calculate gzipped file size.
  if (reportFile.length) {
    var min = fs.readFileSync(data.jsOutputFile, 'utf8');
    min_info(min, function(err) {
      if (err) {
        grunt.warn(err);
        done(false);
      }

      // Write compile report to a file.
      console.log('write file path:', reportFile);
      
      fs.writeFile(reportFile, stderr, function(err) {
        if (err) {
          grunt.warn(err);
          done(false);
        }

        grunt.log.writeln('A report is saved in ' + reportFile + '.');
        done();
      });

    });
  }

});