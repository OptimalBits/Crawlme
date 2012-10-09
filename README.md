#Crawlme
A Connect/Express middleware that enables ajax crawling for your web application.

##How to use
1. Make you ajax app use the hashbang #! instead of just the # in urls. This tells Google that your app supports ajax crawling and indexing.
2. Insert the Crawlme middleware before the server in the chain of Connect/Express middlewares.
3. Sit back and relax. Crawlme takes care of the rest. :)

##Example
    var
      connect = require('connect'),
      http = require('http'),
      crawlme = require('crawlme');

    var app = connect()
      .use(crawlme())
      .use(connect.static(__dirname + '/webroot'));

    http.createServer(app).listen(3000);

##Install
    npm install crawlme

##How it works
Google detects that your page *your.server.com/page.html#!key=value* is ajax-crawlable by the hashbang #! in the url. The Googlebot doesn't evaluate JavaScript so it can't index the page directly. Instead it tries to get the URL *your.server.com/page.html?_escaped_fragment_=key=value* and expects to find an HTML snapshot of your page there. Crawlme will catch all requests to this kind of URLs and generate a HTML snapshot of the original ajax page on the fly.

##Test
    npm test

Follow [optimalbits](http://twitter.com/optimalbits) for news and updates regarding this library.

## Reference

    crawlme(options)

__Arguments__
 
    options  {Object} options object
    
##Options
Crawlme provides the following configuration options:
- `waitFor`   The time (in ms) crawlme waits before it assumes that your ajax page has finished loading and takes an HTML snapshot. Set this high enough to make sure that your page loads completely before the snapshot is taken. Defaults to 1000ms.
- `protocol`  The protocol crawlme should use to get the ajax pages. If crawlme runs under express this is determined automatically. Under connect this option is used. (defaults to http)

##License 

(The MIT License)

Copyright (c) 2012 Optimal Bits Sweden AB (http://optimalbits.com)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
