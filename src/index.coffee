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
app.use(express.json())
app.use(express.urlencoded())
app.use(express.methodOverride())
app.use(express.cookieParser('your secret here'))
app.use(express.session())
app.use(app.router)
app.use(require('stylus').middleware(path.join(__dirname, 'public')))
app.use(express.static(path.join(__dirname, '../public')))
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



# set our app port and start the app
port = 5000
app.listen(port, () -> console.log("Listening on " + port))


