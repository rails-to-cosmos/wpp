module.exports = {
  actions: [
    {
      "type": "ADownload",
      "name": "article",
      "data": {
        "url": "http://www.degraeve.com/reference/simple-ajax-example.php"
      },
      "settings": {
        "visible": false
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
      "name": "ajax",
      "type": "AClick",
      "data": {
        "selector": "input[type=button]"
      },
      "target": "article",
      "settings": {
        "visible": true
      }
    },
  ]
};
