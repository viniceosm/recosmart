const express = require('express');
let router = express.Router();

const sessions = require('express-session');
const cookieParser = require('cookie-parser');
const KEY = 'chaaaaaaaaaaaave';
const SECRET = 'seeeeeeeeeeeegredoo';
const cookie = cookieParser(SECRET);
let store = new sessions.MemoryStore();
const varGlobal = require('./../libs/varGlobal');
let funcoes = require('./../util/util');

let sessionMiddleware = sessions({
	secret: SECRET,
	name: KEY,
	resave: true,
	saveUninitialized: true,
	store: store
});

router.use(cookie);
router.use(sessionMiddleware);

const cCelulares = require('./../mongo/controller/celulares');
const cFingerPrints = require('./../mongo/controller/fingerprints');

router.get('/', (req, res) => {
	let session = req.session;
	session.exist = true;

	let paginacao = retornaPaginacao();
	
	cCelulares.pesquisar({}, (celulares) => {
		res.render('home', {
			title: varGlobal.tituloPagina,
			celulares,
			pesquisaveis: funcoes.pesquisaveis(),
			paginacao
		});
	}, 10, 0);
});

router.get('/pagina/:pagina', (req, res) => {
	let session = req.session;
	session.exist = true;
	
	paginaAtual = parseInt(req.params.pagina);
	let paginacao = retornaPaginacao(paginaAtual);
	
	cCelulares.pesquisar({}, (celulares) => {
		res.render('home', {
			title: varGlobal.tituloPagina,
			celulares,
			pesquisaveis: funcoes.pesquisaveis(),
			paginacao
		});
	}, 10, (parseInt(req.params.pagina) - 1) * 10);
});

function retornaPaginacao(paginaAtual = 1) {
	let paginacao = [];

	if (paginaAtual > 1) {
		paginacao.push({ numero: paginaAtual -1, class: '' });
	}

	paginacao.push({ numero: paginaAtual, class: 'active' });
	paginacao.push({ numero: paginaAtual + 1, class: '' });

	return paginacao;
}

router.get('/historico', (req, res) => {
	cFingerPrints.pesquisarPopulateCarateristicasFichas({}, (celulares) => {
		res.render('historico', {
			title: varGlobal.tituloPagina,
			celulares: celulares.fichas,
		});
	}, 10, 0);
});

router.post('/pesquisa', (req, res) => {
	let session = req.session;
	if (session.exist) {
		session.pesquisa = req.body;
	} else {
		res.redirect('/');
	}

	res.redirect('/pesquisa');
});

router.get('/pesquisa/:pagina?', (req, res) => {
	let session = req.session;
	if (session.exist) {
		let pesquisa = session.pesquisa;
		let or = [];
		
		funcoes.addOr(or, 'sistema_operacional', pesquisa.chksistema_operacional);
		funcoes.addOr(or, 'marca', pesquisa.chkmarca);
		funcoes.addOr(or, 'resistencia_a_agua', pesquisa.chkresistencia_a_agua);
		funcoes.addOr(or, 'ram', pesquisa.chkram);
		funcoes.addOr(or, 'memoria_max', pesquisa.chkmemoria_max);
		funcoes.addOr(or, 'memoria_expansivel', pesquisa.chkmemoria_expansivel);
		funcoes.addOr(or, 'polegadas', pesquisa.chkpolegadas);
		funcoes.addOr(or, 'resolucao', pesquisa.chkresolucao);
		funcoes.addOr(or, 'densidade_de_pixels', pesquisa.chkdensidade_de_pixels);
		funcoes.addOr(or, 'megapixel', pesquisa.chkmegapixel);
		funcoes.addOr(or, 'camera_frontal', pesquisa.chkcamera_frontal);
		funcoes.addOr(or, 'camera_frontal', pesquisa.chkcamera_frontal);
		funcoes.addOr(or, 'USB', pesquisa.chkUSB);

		let query = {};
		if (or.length > 0) {
			query = { $or: or };
		}

		paginaAtual = (req.params.pagina == undefined) ? 1 : parseInt(req.params.pagina);
		let paginacao = retornaPaginacao(paginaAtual);
		
		cCelulares.pesquisar(query, (celulares) => {
			res.render('pesquisa', {
				title: varGlobal.tituloPagina,
				celulares,
				pesquisaveis: funcoes.pesquisaveis(),
				paginacao
			});
		}, 10, (paginaAtual - 1) * 10);
	} else {
		res.redirect('/');
	}
});

router.get('/ficha/:idFicha', (req, res) => {
	cCelulares.pesquisarPorId(req.params.idFicha, (ficha) => {
		res.render('ficha', {
			title: varGlobal.tituloPagina,
			ficha
		});
	});
});

router.get('/cadastro', (req, res) => {
	res.render('cadastro', { title: varGlobal.tituloPagina });
});

module.exports = {
	router,
	sessionMiddleware
};
