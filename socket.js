let io;
const bayes = require('classificator');
const classifier = bayes();
const dadosCelulares = require('./celulares');

const cFingerPrints = require('./mongo/controller/fingerprints');

module.exports = function (_io) {
	io = _io;

	io.sockets.on('connection', function (socket) {
		socket.on('pesquisarRecomendados', (fingerprintNome) => {
			// Pega as caracteristicas da ficha
			cFingerPrints.pesquisarPopulateCarateristicasFichas(fingerprintNome, (fingerprints) => {
				
				let caracteristicasPesquisa = '';

				fingerprints.map(fingerprint => {
					caracteristicasPesquisa += fingerprint.fichas.reduce((acc, o, i) => {
						return acc + (i > 0 ? ', ' : '') + o.caracteristicas;
					}, '');
				});
				
				let classificado = pesquisarRecomendados(caracteristicasPesquisa);
				
				io.sockets.emit('retornoPesquisarRecomendados', classificado);
			});
		});
		
		socket.on('adicionaFichaHistorico', (fichaId, fingerprintNome) => {
			cFingerPrints.adicionarFicha(fichaId, fingerprintNome, (fingerprint) => {
			});
		});
	});
};

function pesquisarRecomendados(caracteristicasPesquisa) {
	dadosCelulares.forEach(element => classifier.learn(element.caracteristicas.replace(/\./g, 'V'), element.nome));

	let classificado = classifier.categorize(caracteristicasPesquisa.replace(/\./g, 'V'));

	classificado.likelihoods = classificado.likelihoods.map((recomendado) => {
		let celularEncontrado = dadosCelulares.find(o => o.nome == recomendado.category);

		recomendado = {
			...recomendado, 
			...celularEncontrado,
			motivo: mostraMotivo(celularEncontrado.caracteristicas, caracteristicasPesquisa)
		};

		return recomendado;
	});
	
	return classificado;
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