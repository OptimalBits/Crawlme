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
    console.log(1);
    var app = connect()
      .use(crawlme())
      .use(connect.static(__dirname + '/fixtures'));

    server = http.createServer(app).listen(3000);
  });

  it('should generate HTML snapshots for the escaped URLs', function(done) {
    request(
      {uri: 'http://localhost:3000/test.html?_escaped_fragment_=key=value'},
      function(err, res, body) {
        body.should.match(/<body>value<\/body>/);
        done();
      }
    );
  });

  it('should let normal AJAX request pass through', function(done) {
    request({uri: 'http://localhost:3000/test.html#!=key=value'},
      function(err, res, body) {
        body.should.match(/<script>/);
        done();
      }
    );
  });

  it('should unescape escaped hash fragments', function(done) {
    request(
      {uri: 'http://localhost:3000/test.html?_escaped_fragment_=key=value%233'},
      function(err, res, body) {
        body.should.match(/<body>value#3<\/body>/);
        done();
      }
    );
  });

  it('should handle asynchronous client side JavaScript', function(done) {
    request(
      {uri: 'http://localhost:3000/test_async.html?_escaped_fragment_=key=value4'},
      function(err, res, body) {
        body.should.match(/<body>value4<\/body>/);
        done();
      }
    );
  });

  it('should handle dynamically loaded JavaScript', function(done) {
    request(
      {uri: 'http://localhost:3000/test_dynload.html?_escaped_fragment_=key=value5'},
      function(err, res, body) {
        body.should.match(/<body>value5<\/body>/);
        done();
      }
    );
  });

  after(function() {
    server.close();
  });
});
