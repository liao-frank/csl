let MongoModel = require( require('path').resolve() /*+ '/app/models/MongoRecord.js'*/ + '/MongoRecord.js' );
let request = require('request');
// define record for queries
class WeatherRecord extends MongoModel { }
WeatherRecord.collection_name = 'Weather';

// weather library
class Weather {
	constructor() {
		// this.weather = {
		// 	sun_times: {
		// 		sunrise_time: Date,
		// 		sunset_time: Date
		// 	},
		// 	hourly_forecast: {
		// 		start_time: Date,
		// 		end_time: Date,
		// 		forecast: {
		// 			hour: {
		// 				description: String,
		// 				temp: Int
		// 			},
		// 			...
		// 		}
		// 	}
		// };
		this.weather = {};
	}

	getSunTimes(callback) {
		let sun_times = this.weather.sun_times;
		// if sun times exist, check up-to-date
		if (sun_times) {
			// if up-to-date, callback
			if (this._checkSuntimes(sun_times)) callback(null, sun_times);
			// if not up-to-date, update and callback
			else this._updateSunTimes(callback);
		}
		// if weather doesn't exist, retrieve and re-execute
		else {
			this._retrieveSunTimes((err, times) => {
				if (err) callback(err, null);
				else {
					this.weather.sun_times = times;
					// re-execute
					this.getSunTimes(callback);
				}
			});
		}
	}
	// checks validity of sun times
	_checkSuntimes(times) {
		function sameDay(t1, t2) {
			let	date = (t1.getDate() == t2.getDate()),
				month = (t1.getMonth() == t2.getMonth()),
				year = (t1.getYear() == t2.getYear());
			return date && month && year;
		}
		let	sunrise_time = times.sunrise_time,
			sunset_time = times.sunset_time,
			now = new Date();
		// check that times exist
		if (sunrise_time && sunset_time) {
			return sameDay(sunrise_time, now) && sameDay(now, sunset_time);
		}
	}
	// retrieves sun times from the database
	_retrieveSunTimes(callback) {
		WeatherRecord.find({}, (err, doc) => {
			if (err) callback(err, null);
			else callback(null, {
				sunrise_time: new Date(doc.sun_times.sunrise_time),
				sunset_time: new Date(doc.sun_times.sunset_time)
			});
		});
	}
	// updates sun times held in database
	_updateSunTimes(callback) {
		this._requestSunTimes((err, times) => {
			if (err) callback(err, null);
			else {
				WeatherRecord.findAndUpdate({}, {
					sun_times: times
				},
				(err, result) => {
					// if updated successfully, retrieve and callback
					if (!err) {
						this._retrieveSunTimes(callback);
					}
					// if not updated successfully, callback
					else callback(err, null);
				});
			}
		});
	}
	// request sun times from the internets
	_requestSunTimes(callback) {
		let url = 'http://anyorigin.com/go?url=https%3A//www.timeanddate.com/sun/usa/pittsburgh&callback=?';
		request(url, (err, response, body) => {
			let times;
			if (body) {
				let elem = body.match(/\<p class\=dn\-mob\>.*?\<\/p\>/)[0];
				times = elem.match(/\d:\d{2}\s(am|pm)/g);
				times = times.map(t => this._parseSunTime(t));
				// parsing assertions
				if (!(times.length == 2)) err = 'insufficient times found';
				else if (!times[0] || !times[1]) err = 'times could not be parsed';
			}
			if (err) callback(err, null);
			else callback(null, {
				sunrise_time: times[0],
				sunset_time: times[1]
			});
		});
	}
	_parseSunTime(str) {
		try {
			let	numbers = str.match(/\d+/g);
			if (numbers.length != 2) return undefined;

			let	diff = (str.match(/a.?m.?/) ? 0 : 12),
				hours = (parseInt(numbers[0]) + diff) % 24,
				minutes = parseInt(numbers[1]),
				return_date = new Date();

			return_date.setHours(hours);
			return_date.setMinutes(minutes);
			return_date.setSeconds(0);
			return return_date;
		}
		catch(err) {
			return null;
		}
	}

