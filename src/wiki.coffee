GherkinDocument = require("./model/gherkinDocument")
WikiDocument = require("./model/markdownDocument")
redis = require("redis")
client = redis.createClient()


#wikiDocument = require('./builder/wikiDocument')
#gherkinDocument = require('./builder/gherkinDocument')

module.exports = (app) ->
  app.get '/pages', (req, res) ->
    client.keys 'ShareJS:doc:wiki:*', (err, data) ->
      if (err)
        []
      else
        pages = []
        for item in data
          title = item.replace(/ShareJS:doc:wiki:/g, '')
          url = "/pages/" + title
          pages.push {title, url}
        res.json(pages)

  app.get '/features', (req, res) ->
    client.keys 'ShareJS:doc:feature:*', (err, data) ->
      if (err)
        []
      else
        pages = []
        for item in data
          title = item.replace(/ShareJS:doc:feature:/g, '')
          url = "/features/" + title
          pages.push {title, url}
        res.json(pages)

  app.get '/pages/:docName', (req, res) ->
    document = new WikiDocument(req.params.docName)
    if req.query.format is "raw"
      document.raw(app.model, res)
    else
      document.saveIfNotAndRender(app.model, res)

  app.get '/features/:docName', (req, res) ->
    document = new GherkinDocument(req.params.docName)
    if req.query.format is "raw"
      document.raw(app.model, res)
    else
      document.saveIfNotAndRender(app.model, res)






###
showdown = new (require('showdown').converter)()
render = (content, name, docName, res) ->
  markdown = showdown.makeHtml content
  client.keys 'ShareJS:doc:*', (err, pages) ->
    if (err)
      []
###



