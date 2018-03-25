class HomeController extends BeanController {
	constructor() {
		super();
	}

	about(req, res) {
		res.render({
			__title: 'About the CSL',
			__javascript_tags: `
			<script src="https://code.jquery.com/jquery-3.2.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>
			<script type="text/javascript" src="/socket.io/socket.io.js"></script>
			<script type="text/javascript" src="/js/scripts.js"></script>
			<script type="text/javascript" src="/js/home/home_about.js"></script>`,
			__stylesheet_tags: `
			<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/7.0.0/normalize.min.css">
			<link rel="stylesheet" type="text/css" href="/css/styles.css">
			<link rel="stylesheet" type="text/css" href="/css/home/home_about.css">`
		});
	}

	contact(req, res) {
		res.render({
			__title: 'Contact us',
			__javascript_tags: `
			<script src="https://code.jquery.com/jquery-3.2.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>
			<script type="text/javascript" src="/socket.io/socket.io.js"></script>
			<script type="text/javascript" src="/js/scripts.js"></script>
			<script type="text/javascript" src="/js/home/home_contact.js"></script>`,
			__stylesheet_tags: `
			<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/7.0.0/normalize.min.css">
			<link rel="stylesheet" type="text/css" href="/css/styles.css">
			<link rel="stylesheet" type="text/css" href="/css/home/home_contact.css">`
		});
	}

	privacy(req, res) {
		res.render({
			__title: 'Privacy Policy',
			__javascript_tags: `
			<script src="https://code.jquery.com/jquery-3.2.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>
			<script type="text/javascript" src="/socket.io/socket.io.js"></script>
			<script type="text/javascript" src="/js/scripts.js"></script>
			<script type="text/javascript" src="/js/home/home_privacy.js"></script>`,
			__stylesheet_tags: `
			<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/7.0.0/normalize.min.css">
			<link rel="stylesheet" type="text/css" href="/css/styles.css">
			<link rel="stylesheet" type="text/css" href="/css/home/home_privacy.css">`
		});
	}

	redirect(req, res) {
		res.redirect('/dashboard');
	}
}