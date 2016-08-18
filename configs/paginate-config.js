module.exports = {
  actions: [
    {
      "type": "ADownload",
      "name": "download",
      "data": {
        "url": "https://habrahabr.ru/"
      },
      "settings": {
        "visible": false,
        "filters":  {
          WhitelistUrlFilter: {
            urls: ['.*habrahabr\.ru.*',
                  ]
          }
        }
      }
    },
    {
      type: 'APaginate',
      name: 'pages',
      target: 'download',
      data: {
        selector: '#nav-pages li a'
      },
      settings: {
        visible: false
      }
    },
    {
      type: 'AParse',
      name: 'parse',
      target: 'pages',
      data: {
        selector: '.post__title_link'
      },
      settings: {
        visible: true
      }
    }
  ]
};
