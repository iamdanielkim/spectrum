
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

module.exports = DocumentSupport
