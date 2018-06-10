const model = require('./../models/celulares')();

const crud = {
    pesquisar: (query, callback, limit, offset) => {
        if (limit == undefined) {
            model.find(query, {})
                .exec((err, celulares) => {
                    if (err) console.log(err);
                    callback(celulares);
                });
        } else {
            model.find(query, {})
                .limit(limit)
                .skip(offset)
                .exec((err, celulares) => {
                    if (err) console.log(err);
                    callback(celulares);
                });
        }
    },
    logar: (query, callback) => {
        model.find(query, {}, (err, celulares) => {
            if (err) console.log(err);
            if (celulares.length == 1) {
                callback(true, celulares[0]);
            } else {
                callback(false);
            }
        });
    },
    criar: (fields, callback) => {
        model.create(fields, (err, celular) => {
            if (err) console.log(err);
            callback();
        });
    },
    pesquisarPorId: (query, callback) => {
        model.findById(query, (err, celular) => {
            if (err) console.log(err);
            callback(celular);
        });
    },
    pesquisarPorNome: (query, callback) => {
        model.findOne({ nome: query }, (err, celular) => {
            if (err) console.log(err);
            callback(celular);
        });
    }
}

module.exports = crud;