Webpage Processor
=============

Webpage Processor is a lightweight web tool for extremely simplified page automation built on top of [PhantomJS](http://phantomjs.org).

Features
--------

* Manage PhantomJS behaviour by drawing trees of actions stored in JSON format
* Crawl web resources and get text data from them
* Simple navigation via jQuery selectors
* Run with fault-tolerant PhantomJS cluster

Requirements
------------

  * PhantomJS version 2.1+

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
    "defaults": {
        "report": "/tmp/report"
    },
    "actions": [
        {
            "target": "",
            "type": "Download",
            "data": {
                "url": "http://www.gazeta.ru/army/2016/08/06/9705023.shtml"
            },
            "name": "webpage",
            "settings": {
                "filters": {
                    "blacklist": {
                        "urls": [
                            ".*beacon\\.js.*",
                        ]
                    },
                    "whitelist": {
                        "urls": [
                            ".*c\\.rambler\\.ru.*",
                        ]
                    }
                }
            }
        },
        {
            "target": "webpage",
            "type": "Click",
            "data": {
                "selector": ".button_give_comments"
            },
            "name": "click"
        },
        {
            "target": "click",
            "type": "Parse",
            "data": {
                "selector": ".rc-comments__list[outerHTML]"
            },
            "name": "comments"
        },
        {
            "target": "comments",
            "type": "AParseBySelector",
            "data": {
                "selector": ".rc-comment[outerHTML]"
            },
            "name": "comment"
        },
        {
            "target": "comment",
            "type": "AParseBySelector",
            "data": {
                "selector": "[id]"
            },
            "name": "id",
            "settings": {
                "visible": true
            }
        }
    ]
}
```
