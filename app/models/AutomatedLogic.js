let MongoModel = require( require('path').resolve() /*+ '/app/models/MongoRecord.js'*/ + '/MongoRecord.js' );

class AutomaticLogicRecord extends MongoModel { }
AutomaticLogicRecord.collection_name = 'AutomatedLogic';


// DEFINING AVAILABLE DATA
Sun {
	"solar_energy_generated": {
		hour: kWh,
		hour: kWh,
		...
	},
	"solar_radiation": {
		data....
	},
}


// Automated Logic class to be imported in other places
class AutomatedLogic {
	constructor() {

	}
	getSunData(callback) {
		// example life cycle
		this._retrieveSunData(function(data) {
			let parsed_data = this._parseSunData(data);
			let sun = this._formatSunData(parsed_data);
			callback(sun);
		});
	}
	// retrieves raw data from AutomatedLogic
	_retrieveSunData(callback) {
		
	}
	// parse raw data that was retrieved
	_parseSunData(data) {

	}
	// formats parsed data
	_formatSunData(data) {
		let sun = {

		};
		// fill up with defined information
		return sun;
	}

	getWaterData(callback) {

	}
	getAirData(callback) {

	}
}

// example controller calls to AutomatedLogic.js
// automated_logic.getSunData(function(sun) {
// 	socket.emit('solar_energy', sun['solar_energy_generated'])
// });

let automated_logic = new AutomatedLogic();
// TESTS GO HERE
module.exports = automated_logic;