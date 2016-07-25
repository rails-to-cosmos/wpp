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
  ]
};
