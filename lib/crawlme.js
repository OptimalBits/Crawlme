'use strict';

var Browser = require('zombie');
var urlParser = require('url');
var browser = new Browser();

exports = module.exports = function(options) {
  // regex for stripping html of script tags. Borrowed from jQuery
  var stripScriptTags = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
  
  // Default options
  options = options || {};
  options.waitFor = options.waitFor || 1000;
  options.protocol = options.protocol || 'http';

  // Remove all script tag from html snapshot
  function stripScripts(snapshot) {
    return snapshot.replace(stripScriptTags, '');
  }

  // Get the URL to the AJAX version of this page
  function getAjaxUrl(req) {
    var urlParts = req.url.split('?_escaped_fragment_=');
    
    // If no fragment in URL this is not a request for an HTML snapshot
    // of an AJAX page.
    if (urlParts.length !== 2) return undefined;

    // Express adds a protocol property to the req object.
    var protocol = req.protocol || options.protocol;

    var url =  options.protocol + '://' + req.headers.host;
    var path = urlParts[0];
    var fragment = urlParts[1];

    if (fragment.length === 0) {
      // We are dealing with crawlable an ajax page without a hash fragment
      url += path; // No hashbang or fragment
    } else {
      url += path + '#!' + decodeURIComponent(fragment);
    }

    return url;
  }

  function getHTMLSnapshot(url, cb) {
    // First close the browser to make sure that nothing is cached
    browser.close();
    browser.visit(url, {waitFor: options.waitFor},
      function(err, browser, status) {
        if(err) return cb(err);

        // links
        var links = browser.queryAll('a');
        links.forEach(function(link) {
          var href = link.getAttribute('href');
          var absoluteUrl = urlParser.resolve(url, href);
          link.setAttribute('href', absoluteUrl);
        });

        var snapshot = stripScripts(browser.html());
        cb(null, snapshot);
      });
  }

  // The middleware function
  return function(req, res, next) {
    // Only allow GET requests
    if ('GET' !== req.method) return next();

    // Try to extract the ajax URL from the request
    var url = getAjaxUrl(req);

    // If we aren't being crawled continue to next middleware
    if (!url) return next();

    // Generate the snapshot
    getHTMLSnapshot(url, function(err, snapshot) {
      if (err) {
        console.log('Zombie reported an error: ' + err);
        return next(err);
      }

      return res.end(snapshot);
    });
  };
};
