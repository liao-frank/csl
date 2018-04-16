class DashboardController extends BeanController {
	constructor() {
		super();
	}

	dashboard(req, res) {

		res.render({
			__title: 'CSL Dashboard',
			__javascript_tags: `
			<script src="https://code.jquery.com/jquery-3.2.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>
			<script type="text/javascript" src="/socket.io/socket.io.js"></script>
			<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.2/Chart.bundle.js"></script>
			<script type="text/javascript" src="/js/scripts.js"></script>
			<script type="text/javascript" src="/js/dashboard/dashboard.js"></script>`,
			__stylesheet_tags: `
			<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/7.0.0/normalize.min.css">
			<link rel="stylesheet" href="https://unpkg.com/purecss@1.0.0/build/pure-min.css" integrity="sha384-nn4HPE8lTHyVtfCBi5yW9d20FjT8BJwUXyWZT9InLYax14RDjBj46LmSztkmNP9w" crossorigin="anonymous">
			<link rel="stylesheet" type="text/css" href="/css/styles.css">
			<link rel="stylesheet" type="text/css" href="/css/dashboard/dashboard.css">`
		});
	}

	sandbox(req, res) {

		res.render({
			__title: 'Sandbox Mode',
			__javascript_tags: `
			<script src="https://code.jquery.com/jquery-3.2.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>
			<script type="text/javascript" src="/socket.io/socket.io.js"></script>
			<script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.2/Chart.bundle.js"></script>
			<script type="text/javascript" src="/js/scripts.js"></script>
			<script type="text/javascript" src="/js/dashboard/dashboard.js"></script>`,
			__stylesheet_tags: `
			<link rel="stylesheet" type="text/css" href="https://cdnjs.cloudflare.com/ajax/libs/normalize/7.0.0/normalize.min.css">
			<link rel="stylesheet" type="text/css" href="/css/styles.css">
			<link rel="stylesheet" type="text/css" href="/css/dashboard/dashboard.css">`
		});
	}
}