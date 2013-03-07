'use strict';
var express = require('express'),
  connect = require('connect'),
  request = require('request'),
  should = require('should'),
  http = require('http'),
  crawlme = require('../lib/crawlme'),
  mocha = require('mocha');

describe('Crawlme environments', function() {
  it('should run under Express', function(done) {
    var app = express()
      .use(crawlme())
      .use(express.static(__dirname + '/fixtures'));

    var server = http.createServer(app).listen(5180);

    request(
      {uri: 'http://localhost:5180/test.html?_escaped_fragment_=key=express'},
      function(err, res, body) {
        body.should.match(/<body>express<\/body>/);
        server.on('close', function() {
          done();
        });
        server.close();
      }
    );
  });

  it('should run under Connect', function(done) {
    var app = connect()
      .use(crawlme())
      .use(connect.static(__dirname + '/fixtures'));

    var server = http.createServer(app).listen(5180);

    request(
      {uri: 'http://localhost:5180/test.html?_escaped_fragment_=key=connect'},
      function(err, res, body) {
        body.should.match(/<body>connect<\/body>/);
        server.on('close', function() {
          done();
        });
        server.close();
      }
    );
  });
});
