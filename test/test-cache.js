'use strict';
var connect = require('connect'),
  request = require('request'),
  should = require('should'),
  http = require('http'),
  crawlme = require('../lib/crawlme'),
  mocha = require('mocha');

describe('Caching', function() {
  it('should cache snapshots', function(done) {
    var app = connect()
      .use(crawlme())
      .use(connect.static(__dirname + '/fixtures'));

    var server = http.createServer(app).listen(5180);
    var t0 = Date.now();
    request(
      {uri: 'http://localhost:5180/test.html?_escaped_fragment_=key=value'},
      function(err, res, body) {
        var t1 = Date.now();
        body.should.match(/<body>value<\/body>/);
        request(
          {uri: 'http://localhost:5180/test.html?_escaped_fragment_=key=value'},
          function(err, res, body) {
            var t2 = Date.now();
            body.should.match(/<body>value<\/body>/);
            (t2-t1).should.be.below((t1-t0)/2);
            server.on('close', done);
            server.close();
          }
        );
      }
    );
  });

  it('should respect cache size', function(done) {
    var app = connect()
      .use(crawlme({
        cacheSize: 10 //very small
      }))
      .use(connect.static(__dirname + '/fixtures'));

    var server = http.createServer(app).listen(5180);
    var t0 = Date.now();
    request(
      {uri: 'http://localhost:5180/test.html?_escaped_fragment_=key=value'},
      function(err, res, body) {
        var t1 = Date.now();
        body.should.match(/<body>value<\/body>/);
        request(
          {uri: 'http://localhost:5180/test.html?_escaped_fragment_=key=value'},
          function(err, res, body) {
            var t2 = Date.now();
            body.should.match(/<body>value<\/body>/);
            Math.abs((t2-t1)-(t1-t0)).should.be.below(50);
            server.on('close', done);
            server.close();
          }
        );
      }
    );
  });

  it('should refresh cache', function(done) {
    var app = connect()
      .use(crawlme({
        cacheRefresh: 0.5 // 500millis
      }))
      .use(connect.static(__dirname + '/fixtures'));

    var server = http.createServer(app).listen(5180);
    var t0 = Date.now();
    request(
      {uri: 'http://localhost:5180/test_random.html?_escaped_fragment_=k=v'},
      function(err, res, body0) {
        var t1 = Date.now();
        request(
          {uri: 'http://localhost:5180/test_random.html?_escaped_fragment_=k=v'},
          function(err, res, body1) {
            var t2 = Date.now();
            body1.should.equal(body0);
            (t2-t1).should.be.below(t1-t0);
            setTimeout(function(){
              var t3 = Date.now();
              request(
                {uri: 'http://localhost:5180/test_random.html?_escaped_fragment_=k=v'},
                function(err, res, body2) {
                  var t4 = Date.now();
                  body2.should.not.equal(body0);
                  (t4-t3).should.be.below(t1-t0);
                  server.on('close', done);
                  server.close();
                }
              );
            }, 900);
          }
        );
      }
    );
  });
});
