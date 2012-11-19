// Node backend
var http = require('http');
var sockjs = require('sockjs');
var node_static = require('node-static');
var grunt = require('grunt');

var exec = require('child_process').exec;

exec('grunt && grunt watch',
  { cwd: process.cwd() },
  function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
});

// 1. Echo sockjs server
var sockjs_opts = {
  sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.2.min.js"
};

var sockjs_echo = sockjs.createServer(sockjs_opts);
sockjs_echo.on('connection', function sockOnConnection(conn) {
  console.log(conn);
  conn.on('data', function sockOnData(message) {
    conn.write(message);
  });
});

// 2. Static files server
var static_directory = new node_static.Server(__dirname);

// 3. Usual http stuff
var server = http.createServer();
server.addListener('request', function(req, res) {
  static_directory.serve(req, res);
});
server.addListener('upgrade', function(req,res){
  res.end();
});

sockjs_echo.installHandlers(server, {
  prefix:'/echo'
});

console.log(' [*] Listening on 0.0.0.0:3000' );
server.listen(3000, '0.0.0.0');