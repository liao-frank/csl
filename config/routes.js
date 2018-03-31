class AppRouter extends BeanRouter {
	// METHOD('PATH', 'CONTROLLER#ACTION');
	use() {
		this.get('/about', 'home#about');
		this.get('/contact', 'home#contact');
		this.get('/privacy', 'home#privacy');
		this.get('/', 'home#redirect'); // add raw route

		this.get('/dashboard', 'dashboard#dashboard');
		this.get('/sandbox', 'dashboard#sandbox');


		// prepare mongoDB
		// const LOCAL_DB_URL = 'mongodb://localhost:27017';
		const MLAB_URL = 'mongodb://csl-cmu-webmaster:phippsPowerwise1@ds147668.mlab.com:47668/csl-interface';
		const MONGO_CLIENT = cli.require('mongodb').MongoClient;
		global.mongoDB;

		// Use connect method to connect to the MongoDB server
		MONGO_CLIENT.connect(MLAB_URL, function(err, client) {
			if (err) console.log(err);
			else {
				console.log('Connected to mlab')
				// global.mongoDB = client.db('test'); // Make reference to local db globally available.
				global.mongoDB = client; // Make reference to external db globally available.
			}
		});
	}
}