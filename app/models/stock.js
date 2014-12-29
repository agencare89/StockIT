var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

var StockSchema = new Schema ({ 
	symbol: String, 
	compName: String, 
	volume: String, 
	price: String, 
	netChange: String, 
	percentChange: String
}); 

module.exports = mongoose.model('Stock', StockSchema); 