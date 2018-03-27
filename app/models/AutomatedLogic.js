let MongoModel = require( require('path').resolve() /*+ '/app/models/MongoRecord.js'*/ + '/MongoRecord.js' );

class AutomaticLogicRecord extends MongoModel { }
AutomaticLogicRecord.collection_name = 'AutomatedLogic';

// Automated Logic class to be imported in other places
class AutomatedLogic {
	constructor() {

	}
	getWeatherData(callback) {

	}
	getSunData(callback) {
		
	}
	getWaterData(callback) {

	}
	getAirData(callback) {

	}
}

let automated_logic = new AutomatedLogic();
// TESTS GO HERE
module.exports = automated_logic;