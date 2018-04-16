let request = require('request');
let url = 'https://128.2.109.159/piwebapi/streams/P0-MYhSMORGkyGTe9bdohw0AUjgAAAV0lOLTYyTlBVMkJWTDIwXFBISVBQU19BSFUtMSBPQVQgTU9OSVRPUl9PVVRTSURFIEFJUiBURU1QRVJBVFVSRS5QUkVTRU5UX1ZBTFVF/value';
let options = {
	url: url,
	auth: {
		user: 'administrator',
		password: 'cbpdadmin1!@34'
	},
	rejectUnauthorized: false
};
request(options, function (err, res, body) {
	if (err) console.log(err);
	else {
		console.log(JSON.parse(body));
	}
});