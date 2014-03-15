
class DocumentSupport
  constructor: (@type, @name) ->
    @key = @type + ":" +@name


  stub: -> "Not Implemented"

  saveIfNotAndRender: (model, res) ->
    self = this
    model.getSnapshot @key, (error, data) ->
      if error is 'Document does not exist'
        model.create self.key, 'text', ->
          content = self.stub()
          model.applyOp self.key, {op:[{i:content, p:0}], v:0}, ->
            res.render 'spectrum', { content, name: self.name, docName: self.key}
      else
        content = data.snapshot
        res.render 'spectrum', { content, name: self.name, docName: self.key}

  deleteAndRedirect: (model, redirectUrl, res) ->
    self = this
    console.log("key======", @key)
    model.delete self.key, "a"

    res.redirect redirectUrl

  raw: (model, res) ->
    model.getSnapshot @key, (error, data) ->
      if error is 'Document does not exist'
        res.send(404)
      else
        res.send data.snapshot

module.exports = DocumentSupport
