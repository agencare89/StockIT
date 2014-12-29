// server.js

// set up 
// get all the tools we need

var express  = require('express');
var app      = express();
var port     = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash    = require('connect-flash'); 
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var YQL 		 = require('yql'); 

var configDB = require('./config/database.js');

// configuration 
mongoose.connect(configDB.url); // connect to our database

require('./config/passport')(passport); // pass passport for configuration

// set up our express application
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms

app.set('view engine', 'ejs'); // set up ejs for templating
app.use(express.static(__dirname + '/views'));
// required for passport
app.use(session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes 
require('./app/routes.js')(app, passport); // load our routes and pass in our app and fully configured passport

//------------------------------------ Now that all the passport stuff is done, lets use the express router! ------------------------------------
var router = express.Router(); 
var Stock  = require('./app/models/stock'); 
var Portfolio = require('./app/models/portfolio'); 

router.use(function(req, res, next) { 
	// this is the middleware for the express router
	console.log("Stuff is happening"); 
	next();
});

router.route('/stocks')
	.post(function(req, res){ 
		// the following post method will put all the stocks with their updated information into the mongolab db
		var stock = new Stock(); 
		stock.symbol = req.body.symbol; 
		stock.compName = req.body.compName; 
		stock.volume = req.body.volume; 
		stock.price = req.body.price; 
		stock.netChange = req.body.netChange; 
		stock.percentChange = req.body.percentChange; 

		// using upsert so that it will update entries with new information if they already exist
		var upsertData = stock.toObject(); 
		delete upsertData._id; 

		// use update to put it in the mongolab db
		Stock.update( {symbol: stock.symbol}, upsertData, {upsert:true}, function(err) { 
				if (err) console.log(err);
		});

		// end the request, very important for posting many at once
		res.end(); 
	})

	.get(function(req, res) { 
		// the following get method with get all the stocks and their information that are in the mongolab db
		Stock.find(function (err, stocks) { 
			if (err) res.send(err);
			res.json(stocks);
		}); 
	})

	.delete(function(req, res) {
		// this delete function will delete all the stocks in the mongolab db
		Stock.remove(function (err, stock) { 
			if (err) console.log(err); 
		}); 
	}); 


router.route('/stocks/:_id')
	.get(function(req, res) {
		// the following get request returns an individual stock based on its id in the mongolab db
		Stock.findById( req.params._id, function(err, data) {
			if (err) res.send(err);
			res.json(data);
		});
	});

router.route('/stocks/:symbol')
	.delete(function (req, res) { 
		// this is used for when we delete a stock from 
		Stock.remove ( {symbol: req.params.symbol}, function(err, data) { 
			if (err) res.send(err);
		});	
	});

router.route('/portfolio')
	.post(function(req, res){ 
		// this is used to post a new portfolio entry into the portfolio db on mongolab
		var portfolioEntry = new Portfolio(); 
		portfolioEntry.userID = req.user.local.email;
		portfolioEntry.symbol = req.body.symbol; 
		portfolioEntry.compName = req.body.compName; 
		portfolioEntry.volume = req.body.volume; 
		portfolioEntry.price = req.body.price; 
		portfolioEntry.netChange = req.body.netChange; 
		portfolioEntry.percentChange = req.body.percentChange; 

		// again, we use upsert to update the ones in case they already exist
		var upsertData = portfolioEntry.toObject(); 
		delete upsertData._id; 
		
		Portfolio.update( {symbol: portfolioEntry.symbol}, upsertData, {upsert:true}, function(err) { 
			if (err) console.log(err);
		});
		
		res.end(); 
	})

	.get(function(req, res) { 
		Portfolio.find(function (err, portfolio) { 
			// this method gets all the stocks stored as part of the portfolios set, but only returns the stocks that pertain to
			// the current user
			var check = true;
			if (err) res.send(err);

			if (req.user) {
				// if we are required to edit the list, we must recheck the entire list 
				// it is not until we get to the end of the list with a valid list of our users stocks that we can send the stocks
				while (check) { 
					check = false;
					for (var i = 0; i < portfolio.length; i++) { 
						if (portfolio[i].userID != req.user.local.email) {
							portfolio.splice(i, 1);			// use splice to take the unwanted entry away
							check = true;					// reset to true so we check the list again
						}
					}
				}
			
				res.json(portfolio);			// send the correct list of the user's portfolio
			}
			else res.json(portfolio); 
		});
	})

	.delete(function (req, res) { 
		// this is used for deleting a user's entire portfolio;
		Portfolio.remove( {userID: req.user.local.email }, function (err, data) { 
			if (!err) console.log("successfully deleted " + req.user.local.email + " 's portfolio!");
		});

	});

router.route('/portfolio/:_id')

	.delete(function(req, res) { 
		// this is used for deleting an element of the user's portfolio from their portfolio
		Portfolio.remove( { _id: req.params._id }, function (err, data) { 
			if (!err) console.log("successfully deleted " + req.params._id); 
		});

		res.end();		
	});

app.use('/', router);

// launch 
app.listen(port);
console.log('The magic happens on port ' + port);
