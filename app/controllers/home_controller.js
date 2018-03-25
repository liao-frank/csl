class HomeController extends BeanController {
	constructor() {
		super();
	}

	about(req, res) {
		res.render({});
	}

	contact(req, res) {
		res.render({});
	}

	privacy(req, res) {
		res.render({});
	}

	redirect(req, res) {
		res.redirect('/dashboard');
	}
}