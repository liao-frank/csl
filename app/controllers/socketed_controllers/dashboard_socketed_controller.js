class DashboardSocketedController extends DashboardController {
	constructor() {
		super();
		this.path = require('path').resolve();
		// dashboard provides dashboard contents
		this._dashboard = require(this.path + '/app/models/Dashboard.js');
		// power_building provides data given a label
		this.living_building = require(this.path + '/app/models/LivingBuilding.js');
	}

	dashboard_socket(io, socket) {
		socket.emit("connected", {});
		// WIDGET EVENTS
		// on request
		socket.on('get_dashboard', (data) => {
			let category = data.category;
			this._dashboard.getDashboard(category, (err, doc) => {
				// if error, send back null and error
				if (err || !doc) {
					socket.emit('get_dashboard', {
						dashboard: null,
						err: err
					});
				}
				// else send back dashboard
				else {
					delete doc._id;
					socket.emit('get_dashboard', {
						dashboard: doc
					});
				}
			});
		});
		// on update
		socket.on('update_dashboard', (data) => {
			let	category = data.dashboard.category;
			this._dashboard.updateDashboard(category, data.dashboard, (err, doc) => {
				// if error occurred, return null widgets
				if (err || !doc) {
					socket.emit('update_dashboard', {
						dashboard: null,
						err: err
					});
				}
				// else, return widgets and broadcast widgets
				else {
					delete doc._id;
					socket.emit('update_dashboard', {
						dashboard: doc
					});
					socket.broadcast.emit('get_dashboard', {
						dashboard: doc
					});
				}
			});
		});
		// on get data
		socket.on('get_data', (obj) => {
			// let	label = obj.label,
			// 	options = obj.options;

			// this.living_building.getData(label, options, (err, data) => {
			// 	socket.emit('get_data', {
			// 		label: label,
			// 		data: data
			// 	});
			// });
		});
	}

	sandbox_socket(io, socket) {
		
	}
}