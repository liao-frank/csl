let MongoModel;
try { MongoModel = require( require('path').resolve() + '/app/models/MongoRecord.js' ); }
catch(err) { MongoModel = require( require('path').resolve() + '/MongoRecord.js' ); }
let request = require('request');

// define record for queries
class LivingBuildingRecord extends MongoModel { }
LivingBuildingRecord.collection_name = 'LivingBuilding';

function dateToString(unit, date) {
	let days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
	let str;
	switch(unit) {
		case 'hour':
			str = date.toLocaleString("en-US", {timeZone: "America/New_York"});
			return `${days[date.getDate()]}, ${str.match(/\d+:\d+/)[0]} ${str.match(/AM|PM/)[0]}`;
		case 'day':
			str = date.toLocaleString("en-US", {timeZone: "America/New_York"});
			return str.match(/(.+),/)[1];
		case 'month':
			return months[date.getMonth()];
	}
}

class LivingBuilding {
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
				url: 'http://128.2.109.227:86/Phipps/electricity/trends',
				request_formatter: function(config, options) {
					let	url = config.url,
						time_duration = options.time_duration || 'week';
					// adjust url
					switch(time_duration) {
						case 'month':
							url += '?duration=mo';
						case 'year':
							url += '?duration=y';
					}
					return config;
				},
				data_parser: function(body, config, options) {
					// parse
					let	raw_data = body.match(/\[\[.[0-9,\s\[\].-]+\]\]/g),
						arrays = raw_data.map(str => JSON.parse(str));
						
					// format
					let time_duration = options.time_duration || 'week',
						data = [];

					for (let i = 0; i < arrays[0].length; i++) {
						let total_energy = 0;
						for (let array of arrays) {
							total_energy += array[i][1];
						}
						let time_point,
							date = new Date(arrays[0][i][0]);
						if (time_duration == 'year') time_point = dateToString('month', date);
						else if (time_duration == 'month') time_point = dateToString('day', date);
						else if (time_duration == 'week') time_point = dateToString('hour', date);
						else time_point = dateToString('hour', date);
						// TODO time_point vs date
						data.push([date, total_energy]);
					}
					return data;
				}
			},
			'solar_energy_production': {
				url: 'http://128.2.109.227:86/Phipps/production/trends',
				request_formatter: function(config, options) {
					let	url = config.url,
						time_duration = options.time_duration || 'week';
					// adjust url
					switch(time_duration) {
						case 'month':
							url += '?duration=mo';
						case 'year':
							url += '?duration=y';
					}
					return config;
				},
				data_parser: function(body, config, options) {
					// parse
					let	raw_data = body.match(/\[\[.[0-9,\s\[\].-]+\]\]/)[0],
						array = JSON.parse(raw_data);
						
					// format
					let time_duration = options.time_duration || 'week',
						data = array.map((point) => {
						let	time_point = point[0],
							date = new Date(time_point);

						if (time_duration == 'year') time_point = dateToString('month', date);
						else if (time_duration == 'month') time_point = dateToString('day', date);
						else if (time_duration == 'week') time_point = dateToString('hour', date);
						else time_point = dateToString('hour', date);

						return [date, point[1]];
					});

					return data;
				}
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
		LivingBuildingRecord.find({ label: label }, callback);
	}
	// request data from the internets
	_requestData(label, options, callback) {
		let request_config;
		try {
			request_config = this.request_configs[label];
			request_config = request_config.request_formatter(request_config, options);
		} catch(err) { callback('error configuring data request', null); }

		request(request_config.url, (err, response, body) => {
			if (err) callback(err, null);
			else {
				try {
					let data = request_config.data_parser(body, request_config, options);
					// callback
					callback(data ? null : 'could not parse data from response', data);
				} catch(err) { callback('error parsing data', null); }
			}
		});
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
				LivingBuildingRecord.findAndUpdate({ label: label }, new_record,
					(err, result) => {
						if (err) callback(err, null);
						else if (result.n == 0) {
							LivingBuildingRecord.new(new_record, callback);
						}
						else this._retrieveRecord(label, callback);
					}
				);
			}
		});
	}
}

let living_building = new LivingBuilding();
// should request solar energy production
// living_building._requestData('solar_energy_production', {}, (err, data) => {
// 	console.log(err, data);
// });
// should request energy consumption
// living_building._requestData('energy_consumption', {}, (err, data) => {
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
// 		// living_building._updateRecord('solar_energy_production', {}, (err, record) => {
// 		// 	console.log(err, record);
// 		// });
// 		// living_building._updateRecord('energy_consumption', {}, (err, record) => {
// 		// 	console.log(err, record);
// 		// });
// 		// should get data
// 		// living_building.getData('energy_consumption', {}, (err, record) => {
// 		// 	console.log(err, record);
// 		// 	living_building.getData('energy_consumption', {}, (err, record) => {
// 		// 		console.log(err, record);
// 		// 	});
// 		// });
// 	}
// });
module.exports = living_building;