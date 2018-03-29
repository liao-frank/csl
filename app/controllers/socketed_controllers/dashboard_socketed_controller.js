class DashboardSocketedController extends DashboardController {
	constructor() {
		super();
		this.widgeter = require(require('path').resolve() + '/app/models/Widgeter.js');
	}

	dashboard_socket(io, socket) {
		socket.emit("connected", {});
		// WIDGET EVENTS
		// on request
		socket.on('get_widgets', (data) => {
			let category = data.category;
			this.widgeter.getWidgets(category, (err, doc) => {
				if (err || !doc) {
					socket.emit('get_widgets', {
						category: category,
						widgets: null
					});
				}
				else {
					socket.emit('get_widgets', doc);
				}
			});
		});
		// on update
		socket.on('update_widgets', (data) => {
			let	category = data.category,
				widgets = data.widgets;

			if (category && widgets) {
				this.widgeter.updateWidgets(category, widgets, (err, doc) => {
					// if error occurred, return null widgets
					if (err || !doc) {
						socket.emit('update_widgets', {
							category: category,
							widgets: null
						});
					}
					// else, return widgets and broadcast widgets
					socket.emit('update_widgets', doc);
					socket.broadcast.emit('get_widgets', doc);
				});
			}
			else { // failed to provide enough information
				socket.emit('update_widgets', {
					category: null,
					widgets: null
				});
			};
		});
	}
}