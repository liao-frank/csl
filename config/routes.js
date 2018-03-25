class AppRouter extends BeanRouter {
	// METHOD('PATH', 'CONTROLLER#ACTION');
	use() {
		this.get('/about', 'home#about');
		this.get('/contact', 'home#contact');
		this.get('/privacy', 'home#privacy');
		this.get('/', 'home#redirect'); // add raw route

		this.get('/dashboard', 'dashboard#dashboard');
		
	}
}