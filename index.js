'use strict';
/* MODULES */
const restify          = require('restify'),
      mongoose         = require('mongoose'), //MongoDB coms library
      morgan           = require('morgan'), //Debug library
      corsMiddleware   = require('restify-cors-middleware'), // CORS
      Router           = require('restify-router').Router, //Express like routing for restify
      rootRouter       = new  Router(); //Initialise new router instance
/* END */

/* ROUTES */
const msgRouter   = require('./routes/msg');
/* END */

/* MIDDLEWARE */
//const auth             = require("./middleware/authentication");
/* END */

/* DB setup stuff */
mongoose.connect('mongodb://localhost/messenger-bank');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:')); //On error
db.once('open', function() { console.log("MongoDB connected"); }); //Callback
/* END */

/* SERVER setup */
const server = restify.createServer({ name: 'Messenger Bank', version: '1.0.0' });
server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser()); //Query parser for payload
server.use(restify.plugins.bodyParser()); //Body parser to get payload
server.use(morgan('dev')); //Initialise morgan logger on 'dev' preset
const cors = corsMiddleware({ //CORS setup
  preflightMaxAge: 5, //Optional
  origins: ['*'],
  allowHeaders: ['Authorization', 'Access-Control-Allow-Origin'],
  exposeHeaders: ['API-Token-Expiry']
})
server.pre(cors.preflight);
server.use(cors.actual);
/* END */

/* PROCESS VARIABLES */
process.env.SECRET_KEY = "KEYBOARD NINJA CAT"; //Secret key for jwt token generation
/* END */

/* TEST ROUTE */
rootRouter.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'EAAVB0t4bEicBALYrU0Epv3pmXZAn9bf47zjDz9aZCrybB2GCiFKZCkZA3vOOHqtjZBdjZAQO328NddYG0SaqxjNBmkHYmZCu6FvzmotSKrZBnKvrmMjZBwQYajgrF7ieeLL8hPbO1sQ1qw1ZCKlgUqaoBh6oweu3841zCBLubOZA8B4DwZDZD') {
		return res.send(req.query['hub.challenge'])
	}
	return res.send('Error, wrong token')
})
rootRouter.get('/', function (req, res, next) { res.json(200, {message:"Roger Roger"}); }); //Basic test call (Authentication required)
/* END */

/* ROUTING */
// commentRouter.use(auth.authenticate);  //Apply authentication middleware for commentRoutes
// locationRouter.use(auth.authenticate); //Apply authentication middleware for locationRoutes
// rootRouter.use(auth.authenticate);     //Apply authentication middleware for rootRoutes

msgRouter.applyRoutes(server, '/msg')
// userRouter.applyRoutes(server, '/users'); //Set route pre-fix
// locationRouter.applyRoutes(server, '/locations'); //Set route pre-fix and apply routes
rootRouter.applyRoutes(server); //Apply routes
/* END */

server.listen(8080, function () { console.log('%s listening at %s', server.name, server.url); });

module.exports.server = server;
