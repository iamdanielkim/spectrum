express = require('express')
http = require('http');
path = require('path');
sharejs = require('share')


# create a express app
app = express()

app.set('port', process.env.PORT || 3000)
app.set('views', path.join(__dirname, '../views'))

app.set 'view engine', 'html'    # use .html extension for templates
#app.set 'layout', 'layout'       # use layout.html as the default layout
#app.set 'partials', foo: 'foo'   # define partials available to all pages

app.use(express.favicon())
app.use(express.logger('dev'))
app.use(express.bodyParser())
app.use(express.methodOverride())
app.use(express.cookieParser('your secret here'))
app.use(express.session())
app.use(app.router)
app.use(require('stylus').middleware(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, '../public')))
app.use(express.static(path.join(__dirname, '../bower_components')))
#app.enable 'view cache'
app.engine 'html', require('hogan-express')

# create sharejs server
require('redis')
options =
  browserChannel: {cors: "*"}
  db: {type: "redis"}

sharejs.server.attach(app, options);

# routes
require('./wiki')(app)

fs = require('fs')

app.post '/upload', (req, res) ->
  console.log(req.files)
  uploaded = req.files.files[0]

  fs.readFile uploaded.path, (err, data)->
    newPath = __dirname + "/../attachments/" + uploaded.name
    fs.writeFile newPath, data, (err)->
      if(err)
        console.log(err)
      else
        console.log(data)
        res.json(data)
        res.end()

walk = require('walk')
app.get '/attachments', (req, res) ->
  files = [];
  walker  = walk.walk(__dirname + "/../attachments", { followLinks: false })
  walker.on 'file', (root, stat, next) ->
    files.push('/attachments/' + stat.name)
    next()

  walker.on 'end', () ->
    console.log(files)
    res.send(files)

app.get '/features/:docName/attachments', (req, res) ->
    res.send("haha2")

app.post '/features/:docName/attachments', (req, res) ->
    res.send("haha2")

app.get '/features/:docName/attachments/:fileName', (req, res) ->
    res.send("haha2")



# set our app port and start the app
port = 5000
app.listen(port, () -> console.log("Listening on " + port))


