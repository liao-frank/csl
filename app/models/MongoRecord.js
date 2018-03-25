class MongoRecord {
	getDoc(callback) {
		this.constructor.retrieve(this.mongo_id, callback);
	}

	updateDoc(doc, callback) {
		this.constructor.update(this.mongo_id, doc, callback);
	}

	static new(doc, callback) {
		global.mongoDB.collection(this.collection_name).insertOne(doc, (err, result) => {
			// handle global.mongoDB errors
			if (err) callback(err, null);
			// successful creation
			else {
				callback(null, result.ops[0]);
			}
		});
	}

	static find(query, callback) {
		// send query to database
		global.mongoDB.collection(this.collection_name).findOne(query, (err, doc) => {
			// handle global.mongoDB errors
			if (err) callback(err, null);
			// successful retrieval
			else callback(null, doc);
		});
	}

	static findMany(query, callback) {
		// send query to database
		global.mongoDB.collection(this.collection_name).find(query, (err, cursor) => {
			// handle global.mongoDB errors
			if (err) callback(err, null);
			// successful retrieval
			else {
				cursor.toArray(callback);
			}
		});
	}

	static retrieve(mongo_id, callback) {
		let query = { _id: mongo_id };
		// send query to database
		global.mongoDB.collection(this.collection_name).findOne(query, (err, doc) => {
			// handle global.mongoDB errors
			if (err) callback(err, null);
			// successful retrieval
			else callback(null, doc);
		});
	}

	static findAndUpdate(filter, doc, callback) {
		// send update request to database
		global.mongoDB.collection(this.collection_name).updateOne(filter,
			{ $set: doc },
			function(err, result) {
				// handle global.mongoDB errors
				if (err) callback(err, null);
				// successful update
				else callback(null, result.result);
			});
	}

	static findManyAndUpdate(filter, doc, callback) {
		// send update request to database
		global.mongoDB.collection(this.collection_name).updateMany(filter,
			{ $set: doc },
			function(err, result) {
				// handle global.mongoDB errors
				if (err) callback(err, null);
				// successful update
				else callback(null, result.result);
			});
	}

	static update(mongo_id, doc, callback) {
		let filter = { _id: mongo_id };
		// send update request to database
		global.mongoDB.collection(this.collection_name).updateOne(filter,
			doc,
			function(err, result) {
				// handle global.mongoDB errors
				if (err) callback(err, null);
				// successful update
				else callback(null, result.result);
			});
	}

	static remove(mongo_id, callback) {
		// TODO basic remove? Should be overwritten by subclass
	}
}

module.exports = MongoRecord;