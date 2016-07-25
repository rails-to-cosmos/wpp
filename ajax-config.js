module.exports = {
  actions: [
    {
      "type": "ADownload",
      "name": "article",
      "data": {
        "url": "http://www.degraeve.com/reference/simple-ajax-example.php"
      },
      "settings": {
        "visible": true
      }
    },
    {
      "name": "html",
      "type": "AParseBySelector",
      "data": {
        "selector": "blockquote"
      },
      "target": "article",
      "settings": {
        "visible": true
      }
    },
    {
      "name": "page",
      "type": "AClick",
      "data": {
        "selector": "input[type=button]"
      },
      "target": "article",
      "settings": {
        "visible": true
      }
    },
    {
      "name": "rrr",
      "type": "AParseBySelector",
      "data": {
        "selector": "form[name=f1] div#result[outerHTML]"
      },
      "target": "page",
      "settings": {
        "visible": true
      }
    },
    {
      "name": "rrr2",
      "type": "AParseBySelector",
      "data": {
        "selector": "form[name=f1] div#result[outerHTML]"
      },
      "target": "article",
      "settings": {
        "visible": true
      }
    }
  ]
};
