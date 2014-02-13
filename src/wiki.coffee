redis = require('redis')
client = redis.createClient()

wikiDocument = require('./builder/wikiDocument')
gherkinDocument = require('./builder/gherkinDocument')

module.exports = (app) ->
  app.get '/wiki/?', (req, res) ->
    res.writeHead(301, {location: '/wiki/Main'});
    res.end();

  app.get '/wiki/:docName', (req, res) ->
    name = req.params.docName;
    docPresenter(name, "wiki:" + name, app.model, res, wikiDocument)

  app.get '/feature/:docName', (req, res) ->
    name = req.params.docName;
    docPresenter(name, "feature:" + name, app.model, res, gherkinDocument)


docPresenter = (name, docName, model, res, docBuilder) ->
	model.getSnapshot docName, (error, data) ->
		if error is 'Document does not exist'
			model.create docName, 'text', ->
				content = docBuilder(name)
				model.applyOp docName, {op:[{i:content, p:0}], v:0}, ->
					render content, name, docName, res
		else
			render data.snapshot, name, docName, res

showdown = new (require('showdown').converter)()
render = (content, name, docName, res) ->
  markdown = showdown.makeHtml content
  client.keys 'ShareJS:doc:*', (err, pages) ->
    if (err)
      []
    res.render 'spectrum', {pages, content, markdown, name, docName }




