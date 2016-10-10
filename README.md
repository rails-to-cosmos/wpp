Webpage Processor
=============

Webpage Processor is a lightweight web tool for extremely simplified page automation built on top of the [PhantomJS](http://phantomjs.org).

Features
--------

- Manage PhantomJS behaviour by drawing trees of actions stored in JSON format
- Crawl web resources and get text data from them
- Simple navigation via jQuery selectors
- Run with fault-tolerant PhantomJS cluster

Requirements
------------
Webpage Processor requires PhantomJS version 2.1+

API
---
Webpage Processor API enables to call page automation tasks.

Start wpp by:

    $ node wpp

Then call task by:

    $ curl -H "Content-Type: application/json" --data @config.json http://localhost:8283/ -o output.json

Installation
------------
    $ git clone https://github.com/rails-to-cosmos/wpp
    $ cd wpp
    $ npm install
