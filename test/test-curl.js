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

  after(function() {
    server.close();
  });
});
