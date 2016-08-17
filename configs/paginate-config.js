module.exports = {
  actions: [
    {
      "type": "ADownload",
      "name": "download1",
      "data": {
        "url": "http://echo.msk.ru/programs/just_think/1778076-echo/"
      },
      "settings": {
        "visible": true,
        "filters":  {
          WhitelistUrlFilter: {
            urls: ['.*echo\.msk\.ru.*',
                  ]
          },
          BlacklistUrlFilter: {
            urls: ['http:\/\/.+?\.css',
                   '.*banner.*',
                   '.*vkontakte.*',
                   '.*vk\.com.*',
                   '.*facebook.*',
                   '.*jquery-ui.*',
                   '.*2\.cdn\.echo\.msk\.ru.*',
                   '.*jquery.*',
                   '.*ads\.echo\.msk.*',
                   '.*videos.*',
                   '.*mediatoday.*',
                  ]
          },
          BlacklistContentTypeFilter: {
            content_types: ['text/css']
          }
        }
      }
    },
    {
      type: "AClick",
      name: "click1",
      target: "download1",
      data: {
        selector: ".menulink"
      },
      settings: {
        visible: true
      }
    },
    {
      type: "AClick",
      name: "click2",
      target: "download1",
      data: {
        selector: ".menulink"
      },
      settings: {
        visible: true
      }
    },
    {
      "name": "parse",
      "type": "AParseBySelector",
      "data": {
        "selector": "a"
      },
      "target": "click1",
      "settings": {
        "visible": true
      }
    },
    {
      "name": "parse2",
      "type": "AParseBySelector",
      "data": {
        "selector": "a"
      },
      "target": "click2",
      "settings": {
        "visible": true
      }
    }
  ]
};
