let io;
const bayes = require('classificator');
const classifier = bayes();
const dadosCelulares = require('./celulares');

module.exports = function (_io) {
	io = _io;

	io.sockets.on('connection', function (socket) {
		socket.on('pesquisarRecomendados', (caracteristicasPesquisa) => {
			let classificado = pesquisarRecomendados(caracteristicasPesquisa);

			io.sockets.emit('retornoPesquisarRecomendados', classificado);
		});
	});
};

function pesquisarRecomendados(caracteristicasPesquisa) {
	dadosCelulares.forEach(element => classifier.learn(element.caracteristicas.replace(/\./g, 'V'), element.nome));

	let classificado = classifier.categorize(caracteristicasPesquisa.replace(/\./g, 'V'));

	classificado.likelihoods = classificado.likelihoods.map((recomendado) => {
		let { caracteristicas, imagem } = dadosCelulares.find(o => o.nome == recomendado.category);

		recomendado = {
			...recomendado, 
			imagem,
			caracteristicas: destacaAchadosMostra(caracteristicas, caracteristicasPesquisa)
		};

		return recomendado;
	});
	
	return classificado;
}

function destacaAchadosMostra(caracteristicas, pesquisa) {
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

			iInicioPalavra = caracteristicasNova.indexOf(palavra);

			caracteristicasNova = caracteristicasNova.substring(0, iInicioPalavra) +
				'<font color="red">' +
				caracteristicasNova.substring(iInicioPalavra, palavra.length + iInicioPalavra) +
				'</font>' +
				caracteristicasNova.substring(palavra.length + iInicioPalavra);
		}
	}

	caracteristicasNova = palavrasAchadas.join('<br>') + '<hr>' + caracteristicasNova;

	return caracteristicasNova;
}

function destacaAchados(caracteristicas, pesquisa) {
	palavras = pesquisa.split(', ');
	caracteristicasNova = caracteristicas;

	for (palavra of palavras) {
		// Se a palavra pesquisada estiver nas caracteristicas deixa fonte vermelha
		if (caracteristicasNova.toLowerCase().indexOf(', ' + palavra.toLowerCase() + ',') >= 0 ||
			caracteristicasNova.toLowerCase().indexOf(palavra.toLowerCase() + ',') >= 0 ||
			caracteristicasNova.toLowerCase().indexOf(', ' + palavra.toLowerCase()) >= 0 ||
			caracteristicasNova.toLowerCase().indexOf(', ' + palavra.toLowerCase()) >= 0 ||
			caracteristicasNova.toLowerCase().indexOf(palavra.toLowerCase()) >= 0
				) {
			iInicioPalavra = caracteristicasNova.indexOf(palavra);

			caracteristicasNova = caracteristicasNova.substring(0, iInicioPalavra) +
				'<font color="red">' +
				caracteristicasNova.substring(iInicioPalavra, palavra.length + iInicioPalavra) +
				'</font>' +
				caracteristicasNova.substring(palavra.length + iInicioPalavra);
		}
	}

	return caracteristicasNova;
}