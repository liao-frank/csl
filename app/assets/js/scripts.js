let	socket = io(window.location.pathname),
	global_socket = io('/');
socket.on("connected", function() {
	let opts = socket.io.opts;
	console.log(`${ opts.secure ? "Secure" : "Non-secure" } socket connection established at "${ opts.hostname + opts.path }" on port ${ opts.port }.`);
});
// DEFINE GLOBAL SOCKET EVENTS
(function() {
	global_socket.on('response_sun_times', (sun_times) => {
		let	sunrise_time = new Date(sun_times.sunrise_time),
			sunset_time = new Date(sun_times.sunset_time),
			now = new Date();
		// render things
		let $sun_time_day = $('.sun-time-day'),
			$sun_time_night = $('.sun-time-night');
		if (now > sunrise_time && now < sunset_time) {

			$sun_time_day.addClass('sun-time-active');
			$sun_time_night.removeClass('sun-time-active');
			setTimeout(() => {
				$sun_time_day.removeClass('no-initial-transition');
				$sun_time_night.removeClass('no-initial-transition');
			}, 0);
		} else {
			$sun_time_day.removeClass('sun-time-active');
			$sun_time_night.addClass('sun-time-active');
			setTimeout(() => {
				$sun_time_day.removeClass('no-initial-transition');
				$sun_time_night.removeClass('no-initial-transition');
			}, 0);
		}
		// set timer for next request
		let tomorrow = new Date;
		tomorrow.setDate(now.getDate() + 1);
		tomorrow.setHours(5);
		setTimeout(() => {
			global_socket.emit('request_sun_times', {});
		}, tomorrow - now);
	});
})();
// DEFINE GLOBAL SOCKET EMITS
$(document).ready(function() {
	global_socket.emit('request_sun_times', {});
});

// cookie functions
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