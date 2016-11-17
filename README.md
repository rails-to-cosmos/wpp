Webpage Processor
=============

Webpage Processor is a lightweight web tool for extremely simplified page automation built on top of [PhantomJS](http://phantomjs.org).

Features
--------

* Manage PhantomJS behaviour by drawing trees of actions stored in JSON format
* Crawl web resources for any text data
* Simple navigation via jQuery selectors
* Run with fault-tolerant PhantomJS cluster
* Fast and simple AJAX-scraping

Requirements
------------
  * [Node v6](https://nodejs.org/en/download/package-manager/)
  * NPM
  * PhantomJS version 2.1+

PhantomJS Installation
----------------------

    $ cd /usr/local/sbin/
    $ wget https://bitbucket.org/ariya/phantomjs/downloads/phantomjs-2.1.1-linux-x86_64.tar.bz2
    $ tar xvfj phantomjs-2.1.1-linux-x86_64.tar.bz2
    $ rm -rf phantomjs-2.1.1-linux-x86_64.tar.bz2
    $ mv phantomjs-2.1.1-linux-x86_64 phantomjs
    $ sudo ln -s /usr/local/sbin/phantomjs/bin/phantomjs /usr/local/bin/phantomjs

Installation
------------
    $ git clone https://github.com/rails-to-cosmos/wpp
    $ cd wpp
    $ npm install

API
---
Webpage Processor API enables to call page automation tasks.

Start wpp:

    $ node wpp

Then call a task:

    $ curl -H "Content-Type: application/json" --data @config.json http://localhost:8283/ -o output.json

Config Structure
----------------

Webpage Processor config uses JSON syntax to specify tree of page actions.

```
{
    actions: [
        {
            type: "download",
            name: "_webpage",
            target: "https://news.ycombinator.com"
        },
        {
            type: "parse",
            name: "item",
            target: "_webpage",
            meta: {
                $: ".athing",
            },
            structure: {
                id: "[id]",
                rank: "span.rank",
                title: ".storylink",
                site: ".sitestr"
            }
        }
    ]
}
```
