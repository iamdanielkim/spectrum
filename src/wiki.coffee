
wikiDocument = require('./builder/wikiDocument')
gherkinDocument = require('./builder/gherkinDocument')

module.exports = (app) ->
  app.get '/wiki/?', (req, res) ->
    res.writeHead(301, {location: '/wiki/Main'});
    res.end();

  app.get '/wiki/:docName', (req, res) ->
    docName = req.params.docName;
    docPresenter(docName, app.model, res, wikiDocument)

  app.get '/feature/:docName', (req, res) ->
    docName = req.params.docName;
    docPresenter(docName, app.model, res, gherkinDocument)


docPresenter = (docName, model, res, docBuilder) ->
	name = docName
	docName = "wiki:" + docName

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
  res.render 'wiki', {content, markdown, name, docName }
