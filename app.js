var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sassMiddleware = require('node-sass-middleware');
var flash = require('connect-flash');
// for colored console logs
require('paint-console');

// session store config
const session = require('express-session');
const mongoStore = require('connect-mongo')(session);
const sessionSecret = 'jobbunny';

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').load();
}

var mongoose;
if (process.env.NODE_ENV == 'development') {
  mongoose = require('./config/db');
} else {
  mongoose = require('./controllers/mongo');
}

var app = express();

// flash messages
app.use(flash());

//use sessions for tracking logins, valid for 1 day
app.use(session({
  key: 'userId',
  secret: sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    path    : '/',
    httpOnly: false,
    maxAge  : 24*60*60*1000
  },
  store: new mongoStore({
    url: mongoose.dbUrl
  })
}));

app.use(function(req, res, next){
  res.locals.session = req.session;
  res.locals.currentUrl = req.path;
  next();
});

var routes = require('./routes/index');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// middlewares
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


// write SCSS style definitions
app.use(sassMiddleware({
  src: path.join(__dirname, 'public/css'),
  dest: path.join(__dirname, 'public/css'),
  debug: true,
  outputStyle: 'compressed',
  prefix:  '/css'  // Where prefix is at <link rel="stylesheets" href="prefix/style.css"/>
}));

app.use(express.static(path.join(__dirname, 'public')));
app.use("/node_modules" , express.static(__dirname + '/node_modules'));

// check if user's cookie is still saved in browser but user is not set
app.use((req, res, next) => {
  // use session data in view templates
  // res.locals.session = req.session;
  if (req.cookies.userId && !req.session.userId) {
    res.clearCookie('userId');
  }
  next();
});

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  res.render('error', {
    title: "Jobbunny | Error",
    error: "Page not Found"
  });
});

// clear flash messages after loaded once
app.get('/*', function(req, res, next) {
  req.session.flash = [];
  next();
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
