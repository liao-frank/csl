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
		socket.on('request_sun_times', () => {
			this.weather.getSunTimes((err, sun_times) => {
				socket.emit('response_sun_times', sun_times);
			});
		});
	}
}