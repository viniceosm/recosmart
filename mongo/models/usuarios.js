module.exports = function(){
	let db = require('./../../libs/connect-db')();
	let Schema = require('mongoose').Schema;

	return db.model('usuario', Schema({
		nome: String,
		senha: String,
		date: { type: Date, default: Date.now },
		status: { type: Boolean, default: true }
	}));
}
