module.exports = {
  actions: [
    {
      "type": "ADownload",
      "name": "download",
      "data": {
        "url": "http://www.ofnet.ru/osnovy-interneta/tcpip.html"
      },
      "settings": {
        "visible": true,
        "filters":  {
          WhitelistUrlFilter: {
            urls: ['.*ofnet\.ru.*']
          }
        }
      }
    },
    {
      type: "AClick",
      name: "click",
      target: "download",
      data: {
        selector: "ul.menu li a"
      },
      settings: {
        visible: true
      }
    },
    {
      type: "AClick",
      name: "click2",
      target: "click",
      data: {
        selector: ".node-title a"
      },
      settings: {
        visible: true
      }
    },
    {
      "name": "parse",
      "type": "AParseBySelector",
      "data": {
        "selector": "h1.page-title"
      },
      "target": "click2",
      "settings": {
        "visible": true
      }
    },
  ]
};
