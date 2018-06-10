module.exports = function () {
    let db = require('./../../libs/connect-db')();
    let Schema = require('mongoose').Schema;

    return db.model('fingerprints', Schema({
        nome: String,
        fichas: [{ type: Schema.Types.ObjectId, ref: 'celulares' }],
        date: { type: Date, default: Date.now },
        status: { type: Boolean, default: true }
    },
    {
        usePushEach: true
    } ));
}
