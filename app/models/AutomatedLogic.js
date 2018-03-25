let MongoModel = require( require('path').resolve() /*+ '/app/models/MongoRecord.js'*/ + '/MongoRecord.js' );

class AutomaticLogicRecord extends MongoModel { }
AutomaticLogicRecord.collection_name = 'AutomatedLogic';

class AutomatedLogic {

}

let automated_logic = new AutomatedLogic();

module.exports = automated_logic;