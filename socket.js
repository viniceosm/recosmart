let io;
const bayes = require('classificator');
const classifier = bayes();
const dadosCelulares = require('./celulares');
let funcoes = require('./util/util');

const cFingerPrints = require('./mongo/controller/fingerprints');
const cCelulares = require('./mongo/controller/celulares');

module.exports = function (_io) {
	io = _io;
	
	io.sockets.on('connection', function (socket) {
		socket.on('pesquisarRecomendados', (fingerprintNome) => {
			if (socket.request.session.recomendados !== undefined) {
				socket.emit('retornoPesquisarRecomendados', socket.request.session.recomendados);
			} else {
				cFingerPrints.pesquisarPorNome(fingerprintNome, (fingerprint) => {
					if (fingerprint !== undefined && fingerprint !== null)
						socket.emit('retornoPesquisarRecomendados', fingerprint.recomendados);
				});
			}
		});
		
		socket.on('adicionaFichaHistorico', (fichaId, fingerprintNome) => {
			cFingerPrints.adicionarFicha(fichaId, fingerprintNome, (fingerprint) => {
				alteraRecomendados(socket, fingerprintNome);
			});
		});
		
		socket.on('pesquisarHistorico', (fingerprintNome) => {
			cFingerPrints.pesquisarPorNomePopulateCarateristicasFichas(fingerprintNome, (fingerprint) => {
				if (fingerprint !== undefined) {
					socket.emit('retornoPesquisarHistorico', fingerprint.fichas);
				}
			});
		});
		
		socket.on('deletaHistorico', (fichaId, fingerprintNome) => {
			cFingerPrints.deletaHistorico(fichaId, fingerprintNome, (fingerprint) => {
				socket.emit('retornoDeletaHistorico', fichaId);
				alteraRecomendados(socket, fingerprintNome);
			});
		});
	});
};

function alteraRecomendados(socket, fingerprintNome) {
	// Pega as caracteristicas da ficha
	cFingerPrints.pesquisarPorNomePopulateCarateristicasFichas(fingerprintNome, (fingerprint) => {
		let caracteristicasPesquisa = '';

		caracteristicasPesquisa = fingerprint.fichas.reduce((acc, o, i) => {
			return acc + (i > 0 ? ', ' : '') + o.caracteristicas;
		}, '');

		pesquisarRecomendados(caracteristicasPesquisa, (classificado) => {
			//salva na session
			socket.request.session.recomendados = classificado;

			//salva no mongo
			cFingerPrints.substituiRecomendados(classificado, fingerprintNome, () => {
			});
		});
	});
}

function pesquisarRecomendados(caracteristicasPesquisa, callback) {
	cCelulares.pesquisar({}, (celulares) => {
		celulares.forEach(element => classifier.learn(element.caracteristicas, element.nome));

		let classificado = classifier.categorize(caracteristicasPesquisa);

		classificado.likelihoods = classificado.likelihoods.map((recomendado) => {
			let celularEncontrado = celulares.find(o => o.nome == recomendado.category);
			
			recomendado = {
				...recomendado,
				...celularEncontrado._doc
				// , motivo: mostraMotivo(celularEncontrado.caracteristicas, caracteristicasPesquisa)
			};
			
			return recomendado;
		});

		callback(classificado);
	});
}

function mostraMotivo(caracteristicas, pesquisa) {
	palavras = pesquisa.split(', ');
	caracteristicasNova = caracteristicas;
	palavrasAchadas = [];

	for (palavra of palavras) {
		// Se a palavra pesquisada estiver nas caracteristicas deixa fonte vermelha
		if (caracteristicasNova.toLowerCase().indexOf(', ' + palavra.toLowerCase() + ',') >= 0 ||
			caracteristicasNova.toLowerCase().indexOf(palavra.toLowerCase() + ',') >= 0 ||
			caracteristicasNova.toLowerCase().indexOf(', ' + palavra.toLowerCase()) >= 0 ||
			caracteristicasNova.toLowerCase().indexOf(', ' + palavra.toLowerCase()) >= 0 ||
			caracteristicasNova.toLowerCase().indexOf(palavra.toLowerCase()) >= 0
				) {
			palavrasAchadas.push(palavra);
		}
	}

	caracteristicasNova = palavrasAchadas.join(', ');

	return caracteristicasNova;
}