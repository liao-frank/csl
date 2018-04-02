let MongoModel;
try { MongoModel = require( require('path').resolve() + '/app/models/MongoRecord.js' ); }
catch(err) { MongoModel = require( require('path').resolve() + '/MongoRecord.js' ); }
let request = require('request');

// define record for queries
class PowerBuildingRecord extends MongoModel { }
PowerBuildingRecord.collection_name = 'PowerBuilding';

class PowerBuilding {
	constructor() {
		// this.power_building = {
		// 	label <String>: {
		//		label: String,
		// 		data: Array[Array[]],
		// 		updated_at: Date
		// 	},
		//	...
		// }
		this.power_building = {};
		this.request_configs = {
			'energy_consumption': {
				url: 'http://128.2.109.227:86/Phipps/heatmap',
				regex_pattern: /\[\[.[0-9,\s\[\].-]+\]\]/,
				match_index: 0,
				match_type: 'Object',
				storeable: true
			},
			'solar_energy_production': {
				url: 'http://128.2.109.227:86/Phipps/production/trends',
				regex_pattern: /\[\[.[0-9,\s\[\].-]+\]\]/,
				match_index: 0,
				match_type: 'Object',
				storeable: false
			}
		};
	}

	getData(label, options, callback) {
		if (callback == undefined) callback = options, options = {};
		let request_config = this.request_configs[label];
		if (!request_config) callback('invalid data label was queried', null);
		// if storeable
		else if (request_config.storeable) {
			let stored_record = this.power_building[label];
			// if in memory
			if (stored_record) {
				// if valid, callback
				if (this._checkRecord(stored_record)) callback(null, stored_record.data);
				// else if not valid, update and store, then callback
				else {
					this._updateRecord(label, options, (err, record) => {
						if (!err && record) this.power_building[label] = record;
						callback(err, (record && record.data));
					});
				}
			}
			// if not in memory
			else {
				// retrieve and store, then re-execute
				this._retrieveRecord(label, (err, record) => {
					this.power_building[label] = (record || {});
					this.getData(label, options, callback);
				});
			}
		}
		// else if not storeable
		else {
			// request and callback
			this._requestData(label, options, callback);
		}
	}
	// check validity of record object
	_checkRecord(record) {
		if (!record) return false;
		// check up-to-date
		function sameDay(t1, t2) {
			let	date = (t1.getDate() == t2.getDate()),
				month = (t1.getMonth() == t2.getMonth()),
				year = (t1.getYear() == t2.getYear());
			return date && month && year;
		}
		let	updated_at = new Date(record.updated_at),
			now = new Date();

		if (!updated_at || !sameDay(updated_at, now)) return false;
		return true;
	}
	// retrieve data from database
	_retrieveRecord(label, callback) {
		PowerBuildingRecord.find({ label: label }, callback);
	}
	// request data from the internets
	_requestData(label, options, callback) {
		let request_config = this._configureDataRequest(this.request_configs[label], options);
		let match;
		request(request_config.url, (err, response, body) => {
			if (err) callback(err, null);
			else {
				// regex match for raw string
				match = body.match(request_config.regex_pattern);
				let	raw_data = match ? match[request_config.match_index] : null;
				// convert raw_data to data
				let data = this._typifyData(raw_data, request_config.match_type);
				// callback
				callback(data ? null : 'could not parse data from response', data);
			}
		});
	}
	_configureDataRequest(request_config, options) {
		switch(request_config) {
			case 'solar_energy_production':
				break;
			default:
				break;
		}
		return request_config;
	}
	_typifyData(string, type) {
		let data;
		switch(type) {
			case 'Object':
				data = JSON.parse(string);
				break;
			case 'Number':
				data = parseInt(string.replace(/\D/g, ''));
				break;
			default:
				data = null;
		}
		return data;
	}
	// update with requested information, then callback with record
	_updateRecord(label, options, callback) {
		this._requestData(label, options, (err, data) => {
			if (err) callback(err, null);
			else {
				let new_record = {
					label: label,
					data: data,
					updated_at: new Date()
				};
				PowerBuildingRecord.findAndUpdate({ label: label }, new_record,
					(err, result) => {
						if (err) callback(err, null);
						else if (result.n == 0) {
							PowerBuildingRecord.new(new_record, callback);
						}
						else this._retrieveRecord(label, callback);
					}
				);
			}
		});
	}
}

let power_building = new PowerBuilding();
// should request solar energy production
// power_building._requestData('solar_energy_production', {}, (err, data) => {
// 	console.log(err, data);
// });
// // should request energy consumption
// power_building._requestData('energy_consumption', {}, (err, data) => {
// 	console.log(err, data);
// });

// const MLAB_URL = 'mongodb://csl-cmu-webmaster:phippsPowerwise1@ds147668.mlab.com:47668/csl-interface';
// const MONGO_CLIENT = require('mongodb').MongoClient;
// global.mongoDB;
// MONGO_CLIENT.connect(MLAB_URL, function(err, client) {
// 	if (err) console.log(err);
// 	else {
// 		global.mongoDB = client;
// 		// DATABASE TEST SUITE
// 		// should update records
// 		// power_building._updateRecord('solar_energy_production', {}, (err, record) => {
// 		// 	console.log(err, record);
// 		// });
// 		// power_building._updateRecord('energy_consumption', {}, (err, record) => {
// 		// 	console.log(err, record);
// 		// });
// 		// should get data
// 		// power_building.getData('energy_consumption', {}, (err, record) => {
// 		// 	console.log(err, record);
// 		// 	power_building.getData('energy_consumption', {}, (err, record) => {
// 		// 		console.log(err, record);
// 		// 	});
// 		// });
// 	}
// });
module.exports = power_building;