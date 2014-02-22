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

class Document
  constructor: (@type, @name) ->
    @key = @type + ":" +@name


  stub: -> "Not Implemented"

  saveIfNotAndRender: (model, res) ->
    self = this
    model.getSnapshot @key, (error, data) ->
      if error is 'Document does not exist'
        model.create self.key, 'text', ->
          content = self.stub()
          console.log(content)
          model.applyOp self.key, {op:[{i:content, p:0}], v:0}, ->
            res.render 'spectrum', { content, name: self.name, docName: self.key}
      else
        content = data.snapshot
        res.render 'spectrum', { content, name: self.name, docName: self.key}

  raw: (model, res) ->
    model.getSnapshot @key, (error, data) ->
      if error is 'Document does not exist'
        res.send(404)
      else
        res.send data.snapshot

class GherkinDocument extends Document
  constructor: (@name) ->
    super "feature", @name

  stub: -> """
Feature: #{@name}

  Scenario:
    Given
    When
    Then

"""

class WikiDocument extends Document
  constructor: (@name) ->
    super "wiki", @name

  stub: -> """
# #{@name} page

This wiki page is currently empty.
You can put some content in it with the editor on the right. As you do so, the document will update live on the left, and live for everyone else editing at the same time as you. Isn't that cool?
The text on the left is being rendered with markdown, so you can do all the usual markdown stuff like:

- Bullet
  - Points

[links](http://google.com)

[Go back to the main page](Main)
"""




###
showdown = new (require('showdown').converter)()
render = (content, name, docName, res) ->
  markdown = showdown.makeHtml content
  client.keys 'ShareJS:doc:*', (err, pages) ->
    if (err)
      []
###



