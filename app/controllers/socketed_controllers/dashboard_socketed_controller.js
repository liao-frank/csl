class DashboardSocketedController extends DashboardController {
	constructor() {
		super();
		this.path = require('path').resolve();
		// dashboard provides dashboard contents
		this._dashboard = require(this.path + '/app/models/Dashboard.js');
		// power_building provides data given a label
		this.living_building = require(this.path + '/app/models/LivingBuilding.js');
		// request-er
		this.request = cli.require('request');
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
			let widget = obj.widget;
			try {
				// PI server access
				if (widget.data_url.match(/https:\/\/128.2.109.159/)) {
					this._getPiServerData(io, socket, widget);
				}
				// Living Building library
				else if (widget.data_url.match(/living_building/)) {
					this._getLivingBuildingData(io, socket, widget);
				}
			} catch(err) {
				console.log(err);
			}	
		});
	}

	sandbox_socket(io, socket) {
		
	}

	_getPiServerData(io, socket, widget) {
		let options = {
			url: widget.data_url,
			auth: {
				user: 'administrator', password: 'cbpdadmin1!@34'
			},
			rejectUnauthorized: false
		};
		this.request(options, function (err, res, body) {
			try {
				if (err) console.log(err);
				else socket.emit('get_data', {
					widget: {
						title: widget ? widget.title : null,
						label: widget ? widget.label : null,
						data: JSON.parse(body)
					}
				});
			} catch(err) {
				console.log(err);
			}	
		});
	}

	_getLivingBuildingData(io, socket, widget) {
		let	data_url = widget.data_url,
			data_label = data_url.match(/#(.+)/)[1],
			responder = (err, obj) => {
						if (err) console.log(err);
						else {
							let data = Array.isArray(obj) ? obj : obj.data;
							let total = data.reduce((sum, elem) => { return sum + elem[1] }, 0);
							socket.emit('get_data', {
								widget: {
									title: widget ? widget.title : null,
									label: widget ? widget.label : null,
									data_label: data_label,
									data: total,
									graph_code: Array.isArray(obj) ? null : obj.graph_code
								}
							});
						}
					};

		switch(data_label) {
			case 'weekly_energy_consumption':
				this.living_building.getData('energy_consumption', {}, responder);
				break;
			case 'monthly_energy_consumption':
				this.living_building.getData('energy_consumption',
					{ time_duration: 'month' },
					responder);
				break;
			case 'yearly_energy_consumption':
				this.living_building.getData('energy_consumption',
					{ time_duration: 'year' },
					responder);
				break;
			case 'weekly_energy_production':
				this.living_building.getData('solar_energy_production', {}, responder);
				break;
			case 'monthly_energy_production':
				this.living_building.getData('solar_energy_production',
					{ time_duration: 'month' },
					responder);
				break;
			case 'yearly_energy_production':
				this.living_building.getData('solar_energy_production',
					{ time_duration: 'year' },
					responder);
				break;
			default:
				console.log('bad data label: ' + data_label);
		}
	}
}