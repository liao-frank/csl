class HomeSocketedController extends HomeController {
	constructor() {
		super();
		this.weather = require(require('path').resolve() + '/app/models/Weather.js');
	}

	about_socket(io, socket) {
		socket.emit("connected", {});
	}

	contact_socket(io, socket) {
		socket.emit("connected", {});
	}

	privacy_socket(io, socket) {
		socket.emit("connected", {});
	}

	// global socket
	redirect_socket(io, socket) {
		// sun times
		socket.on('get_sun_times', () => {
			this.weather.getSunTimes((err, sun_times) => {
				if (err || !sun_times) {
					socket.emit('get_sun_times', {
						sunrise_time: null,
						sunset_time: null
					});
				}
				else {
					socket.emit('get_sun_times', sun_times);
				}
			});
		});
		// weather
		socket.on('get_hourly_forecast', () => {
			this.weather.getHourlyForecast((err, forecast) => {
				socket.emit('get_hourly_forecast', {
					hourly_forecast: forecast || {},
					err: err
				});
			});
		});
	}
}