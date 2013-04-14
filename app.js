
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , socketio = require('socket.io')
  , path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'hjs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var server = http.createServer(app),
  io = socketio(server);

io.sockets.use(function(socket, next) {
  console.log('/ 1');
  setTimeout(next, 1000);
});
io.sockets.use(function(socket, next) {
  console.log('/ 2');
  setTimeout(next, 1000);
});

io.on('connection', function(socket) {
  console.log('!connection', socket.request.query);

  socket.on('greeting', function(data, callback) {
    console.log('!greeting:', data);
    callback({hello: 'client'});
  });
});

var fooIo = io.of('/foo');
fooIo.use(function(socket, next) {
  console.log('/foo 1');
  setTimeout(next, 100);
});
fooIo.use(function(socket, next) {
  console.log('/foo 2');
  setTimeout(next, 100);
});
fooIo.on('connection', function(socket) {
  console.log('!/foo connection', socket.request.query);

  socket.on('echo', function(data, callback) {
    console.log('!echo:', data);
    callback(data);
  });
});
/* 
Expected results:
  '/ 1'
  '/ 2'
  '/foo 1'
  '/foo 2'

but gets:
  '/ 1'
  '/foo 1'
  '/ 2'
  '/foo 2'
*/

server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
