var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var PortfolioEntry = new Schema ({ 
	userID: String,
	symbol: String, 
	compName: String, 
	volume: String, 
	price: String, 
	netChange: String, 
	percentChange: String
}); 

module.exports = mongoose.model('Portfolio', PortfolioEntry);