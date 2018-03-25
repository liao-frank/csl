class HomeSocketedController extends HomeController {
	constructor() {
		super();
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
}