	getHourlyForecast(callback) {

	}
	// check validity of hourly forecast, including up-to-datedness
	_checkHourlyForecast(forecast) {

	}
	// updates weather held in database
	_updateHourlyForecast(callback) {
		
	}
	// retrieves hourly forecast from the database
	_retrieveHourlyForecast(callback) {

	}
	// requests hourly forecast from the internet
	_requestHourlyForecast(callback) {
		let url = 'http://anyorigin.com/go?url=https%3A//weather.com/weather/hourbyhour/l/USPA1290%3A1%3AUS&callback=?';
		request(url, (err, response, body) => {
			if (err) callback(err, null);
			else this._parseHourlyForecast(body, callback);
		});
	}
	// parses hourly forecast from body
	_parseHourlyForecast(body, callback) {
		body = body.replace(/\\/g, '');
		// console.log(body);
		let	table = body.match(/\<table\sclass\=\"twc\-table\"\sclassName\=\"twc\-table\"\>.*?\<\/table\>/)[0],
			// times
			time_elems = table.match(/\d*:00\s(am|pm)/g),
			times = time_elems.map((elem) => {
				return parseInt(elem.match(/\d+/)[0]) + (elem.match('pm') ? 12 : 0);
			}),
			// weather descriptions
			description_elems = table.match(/\<td[ A-z"=-]*?description.*?\<\/td\>/g),
			descriptions = description_elems.map((elem) => {
				let span = elem.match(/\<span\>.*?\<\/span\>/)[0];
				return span.slice(6, span.length - 7);
			}),
			// temperature
			temp_elems = table.match(/class=\"temp\".*?\-?\d+.*?°/g),
			temps = temp_elems.map((elem) => {
				return parseInt(elem.match(/\-?\d+/));
			});
		// match attributes together
		let	attrs = {
			times: times,
			descriptions: descriptions,
			temps: temps
		};
		this._generateHourlyForecast(attrs, callback);
	}

	_generateHourlyForecast(attrs, callback) {
		// check that lengths are matchable
		let keys = Object.keys(attrs),
			matchable = true;
		for (let i = 0; i < keys.length; i++) {
			let key = keys[i];
			if (attrs[key].length != attrs[keys[0]].length) matchable = false;
		}
		if (!matchable) callback('unmatchable attribute lists during hourly forecast parsing');
		else {
			let	hourly_forecast = {
				start_time: null,
				end_time: null,
				forecast: {}
			}
			// match attributes together
			let	attr_length = attrs[keys[0]].length;
			for (let i = 0; i < attr_length; i++) {
				// create time
				let	time = attrs.times[i];
				hourly_forecast.forecast[time] = {
				}
				// add attributes
				for (let j = 0; j < keys.length; j++) {
					let key = keys[j];
					if (key != "times") {
						let value = attrs[key][i];
						hourly_forecast.forecast[time][key.slice(0, key.length - 1)] = value;
					}
				}
			}
			callback(null, hourly_forecast);
		}
	}
}

let weather = new Weather();
// TEST SUITE
// should be able to request new times from the internet
// weather._requestSunTimes((err, times) => {
// 	console.log(err, times);
// });
// should be able to parse hourly forecast
// let body = require('fs').readFileSync('hourly_forecast.html', encoding="utf8");
// weather._parseHourlyForecast(body, (err, hourly_forecast) => {
// 	console.log(err, hourly_forecast);
// });
// should be able to request and parse hourly forecast from the internet
weather._requestHourlyForecast((err, hourly_forecast) => {
	// let fs = require('fs');
	// fs.writeFileSync('hourly_forecast.html', hourly_forecast);
	console.log(hourly_forecast);
});

// const MLAB_URL = 'mongodb://csl-cmu-webmaster:phippsPowerwise1@ds147668.mlab.com:47668/csl-interface';
// const MONGO_CLIENT = require('mongodb').MongoClient;
// global.mongoDB;
// MONGO_CLIENT.connect(MLAB_URL, function(err, client) {
// 	if (err) console.log(err);
// 	else {
// 		global.mongoDB = client;
// 		// DATABASE TEST SUITE
// 		// should be able to update sun times in the database
// 		// weather._updateSunTimes((err, result) => {
// 		// 	console.log(err, result);
// 		// });
// 		// should be able to retrieve sun times from the database
// 		// weather._retrieveSunTimes((err, result) => {
// 		// 	console.log(err, result);
// 		// });
// 		// should be able to get sun times
// 		// weather.getSunTimes((err, result) => {
// 		// 	console.log(err, result);
// 		// });
// 	}
// });

module.exports = weather;