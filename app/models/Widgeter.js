let MongoModel = require( require('path').resolve() /*+ '/app/models/MongoRecord.js'*/ + '/MongoRecord.js' );

class WidgeterRecord extends MongoModel { }
AutomaticLogicRecord.collection_name = 'Widgeter';

// Automated Logic class to be imported in other places
class Widgeter {
	constructor() {

	}
	getWidgets(category, callback) {

	}
}

let widgeter = new Widgeter();
// TESTS GO HERE
module.exports = widgeter;