class DashboardSocketedController extends DashboardController {
	constructor() {
		super();
	}

	dashboard_socket(io, socket) {
		socket.emit("connected", {});
	}
}