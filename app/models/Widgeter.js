// let MongoModel = require( require('path').resolve() + '/MongoRecord.js' );
let MongoModel = require( require('path').resolve() + '/app/models/MongoRecord.js' );
class WidgeterRecord extends MongoModel { }
WidgeterRecord.collection_name = 'Widgeter';

// Automated Logic class to be imported in other places
class Widgeter {
	constructor() {

	}
	getWidgets(category, callback) {
		WidgeterRecord.find({ category: category }, callback);
	}
	updateWidgets(category, widgets, callback) {
		WidgeterRecord.findAndUpdate({ category: category }, {
			widgets: widgets
		}, (err, result) => {
			if (err) callback(err, null);
			else {
				this.getWidgets(category, callback);
			}
		});
	}
}

let widgeter = new Widgeter();

// const MLAB_URL = 'mongodb://csl-cmu-webmaster:phippsPowerwise1@ds147668.mlab.com:47668/csl-interface';
// const MONGO_CLIENT = require('mongodb').MongoClient;
// global.mongoDB;
// MONGO_CLIENT.connect(MLAB_URL, function(err, client) {
// 	if (err) console.log(err);
// 	else {
// 		global.mongoDB = client;
// 		// DATABASE TEST SUITE
// 		// should be able to get widgets
// 		function log(err, data) {
// 			console.log(err, data);
// 		}
// 		widgeter.getWidgets('weather', log);
// 		widgeter.getWidgets('sun', log);
// 		widgeter.getWidgets('water', log);
// 		widgeter.getWidgets('air', log);
// 	}
// });
module.exports = widgeter;