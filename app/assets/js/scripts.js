let	socket = io(window.location.pathname),
	global_socket = io('/');
socket.on("connected", function() {
	let opts = socket.io.opts;
	console.log(`${ opts.secure ? "Secure" : "Non-secure" } socket connection established at "${ opts.hostname + opts.path }" on port ${ opts.port }.`);
});
// DEFINE GLOBAL SOCKET EVENTS
(function() {
	global_socket.on('get_sun_times', (sun_times) => {
		let	sunrise_time = new Date(sun_times.sunrise_time),
			sunset_time = new Date(sun_times.sunset_time),
			now = new Date();
		if (!sunrise_time && !sunset_time) {
			log(`'get_sun_times' event received w/ bad data\n`, sun_times);
			return;
		}
		// render things
		if (now > sunset_time) { // if past sunset, render
			activateSunTimeNight();
		}
		else { // if not past sunset, queue sunset
			// console.log('queued sunset');
			queueAction(() => {
				activateSunTimeNight();
			}, sunset_time - now);
			if (now > sunrise_time) { // if past sunrise, render
				activateSunTimeDay();
			}
			else { // if not past sunrise, queue sunrise and render night
				// console.log('queued sunrise');
				queueAction(() => {
					activateSunTimeDay();
				}, sunrise_time - now);
				activateSunTimeNight();
			}
		}
		// set timer for next request
		let tomorrow = new Date;
		tomorrow.setDate(now.getDate() + 1);
		tomorrow.setHours(5);
		tomorrow.setMinutes(30);
		queueAction(() => {
			log('updating sun times...');
			global_socket.emit('get_sun_times', {});
		}, tomorrow - now);
	});
	global_socket.on('get_hourly_forecast', (obj) => {
		let	hourly_forecast = obj.hourly_forecast,
			forecast = hourly_forecast && hourly_forecast.forecast,
			start_time = hourly_forecast && hourly_forecast.start_time && new Date(hourly_forecast.start_time),
			end_time = hourly_forecast && hourly_forecast.end_time && new Date(hourly_forecast.end_time),
			now = new Date();
		if (hourly_forecast.err) log(err, hourly_forecast);
		else if (!forecast || !start_time || !end_time || (end_time < now)) {
			log(`'get_hourly_forecast' event received w/ bad data\n`, hourly_forecast);
		}
		else {
			// find the appropriate forecast for now
			for (let key in forecast) {
				let	time = new Date(key),
					weather = forecast[key].description,
					time_diff = time - now;
				// render now
				if (time_diff < 0 && time_diff > -3600000) {
					activateWeather(weather);
				}
				// queue all other forecasts
				else if (time_diff > 0) {
					queueAction(() => {
						activateWeather(weather);
					}, time_diff);
				}
			}
			// queue forecast update
			queueAction(() => {
				log('updating hourly forecast...');
				global_socket.emit('get_hourly_forecast', {});
			}, end_time.getTime() - now.getTime() + 600000);
		}
	});
})();
// DEFINE INITIAL GLOBAL SOCKET EMITS
$(document).ready(function() {
	global_socket.emit('get_sun_times', {});
	global_socket.emit('get_hourly_forecast', {});
	activateSunTimeDay();
});

// dynamic activation functions
$(window).on('load', function() {
	$('.no-initial-transition').removeClass('no-initial-transition');
});
const sun_time_transition = 'all 10s ease';
const weather_transition = 'all 0.7s ease';
function activateSunTimeDay() {
	let $sun_time = $('.sun-time'),
		$sun_time_day = $('.sun-time-day'),
		$sun_time_night = $('.sun-time-night');

	$sun_time.css('transition', sun_time_transition);	
	$sun_time_day.addClass('sun-time-active');
	$sun_time_night.removeClass('sun-time-active');
}
function activateSunTimeNight() {
	let $sun_time = $('.sun-time'),
		$sun_time_day = $('.sun-time-day'),
		$sun_time_night = $('.sun-time-night');
	$sun_time.css('transition', sun_time_transition);
	$sun_time_day.removeClass('sun-time-active');
	$sun_time_night.addClass('sun-time-active');
}

// weather activation functions
function activateWeather(forecast) {
	const weather_patterns = {
		'thunderstorm': /Thunderstorm/i,
		'wintry-mix': /(Snow|Rain).*(Snow|Rain)/i,
		'snow': /Snow/i,
		'rain': /Rain/i,
		'showers': /Showers/i
	};
	let	$all_weather = $('.weather'),
		$current_weather;
	// find correct elements
	for (let key of Object.keys(weather_patterns)) {
		let re = weather_patterns[key];
		if (forecast.match(re)) {
			$current_weather = $('.weather-' + key);
			break;
		}
	}
	$all_weather.css('transition', weather_transition);
	// deactivate all weather
	$all_weather.removeClass('weather-active');
	// if precipitation, render overcast and precipitation
	if ($current_weather) {
		$current_weather.addClass('weather-active');
		$('.weather-overcast').addClass('weather-active'); // assuming all the weather patterns need a cloud
	}
	// if not precipitation, check cloudiness
	else {
		// if cloudy, not partly, overcast
		if (forecast.match(/Cloud/i) && !forecast.match(/Part/i) && !forecast.match(/Most/i)) $('.weather-overcast').addClass('weather-active');
		else if (forecast.match(/Cloud/i)) $('.clouds').addClass('weather-active');
	}
}

/* Core functions */
function log(msg, obj) {
	let output = `${(new Date).toLocaleString().match(/\d+\:\d+\:\d+ (PM|AM)/)[0]}: ${msg}`;
	if (obj) {
		output += `\n`;
		console.log(output, obj);
	}
	else console.log(output);
}
function setCookie(cname, cvalue, exdays) {
	var d = new Date();
	d.setTime(d.getTime() + (exdays*24*60*60*1000));
	var expires = "expires="+ d.toUTCString();
	document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
	var name = cname + "=";
	var decodedCookie = decodeURIComponent(document.cookie);
	var ca = decodedCookie.split(';');
	for(var i = 0; i <ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return "";
}
function queueAction(action, timeout, check_duration=60000) {
	let	now = new Date(),
		interval;
	timeout = new Date(now.getTime() + timeout);

	interval = setInterval(() => {
		let now = new Date();
		// if ready, action, then unqueue
		if (now > timeout) {
			action();
			clearInterval(interval);
		}
	}, check_duration);
}