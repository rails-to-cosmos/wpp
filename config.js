module.exports = {
  actions: [
    {
      "type": "ADownload",
      "name": "article",
      "data": {
        // "url": "http://echo.msk.ru/programs/just_think/1778076-echo/"
        "url": "https://habrahabr.ru/post/302372/"
        // "url": "http://allhockey.ru/article/show/257019-Dozayavochka"
      },
      "settings": {
        "filters": {
          WhitelistUrlFilter: {
            urls: ['.*habrahabr\.ru\/post\/.*',
                  ]
          }
        }
        // "filters":  {
        //   WhitelistUrlFilter: {
        //     urls: ['.*echo\.msk\.ru.*',
        //           ]
        //   },
        //   BlacklistUrlFilter: {
        //     urls: ['http:\/\/.+?\.css',
        //            '.*banner.*',
        //            '.*vkontakte.*',
        //            '.*vk\.com.*',
        //            '.*facebook.*',
        //            '.*jquery-ui.*',
        //            '.*2\.cdn\.echo\.msk\.ru.*',
        //            '.*jquery.*',
        //            '.*ads\.echo\.msk.*',
        //            '.*videos.*',
        //            '.*mediatoday.*',
        //           ]
        //   },
        //   BlacklistContentTypeFilter: {
        //     content_types: ['text/css']
        //   }
        // }
      }
    },
    {
      "name": "title",
      "type": "AParseBySelector",
      "data": {
        "selector": ".post__title"
      },
      "target": "article",
      "settings": {
        "visible": true
      }
    },
    {
      "name": "attr",
      "type": "AParseBySelector",
      "data": {
        "selector": ".post__flow[href]"
      },
      "target": "article",
      "settings": {
        "visible": true
      }
    }
    // {
    //   "type": "AClick",
    //   "data": {
    //     "selector": "section.content .actionBlock a.comm"
    //   },
    //   "target": "article",
    //   "name": "article_with_comments"
    // },
    // {
    //   "name": "comment",
    //   "type": "AParseBySelector",
    //   "data": {
    //     "selector": ".commBlock[outerHTML]"
    //   },
    //   "target": "article_with_comments"
    // },
    // {
    //   "name": "id",
    //   "type": "AParseBySelector",
    //   "data": {
    //     "selector": "[id]"
    //   },
    //   "target": "comment"
    // }
  ]
};

// {
//   "type": "AClick",
//   "data": {
//     "selector": "section.content .actionBlock a.comm"
//   },
//   "target": ":article.result:",
//   "name": "article_with_comments"
// },
// {
//   "type": "APages",
//   "data": {
//     "current_page": 0,
//     "selector": ".pager a.ajax[href=\"#comments-:page:\"]"
//   },
//   "target": ":article_with_comments.result:",
//   "name": "pages"
// },
// {
//   "type": "AParseBySelector",
//   "data": {
//     "selector": ".commBlock[outerHTML]"
//   },
//   "name": "comment",
//   "target": ":pages.result:"
// },
// {
//   "type": "AParseBySelector",
//   "data": {
//     "selector": "[id]"
//   },
//   "settings": {
//     "visible": true
//   },
//   "target": ":comment.result:",
//   "name": "id"
// },
// {
//   "type": "AParseBySelector",
//   "data": {
//     "selector": ">div.onecomm>p.author span.about>strong.name"
//   },
//   "settings": {
//     "visible": true
//   },
//   "target": ":comment.result:",
//   "name": "author"
// },
// {
//   "type": "AParseBySelector",
//   "data": {
//     "selector": ">div.onecomm>p.commtext"
//   },
//   "settings": {
//     "visible": true
//   },
//   "target": ":comment.result:",
//   "name": "body"
// },
// {
//   "type": "AParseBySelector",
//   "data": {
//     "selector": ">div.onecomm>p.author>span.datetime.right"
//   },
//   "settings": {
//     "visible": true
//   },
//   "target": ":comment.result:",
//   "name": "date"
// },
// {
//   "type": "AParseBySelector",
//   "data": {
//     "selector": ".com_titl sup.lite"
//   },
//   "name": "counter",
//   "target": ":pages.result:"
// },
// {
//   "type": "AAssertEquals",
//   "data": ":counter.result.get(0):",
//   "target": ":body.result.len():",
//   "name": "verify",
//   "settings": {
//     "visible": true
//   }
// }
//   ]
// };
