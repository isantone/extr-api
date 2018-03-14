'use strict';

const mode = process.env.MODE;

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');

function staticF(dirname, age) {
  console.log('http://localhost:3003/public');
  return express.static('http://localhost:3003/public', { maxAge: age });
}

console.log(mode);

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

//app.use(express.static('public'));
app.use(express.static('public', {  maxAge: '1h'}));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + '/index.html'));
});

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:7777');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header('Access-Control-Allow-Credentials', true);

  next();
});

app.use('/api', require('./routes/api'));

// unknown endpoint
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});


const server = app.listen(3003, () => {
  console.log('The server is listening on http://localhost:3003');
});

function stop() {
  server.close();
}

module.exports = server;
module.exports.stop = stop;