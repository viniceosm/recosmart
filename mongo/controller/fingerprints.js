const model = require('./../models/fingerprints')();

const crud = {
    pesquisar: (query, callback) => {
        model.find(query, {})
            .exec((err, fingerprints) => {
                if (err) console.log(err);
                callback(fingerprints);
            });
    },
    pesquisarPopulateCarateristicasFichas: (query, callback) => {
        model.find(query, {})
            .populate('fichas')
            .exec((err, fingerprints) => {
                if (err) console.log(err);
                callback(fingerprints);
            });
    },
    criar: (fields, callback) => {
        model.create(fields, (err, fingerprint) => {
            if (err) console.log(err);
            callback(fingerprint);
        });
    },
    pesquisarPorId: (query, callback) => {
        model.findById(query, (err, fingerprint) => {
            if (err) console.log(err);
            callback(fingerprint);
        });
    },
    pesquisarPorNome: (query, callback) => {
        model.findOne({ nome: query }, (err, fingerprint) => {
            if (err) console.log(err);
            callback(fingerprint);
        });
    },
    adicionarFicha: (fichaId, fingerprintNome, callback) => {
        // Pesquisa pelo "nome" da fingerprint que é a chave
        crud.pesquisarPorNome(fingerprintNome, (fingerprint) => {
            if (fingerprint == undefined) {
                // Se não tiver, grava
                crud.criar({ nome: fingerprintNome }, (fingerprint) => {
                    // faz push da primeira ficha tecnica navegada
                    fingerprint.fichas.push(fichaId);

                    // Salva alterações 
                    fingerprint.save((fingerprint) => {
                        callback(fingerprint);
                    });
                });
            } else {
                var fichaAchada = fingerprint.fichas.find((ficha) => {
                    return (ficha == fichaId);
                });

                var temFicha = (undefined !== fichaAchada);

                // Se tiver verifica se a ficha a inserir já está na array, se não tiver faz push 
                if (fingerprint.fichas.length == 0 || !temFicha) {
                    fingerprint.fichas.push(fichaId);

                    // Salva alterações 
                    fingerprint.save((fingerprint) => {
                        callback(fingerprint);
                    });
                }
            }
        });
    },
    pesquisarPorNomePopulateCarateristicasFichas: (fingerprintNome, callback) => {
        model.find({ nome: fingerprintNome }, {})
            .populate('fichas')
            .exec((err, fingerprints) => {
                if (err) console.log(err);
                callback(fingerprints);
            });
    }
}

module.exports = crud;