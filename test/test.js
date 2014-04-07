'use strict';
var connect = require('connect'),
  request = require('request'),
  should = require('should'),
  http = require('http'),
  crawlme = require('../lib/crawlme'),
  mocha = require('mocha');

describe('Crawlme', function() {
  var server;
  before(function() {
    var app = connect()
      .use(crawlme())
      .use(connect.static(__dirname + '/fixtures'));

    server = http.createServer(app).listen(8944);
  });

  after(function(done) {
    server.on('close', done);
    server.close();
  });

  it('should generate HTML snapshots for the escaped URLs', function(done) {
    request(
      {uri: 'http://localhost:8944/test.html?_escaped_fragment_=key=value'},
      function(err, res, body) {
        body.should.match(/value/);
        done();
      }
    );
  });

  it('should let normal AJAX request pass through', function(done) {
    request({uri: 'http://localhost:8944/test.html#!=key=value'},
      function(err, res, body) {
        body.should.match(/<script>/);
        done();
      }
    );
  });

  it('should unescape escaped hash fragments', function(done) {
    request(
      {uri: 'http://localhost:8944/test.html?_escaped_fragment_=key=value%233'},
      function(err, res, body) {
        body.should.match(/value#3/);
        done();
      }
    );
  });

  it('should handle asynchronous client side JavaScript', function(done) {
    request(
      {uri: 'http://localhost:8944/test_async.html?_escaped_fragment_=key=value4'},
      function(err, res, body) {
        body.should.match(/value4/);
        done();
      }
    );
  });

  it('should handle dynamically loaded JavaScript', function(done) {
    request(
      {uri: 'http://localhost:8944/test_dynload.html?_escaped_fragment_=key=value5'},
      function(err, res, body) {
        body.should.match(/value5/);
        done();
      }
    );
  });

  it('should handle dynamically created links', function(done) {
    request(
      {uri: 'http://localhost:8944/test_links.html?_escaped_fragment_='},
      function(err, res, body) {
        body.should.match(/<a href="http:\/\/localhost:8944\/test_links.html#!hash">/);
        done();
      }
    );
  });
});


describe.skip('Crawlme timing', function() {
  it('should not wait to long', function(done) {
    var server;
    var app = connect()
      .use(crawlme({waitFor: 200}))
      .use(connect.static(__dirname + '/fixtures'));
    server = http.createServer(app).listen(8944);

    request(
      {uri: 'http://localhost:8944/test_timeout.html?_escaped_fragment_=key=time'},
      function(err, res, body) {
        body.should.match(/timebefore/);
        server.on('close', function() {
          done();
        });
        server.close();
      }
    );
  });

  it('should not wait to short', function(done) {
    var server;
    var app = connect()
      .use(crawlme({waitFor: 600}))
      .use(connect.static(__dirname + '/fixtures'));
    server = http.createServer(app).listen(8944);

    request(
      {uri: 'http://localhost:8944/test_timeout.html?_escaped_fragment_=key=time'},
      function(err, res, body) {
        body.should.match(/timeafter/);
        server.on('close', function() {
          done();
        });
        server.close();
      }
    );
  });
});
