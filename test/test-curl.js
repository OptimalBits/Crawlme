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

    server = http.createServer(app).listen(3000);
  });

  it('should work with AMD curl loaded javascript', function(done) {
    request(
      {uri: 'http://localhost:3000/test_curl.html?_escaped_fragment_=key=value'},
      function(err, res, body) {
        body.should.match(/<body>loa_dedvalue<\/body>/);
        done();
      }
    );
  });

  it('should work with curl-loaded non AMD JavaScript', function(done) {
    request(
      {uri: 'http://localhost:3000/test_curl_noamd.html?_escaped_fragment_=key=value'},
      function(err, res, body) {
        body.should.match(/<body>noAMDvalue<\/body>/);
        done();
      }
    );
  });

  it('should work with curl-loaded css', function(done) {
    request(
      {uri: 'http://localhost:3000/test_curl_css.html?_escaped_fragment_=cl=a'},
      function(err, res, body) {
        body.should.match(/<link rel="stylesheet" type="text\/css" href="\/css\/test\.css" \/>/);
        done();
      }
    );
  });

  it('should work with curl-loaded text', function(done) {
    request(
      {uri: 'http://localhost:3000/test_curl_text.html?_escaped_fragment_=suf=son'},
      function(err, res, body) {
        body.should.match(/Adamson,Bertilson,Cecarson/);
        done();
      }
    );
  });

  it('should work with curl-loaded text, js and css all at once', function(done) {
    request(
      {uri: 'http://localhost:3000/test_curl_multi.html?_escaped_fragment_=cl=a'},
      function(err, res, body) {
        body.should.match(/Adamnoa,Bertilnoa,Cecarnoa/);
        body.should.match(/<link rel="stylesheet" type="text\/css" href="\/css\/test\.css" \/>/);
        done();
      }
    );
  });

  it('should work with a series ofcurl-loaded text', function(done) {
    request(
      {uri: 'http://localhost:3000/test_curl_text_many.html?_escaped_fragment_=suf=son'},
      function(err, res, body) {
        body.should.match(/ason/);
        body.should.match(/bson/);
        body.should.match(/cson/);
        body.should.match(/dson/);
        done();
      }
    );
  });
  after(function() {
    server.close();
  });
});
