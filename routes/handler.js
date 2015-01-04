var handler = function (app, express, path, io, gasSensor, rootDir) {
  //Data serving.
  app.set('views', path.join(rootDir, 'views'));
  app.set('view engine', 'ejs');

  app.use('/css', express.static(rootDir + '/public/css'));
  app.use('/js', express.static(rootDir + '/public/js'));
  app.use('/fonts', express.static(rootDir + '/public/fonts'));
  app.use('/logs', express.static(rootDir + '/logs'));

  app.get('/', function (req, res) {
    res.render('index', gasSensor.object());
  });

  app.get('/cache.manifest', function (req, res) {
    res.header('Content-Type', 'text/cache-manifest');
    res.sendFile(rootDir + '/public/cache/cache.manifest');
  });

  app.get('/offline.html', function (req, res) {
    res.sendFile(rootDir + '/public/cache/offline.html');
  });

  //Code on exit.
  process.once('SIGUSR2', function () {
    console.log("Goodbye nodemon.");
    io.emit('console message', 'INFO: Nodemon restart.');
    gasSensor.exit();
    process.kill(process.pid, 'SIGUSR2');
  });

  process.once('SIGINT', function () {
    console.log("Goodbye.");
    io.emit('console message', 'INFO: LPG detection system down.');
    gasSensor.exit();
    process.kill(0);
  });
}

module.exports = handler;