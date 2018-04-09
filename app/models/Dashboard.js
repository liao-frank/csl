// let MongoModel = require( require('path').resolve() + '/MongoRecord.js' );
let MongoModel = require( require('path').resolve() + '/app/models/MongoRecord.js' );
class DashboardRecord extends MongoModel { }
DashboardRecord.collection_name = 'Dashboard';

// Automated Logic class to be imported in other places
class Dashboard {
	constructor() {

	}
	getDashboard(category, callback) {
		DashboardRecord.find({ category: category }, callback);
	}
	updateDashboard(category, dashboard, callback) {
		DashboardRecord.findAndUpdate({ category: category },
			dashboard,
			(err, result) => {
				if (err) callback(err, null);
				else if (result.n == 0) {
					DashboardRecord.new(dashboard, callback);
				}
				else {
					this.getDashboard(category, callback);
				}
			}
		);
	}
}

let dashboard = new Dashboard();

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
// 		dashboard.getWidgets('weather', log);
// 		dashboard.getWidgets('sun', log);
// 		dashboard.getWidgets('water', log);
// 		dashboard.getWidgets('air', log);
// 	}
// });
module.exports = dashboard;